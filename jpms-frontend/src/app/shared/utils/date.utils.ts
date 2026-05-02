export class DateUtils {
  static format(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  static timeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const ms = now.getTime() - past.getTime();
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} mins ago`;
    return 'Just now';
  }

  static isFuture(date: Date | string): boolean {
    return new Date(date).getTime() > Date.now();
  }

  static getDaysBetween(d1: Date | string, d2: Date | string): number {
    const first = new Date(d1);
    const second = new Date(d2);
    const diff = Math.abs(first.getTime() - second.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
