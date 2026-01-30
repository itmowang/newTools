import { desktopCapturer, screen, nativeImage } from 'electron';
import { ColorInfo } from './types';

/**
 * 取色服务 - 负责屏幕取色功能（优化版）
 */
export class ColorService {
  private cachedScreenshots: Map<number, { image: Electron.NativeImage; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 2000; // 缓存 2 秒

  /**
   * 捕获所有显示器的截图并缓存
   */
  async captureAllScreens(): Promise<void> {
    try {
      const displays = screen.getAllDisplays();
      
      // 获取所有屏幕截图
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: 1920,
          height: 1080
        }
      });

      // 缓存每个显示器的截图
      displays.forEach((display, index) => {
        const screenSource = sources.find(s => s.id.includes(`:${index}:`)) || sources[index];
        if (screenSource) {
          this.cachedScreenshots.set(index, {
            image: screenSource.thumbnail,
            timestamp: Date.now()
          });
        }
      });

      console.log(`✅ Captured ${this.cachedScreenshots.size} screens`);
    } catch (error) {
      console.error('Failed to capture screens:', error);
    }
  }

  /**
   * 检查缓存是否过期
   */
  private isCacheExpired(displayIndex: number): boolean {
    const cached = this.cachedScreenshots.get(displayIndex);
    if (!cached) return true;
    return Date.now() - cached.timestamp > this.CACHE_DURATION;
  }

  /**
   * 获取指定坐标的颜色（从缓存的截图中读取，超快）
   */
  async getColorAtPoint(x: number, y: number): Promise<ColorInfo | null> {
    try {
      // 找到包含该坐标的显示器
      const displays = screen.getAllDisplays();
      let targetDisplay = displays[0];
      let displayIndex = 0;
      
      for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        const { x: dx, y: dy, width, height } = display.bounds;
        if (x >= dx && x < dx + width && y >= dy && y < dy + height) {
          targetDisplay = display;
          displayIndex = i;
          break;
        }
      }

      // 如果缓存过期，重新捕获
      if (this.isCacheExpired(displayIndex)) {
        await this.captureAllScreens();
      }

      // 从缓存中获取截图
      const cached = this.cachedScreenshots.get(displayIndex);
      if (!cached) {
        console.error('No cached screenshot for display', displayIndex);
        return null;
      }

      const image = cached.image;
      
      // 计算相对于显示器的坐标
      const relativeX = x - targetDisplay.bounds.x;
      const relativeY = y - targetDisplay.bounds.y;
      
      // 计算缩放后的坐标
      const imageWidth = image.getSize().width;
      const imageHeight = image.getSize().height;
      const displayWidth = targetDisplay.bounds.width;
      const displayHeight = targetDisplay.bounds.height;
      
      const scaleX = imageWidth / displayWidth;
      const scaleY = imageHeight / displayHeight;
      
      const scaledX = Math.floor(relativeX * scaleX);
      const scaledY = Math.floor(relativeY * scaleY);

      // 确保坐标在范围内
      if (scaledX < 0 || scaledX >= imageWidth || scaledY < 0 || scaledY >= imageHeight) {
        return null;
      }

      // 获取像素颜色 (BGRA 格式)
      const bitmap = image.getBitmap();
      const pixelIndex = (scaledY * imageWidth + scaledX) * 4;

      if (pixelIndex < 0 || pixelIndex >= bitmap.length - 3) {
        return null;
      }

      // Electron 的 bitmap 是 BGRA 格式
      const b = bitmap[pixelIndex];
      const g = bitmap[pixelIndex + 1];
      const r = bitmap[pixelIndex + 2];

      return this.rgbToColorInfo(r, g, b);
    } catch (error) {
      console.error('Failed to get color at point:', error);
      return null;
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedScreenshots.clear();
  }

  /**
   * RGB 转换为完整颜色信息
   */
  private rgbToColorInfo(r: number, g: number, b: number): ColorInfo {
    const hex = this.rgbToHex(r, g, b);
    const hsl = this.rgbToHsl(r, g, b);

    return {
      hex,
      rgb: { r, g, b },
      hsl
    };
  }

  /**
   * RGB 转 HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }

  /**
   * RGB 转 HSL
   */
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
}
