import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { format, isToday, isThisYear } from "date-fns";

export function formatMessageTime(timestamp: number) {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a"); // e.g., "2:34 PM"
  }

  if (isThisYear(date)) {
    return format(date, "MMM d, h:mm a"); // e.g., "Feb 15, 2:34 PM"
  }

  return format(date, "MMM d, yyyy, h:mm a"); // e.g., "Feb 15, 2024, 2:34 PM"
}
