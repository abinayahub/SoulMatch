import { getAccessToken } from "./auth-context";
import { API_URL } from "../config/api";

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const body = JSON.parse(text);
      errorMessage = body?.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    console.error(`API Error on ${path}:`, errorMessage);
    throw new Error(errorMessage);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Instagram Notes API
export async function getActiveNotes() {
  return apiRequest<any[]>("/notes");
}

export async function createNote(content: string) {
  return apiRequest<any>("/notes", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deleteNote() {
  return apiRequest<{ success: true }>("/notes", {
    method: "DELETE",
  });
}
