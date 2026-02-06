/**
 * Formatting Utilities
 *
 * Functions for formatting dates, numbers, and other data
 */

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  // For dates older than 7 days, show formatted date
  return formatDate(target, 'yyyy.MM.dd');
}

/**
 * Format date to string with pattern
 *
 * @param date - Date to format
 * @param pattern - Pattern string (yyyy, MM, dd, HH, mm, ss)
 * @example
 * formatDate(new Date(), 'yyyy-MM-dd') // "2024-01-15"
 * formatDate(new Date(), 'yyyy년 MM월 dd일') // "2024년 01월 15일"
 */
export function formatDate(date: string | Date, pattern: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return pattern
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Format number with thousand separators
 * @example formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * Format number to compact notation
 * @example formatCompactNumber(1234) // "1.2K"
 * @example formatCompactNumber(1234567) // "1.2M"
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format bytes to human readable format
 * @example formatBytes(1024) // "1 KB"
 * @example formatBytes(1048576) // "1 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Truncate string with ellipsis
 * @example truncate("Hello World", 5) // "Hello..."
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Capitalize first letter
 * @example capitalize("hello world") // "Hello world"
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Slugify string for URLs
 * @example slugify("Hello World!") // "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
