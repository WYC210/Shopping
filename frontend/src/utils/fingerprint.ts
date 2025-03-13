import FingerprintJS from '@fingerprintjs/fingerprintjs'

class FingerprintManager {
  private static instance: FingerprintManager
  private fingerprint: string | null = null
  private fpPromise: Promise<string> | null = null

  private constructor() {
    // 初始化时立即开始生成指纹
    this.initializeFingerprint()
  }

  public static getInstance(): FingerprintManager {
    if (!FingerprintManager.instance) {
      FingerprintManager.instance = new FingerprintManager()
    }
    return FingerprintManager.instance
  }

  private async initializeFingerprint(): Promise<string> {
    if (!this.fpPromise) {
      this.fpPromise = new Promise(async (resolve) => {
        try {
          // 初始化 FingerprintJS
          const fp = await FingerprintJS.load()
          
          // 获取访客标识符
          const result = await fp.get()
          
          // 使用访客标识符作为指纹
          this.fingerprint = result.visitorId
          
          console.log('Browser fingerprint generated:', this.fingerprint)
          resolve(this.fingerprint)
        } catch (error) {
          console.error('Failed to generate fingerprint:', error)
          // 生成失败时使用随机字符串作为备用
          this.fingerprint = Math.random().toString(36).substring(2)
          resolve(this.fingerprint)
        }
      })
    }
    return this.fpPromise
  }

  public async getFingerprint(): Promise<string> {
    if (!this.fingerprint) {
      await this.initializeFingerprint()
    }
    return this.fingerprint!
  }
}

export const fingerprintManager = FingerprintManager.getInstance() 