import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:8547";
const token = import.meta.env.VITE_API_TOKEN as string | undefined;

export const api = axios.create({
  baseURL,
  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
});

export function form(data: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  return params;
}
