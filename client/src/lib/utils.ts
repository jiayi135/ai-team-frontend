import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLORS, HEALTH_STATUS, NEGOTIATION_STATUS, TASK_STATUS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toFixed(0);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

/**
 * Format timestamp
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get color for health status
 */
export function getHealthStatusColor(status: string): string {
  switch (status) {
    case HEALTH_STATUS.HEALTHY:
      return COLORS.success;
    case HEALTH_STATUS.WARNING:
      return COLORS.warning;
    case HEALTH_STATUS.CRITICAL:
      return COLORS.danger;
    case HEALTH_STATUS.OFFLINE:
      return COLORS.secondary;
    default:
      return COLORS.secondary;
  }
}

/**
 * Get color for task status
 */
export function getTaskStatusColor(status: string): string {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return COLORS.success;
    case TASK_STATUS.RUNNING:
      return COLORS.info;
    case TASK_STATUS.FAILED:
      return COLORS.danger;
    case TASK_STATUS.CANCELLED:
      return COLORS.secondary;
    case TASK_STATUS.QUEUED:
      return COLORS.warning;
    default:
      return COLORS.secondary;
  }
}

/**
 * Get color for negotiation status
 */
export function getNegotiationStatusColor(status: string): string {
  switch (status) {
    case NEGOTIATION_STATUS.RESOLVED:
      return COLORS.success;
    case NEGOTIATION_STATUS.IN_PROGRESS:
      return COLORS.info;
    case NEGOTIATION_STATUS.EXPERT_ARBITRATION:
      return COLORS.warning;
    case NEGOTIATION_STATUS.FAILED:
      return COLORS.danger;
    case NEGOTIATION_STATUS.CONSENSUS_REACHED:
      return COLORS.success;
    default:
      return COLORS.secondary;
  }
}

/**
 * Calculate consensus score color
 */
export function getConsensusScoreColor(score: number): string {
  if (score >= 0.8) return COLORS.success;
  if (score >= 0.6) return COLORS.info;
  if (score >= 0.4) return COLORS.warning;
  return COLORS.danger;
}

/**
 * Generate mock data for charts
 */
export function generateTimeSeriesData(
  points: number,
  baseValue: number,
  variance: number
): Array<{ timestamp: string; value: number }> {
  const data = [];
  const now = new Date();

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({
      timestamp: formatTime(time),
      value: Math.max(0, value),
    });
  }

  return data;
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target } as any;

  Object.keys(source).forEach((key) => {
    const sourceValue = (source as any)[key];
    if (sourceValue !== null && typeof sourceValue === 'object' && key in target) {
      output[key] = deepMerge(target[key], sourceValue);
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
