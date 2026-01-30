import { exec } from 'child_process';
import { promisify } from 'util';
import { PortInfo } from './types';

const execAsync = promisify(exec);

/**
 * 端口服务 - 负责端口信息的获取和进程管理
 */
export class PortService {
  /**
   * 获取所有端口信息
   */
  async getAllPorts(): Promise<PortInfo[]> {
    try {
      // 使用 netstat -ano 获取端口信息
      const { stdout } = await execAsync('netstat -ano');
      return this.parseNetstatOutput(stdout);
    } catch (error) {
      console.error('Failed to get ports:', error);
      return [];
    }
  }

  /**
   * 解析 netstat 输出
   */
  private parseNetstatOutput(output: string): PortInfo[] {
    const lines = output.split('\n');
    const ports: PortInfo[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // 跳过空行和标题行
      if (!trimmed || 
          trimmed.startsWith('Active') || 
          trimmed.startsWith('Proto') ||
          trimmed.includes('活动连接') ||
          trimmed.includes('协议')) {
        continue;
      }

      // 分割行，处理多个空格
      const parts = trimmed.split(/\s+/);
      
      // 至少需要 4 个部分：协议、本地地址、外部地址、状态/PID
      if (parts.length < 4) {
        continue;
      }

      try {
        const protocol = parts[0].toUpperCase();
        
        // 只处理 TCP 和 UDP
        if (protocol !== 'TCP' && protocol !== 'UDP') {
          continue;
        }

        const [localAddress, localPort] = this.parseAddress(parts[1]);
        const [foreignAddress, foreignPort] = this.parseAddress(parts[2]);
        
        let state = '';
        let pid = 0;

        if (protocol === 'TCP') {
          // TCP: Proto Local Foreign State PID
          state = parts[3];
          pid = parseInt(parts[4], 10);
        } else {
          // UDP: Proto Local Foreign *:* PID
          state = 'UDP';
          pid = parseInt(parts[3], 10);
        }

        // 验证 PID
        if (isNaN(pid) || pid === 0) {
          continue;
        }

        ports.push({
          protocol: protocol as 'TCP' | 'UDP',
          localAddress,
          localPort,
          foreignAddress: foreignAddress || '*',
          foreignPort,
          state,
          pid,
          processName: '' // 稍后填充
        });
      } catch (error) {
        // 跳过解析失败的行
        console.debug('Failed to parse line:', trimmed, error);
        continue;
      }
    }

    console.log(`✅ Parsed ${ports.length} ports`);
    return ports;
  }

  /**
   * 解析地址和端口
   */
  private parseAddress(addr: string): [string, number] {
    const lastColon = addr.lastIndexOf(':');
    if (lastColon === -1) {
      return [addr, 0];
    }
    
    const address = addr.substring(0, lastColon);
    const port = parseInt(addr.substring(lastColon + 1), 10);
    
    return [address, isNaN(port) ? 0 : port];
  }

  /**
   * 根据 PID 获取进程名（批量优化版本）
   */
  async getProcessName(pid: number): Promise<string> {
    try {
      // 使用 wmic 更快
      const { stdout } = await execAsync(`wmic process where ProcessId=${pid} get Name /format:list`);
      const match = stdout.match(/Name=(.+)/);
      return match ? match[1].trim() : 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  /**
   * 批量获取进程名（性能优化）
   */
  async getProcessNames(pids: number[]): Promise<Map<number, string>> {
    const processMap = new Map<number, string>();
    
    try {
      // 一次性获取所有进程信息
      const { stdout } = await execAsync('wmic process get ProcessId,Name /format:csv');
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 3) {
          const name = parts[1]?.trim();
          const pid = parseInt(parts[2]?.trim(), 10);
          if (name && !isNaN(pid)) {
            processMap.set(pid, name);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get process names:', error);
    }
    
    return processMap;
  }

  /**
   * 结束进程
   */
  async killProcess(pid: number): Promise<{ success: boolean; needsAdmin?: boolean; error?: string }> {
    try {
      // 首先尝试普通权限结束进程
      // 使用 chcp 65001 设置 UTF-8 编码，避免中文乱码
      await execAsync(`chcp 65001 > nul && taskkill /F /PID ${pid}`, { encoding: 'utf8' });
      return { success: true };
    } catch (error: any) {
      // 解码错误信息（处理可能的编码问题）
      let errorMessage = '';
      try {
        if (error.stderr) {
          // 尝试从 stderr 获取错误信息
          errorMessage = error.stderr.toString('utf8');
        } else if (error.stdout) {
          errorMessage = error.stdout.toString('utf8');
        } else {
          errorMessage = error.message || error.toString();
        }
      } catch (decodeError) {
        errorMessage = error.message || error.toString();
      }
      
      console.log('Kill process error:', errorMessage);
      
      // 检查是否是权限问题（支持中英文）
      const isAccessDenied = 
        errorMessage.includes('拒绝访问') || 
        errorMessage.includes('Access is denied') ||
        errorMessage.includes('ܾ') || // 乱码的"拒绝访问"
        errorMessage.toLowerCase().includes('access') ||
        errorMessage.toLowerCase().includes('denied');
      
      if (isAccessDenied) {
        console.log(`⚠️ Need admin rights to kill process ${pid}`);
        
        try {
          // 使用管理员权限重新执行
          // 使用 PowerShell 的 Start-Process -Verb RunAs
          const command = `powershell -Command "$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Start-Process taskkill -ArgumentList '/F','/PID','${pid}' -Verb RunAs -Wait"`;
          await execAsync(command, { encoding: 'utf8' });
          return { success: true };
        } catch (adminError: any) {
          console.error(`Failed to kill process ${pid} with admin:`, adminError);
          
          // 检查用户是否取消了 UAC
          const adminErrorMsg = adminError.message || adminError.toString();
          if (adminErrorMsg.includes('cancelled') || adminErrorMsg.includes('取消')) {
            return { 
              success: false, 
              needsAdmin: true,
              error: '用户取消了管理员权限请求'
            };
          }
          
          return { 
            success: false, 
            needsAdmin: true,
            error: '需要管理员权限才能结束此进程'
          };
        }
      }
      
      // 其他错误
      console.error(`Failed to kill process ${pid}:`, error);
      return { 
        success: false, 
        error: `结束进程失败: ${errorMessage}` 
      };
    }
  }

  /**
   * 搜索端口
   */
  async searchPorts(query: string, ports: PortInfo[]): Promise<PortInfo[]> {
    const lowerQuery = query.toLowerCase();
    return ports.filter(port => 
      port.localPort.toString().includes(lowerQuery) ||
      port.processName.toLowerCase().includes(lowerQuery) ||
      port.pid.toString().includes(lowerQuery)
    );
  }
}
