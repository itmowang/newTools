/**
 * 端口信息
 */
export interface PortInfo {
  protocol: 'TCP' | 'UDP';
  localAddress: string;
  localPort: number;
  foreignAddress: string;
  foreignPort: number;
  state: string;
  pid: number;
  processName: string;
}
