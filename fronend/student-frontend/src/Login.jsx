import { useState } from "react";
import { login, register, fmtErr } from "./api";

export default function Login({ onDone }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ username: "", email: "", password: "", password2: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const signup = mode === "register";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      if (signup) await register(f);
      await login(f.username, f.password); // sign in right after registering
      onDone();
    } catch (x) {
      setErr(fmtErr(x));
    }
    setBusy(false);
  };

  return (
    <div className="login">
      <form onSubmit={submit} className="panel">
        <h1>Student Management</h1>
        <p className="muted">{signup ? "Create a staff account." : "Sign in with your staff account."}</p>
        <label>Username<input value={f.username} onChange={set("username")} required autoFocus /></label>
        {signup && <label>Email<input type="email" value={f.email} onChange={set("email")} required /></label>}
        <label>Password<input type="password" value={f.password} onChange={set("password")} required /></label>
        {signup && <label>Confirm password<input type="password" value={f.password2} onChange={set("password2")} required /></label>}
        {err && <div className="error">{err}</div>}
        <button className="primary" disabled={busy}>
          {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
        </button>
        <button type="button" onClick={() => { setMode(signup ? "login" : "register"); setErr(""); }}>
          {signup ? "I already have an account" : "Create an account"}
        </button>
      </form>
    </div>
  );
}