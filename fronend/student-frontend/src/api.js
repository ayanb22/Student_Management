const BASE = import.meta.env.VITE_API_URL || "/api";
const get = (k) => localStorage.getItem(k);

export const isLoggedIn = () => !!get("access");
export function logout() {
  localStorage.clear();
  location.reload();
}

export function fmtErr(e) {
  if (!e) return "Something went wrong.";
  if (typeof e === "string") return e;
  return Object.entries(e)
    .map(([k, v]) => {
      const msg = [].concat(v).join(" ");
      return k === "non_field_errors" || k === "detail" ? msg : `${k}: ${msg}`;
    })
    .join(" | ");
}

const send = (path, o = {}) =>
  fetch(BASE + path, {
    method: o.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(get("access") ? { Authorization: `Bearer ${get("access")}` } : {}),
    },
    body: o.body ? JSON.stringify(o.body) : undefined,
  });

async function refresh() {
  if (!get("refresh")) return false;
  const res = await fetch(BASE + "/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: get("refresh") }),
  });
  if (!res.ok) return false;
  localStorage.setItem("access", (await res.json()).access);
  return true;
}

export async function api(path, o = {}) {
  let res = await send(path, o);
  if (res.status === 401 && (await refresh())) res = await send(path, o);
  if (res.status === 401) logout();
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { detail: `Request failed (${res.status})` };
  return data;
}

export async function login(username, password) {
  const res = await fetch(BASE + "/auth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw { detail: "Wrong username or password." };
  const d = await res.json();
  localStorage.setItem("access", d.access);
  localStorage.setItem("refresh", d.refresh);
}

export async function register(data) {
  const res = await fetch(BASE + "/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw body || { detail: "Registration failed." };
  return body;
}
