import { twMerge } from 'tailwind-merge';

/** Joins conditional class names and resolves Tailwind conflicts. */
export function cn(...inputs) {
  return twMerge(inputs.filter(Boolean).join(' '));
}