export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type JsonPayload = Record<string, unknown> | null;

type ErrorPayload = {
  message?: string;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers,
  });

  const text = await response.text();
  const payload = parseJson(text);

  if (!response.ok) {
    const message = resolveMessage(payload, text);
    throw new Error(message || `Request failed (${response.status})`);
  }

  return payload as T;
}

function resolveMessage(payload: JsonPayload, text: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const errorPayload = payload as ErrorPayload;
    if (typeof errorPayload.message === "string") {
      return errorPayload.message;
    }
  }

  return text;
}

function parseJson(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as JsonPayload;
  } catch {
    return null;
  }
}
