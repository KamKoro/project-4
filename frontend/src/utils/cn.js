/**
 * Class Name Utility
 * 
 * Combines and merges Tailwind CSS class names intelligently.
 * Uses clsx for conditional class names and tailwind-merge to prevent conflicts.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names and merges Tailwind classes to prevent conflicts
 * @param  {...any} inputs - Class names (strings, objects, arrays)
 * @returns {string} Merged class name string
 * 
 * @example
 * cn('p-4', 'bg-red-500', condition && 'text-white')
 * cn({ 'bg-blue-500': isActive, 'bg-gray-500': !isActive })
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
