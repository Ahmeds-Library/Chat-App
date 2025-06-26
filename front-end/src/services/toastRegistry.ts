
class ToastRegistry {
  private static instance: ToastRegistry;
  private shownToasts = new Map<string, number>();
  private readonly DEDUP_WINDOW = 5000; // 5 seconds
  private readonly MAX_ENTRIES = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): ToastRegistry {
    if (!ToastRegistry.instance) {
      ToastRegistry.instance = new ToastRegistry();
    }
    return ToastRegistry.instance;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const toDelete: string[] = [];
      
      this.shownToasts.forEach((timestamp, key) => {
        if (now - timestamp > this.DEDUP_WINDOW) {
          toDelete.push(key);
        }
      });
      
      toDelete.forEach(key => this.shownToasts.delete(key));
      
      // Prevent memory overflow
      if (this.shownToasts.size > this.MAX_ENTRIES) {
        const entries = Array.from(this.shownToasts.entries());
        entries.sort((a, b) => a[1] - b[1]);
        const toRemove = entries.slice(0, entries.length - this.MAX_ENTRIES);
        toRemove.forEach(([key]) => this.shownToasts.delete(key));
      }
    }, 10000); // Cleanup every 10 seconds
  }

  generateToastId(senderId: string, content: string, timestamp: string): string {
    // Create deterministic ID based on message content and sender
    const normalizedContent = content.trim().toLowerCase();
    const timeWindow = Math.floor(new Date(timestamp).getTime() / this.DEDUP_WINDOW);
    return `${senderId}-${timeWindow}-${normalizedContent.substring(0, 50)}`;
  }

  shouldShowToast(toastId: string): boolean {
    const now = Date.now();
    const lastShown = this.shownToasts.get(toastId);
    
    if (!lastShown || (now - lastShown) > this.DEDUP_WINDOW) {
      this.shownToasts.set(toastId, now);
      return true;
    }
    
    return false;
  }

  markToastShown(toastId: string): void {
    this.shownToasts.set(toastId, Date.now());
  }

  clearForConversation(conversationId: string): void {
    const toDelete: string[] = [];
    this.shownToasts.forEach((_, key) => {
      if (key.includes(conversationId)) {
        toDelete.push(key);
      }
    });
    toDelete.forEach(key => this.shownToasts.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.shownToasts.clear();
  }
}

export default ToastRegistry;
