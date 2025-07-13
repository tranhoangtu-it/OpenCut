/**
 * Returns a function that delays invoking the provided function until after a specified wait time has elapsed since the last call.
 *
 * The returned function resets the delay timer on each invocation, ensuring the original function is called only once after rapid successive calls stop.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to wait after the last call before invoking `func`
 * @returns A debounced version of the provided function
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Returns a function that ensures the provided function is called at most once within the specified time interval.
 *
 * The returned function invokes `func` immediately on the first call, then ignores subsequent calls until the `limit` (in milliseconds) has elapsed.
 *
 * @param func - The function to be throttled
 * @param limit - The minimum time interval (in milliseconds) between allowed calls
 * @returns A throttled version of `func`
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Returns a function that schedules the provided function to run at most once per animation frame.
 *
 * Useful for optimizing performance of functions triggered by high-frequency events such as scrolling or resizing, by aligning execution with the browser's repaint cycle.
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}