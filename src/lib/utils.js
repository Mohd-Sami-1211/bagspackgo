import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(date).toLocaleDateString('en-US', options);
}