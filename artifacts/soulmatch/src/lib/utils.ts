import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", { 
    timeZone: "UTC",
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(new Date(date));
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getInitials(firstName?: string | null, lastName?: string | null) {
  if (!firstName) return "SM";
  const parts = lastName ? [firstName, lastName] : String(firstName).split(" ");
  return parts.map((n) => n ? n[0] : "").join("").toUpperCase().slice(0, 2) || "SM";
}

export function getApiUrl(path: string) {
  return `/api${path}`;
}

