// Simple in-memory store for webhook logs (for demo purposes)
// In production, use database or Redis

interface WebhookLog {
  id: string
  timestamp: string
  data: any
}

class WebhookStore {
  private logs: WebhookLog[] = []
  private maxLogs = 50

  addLog(data: any) {
    const log: WebhookLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      data
    }

    this.logs.unshift(log) // Add to beginning
    
    // Keep only maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    console.log(`📝 Webhook log stored. Total logs: ${this.logs.length}`)
    return log
  }

  getLogs(): WebhookLog[] {
    return [...this.logs] // Return copy
  }

  clearLogs() {
    this.logs = []
    console.log('🗑️ Webhook logs cleared')
  }

  getLogCount(): number {
    return this.logs.length
  }
}

// Singleton instance
export const webhookStore = new WebhookStore()
export type { WebhookLog }