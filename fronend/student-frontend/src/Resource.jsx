import { useEffect, useState } from "react";
import { api, fmtErr } from "./api";

const list = (d) => (Array.isArray(d) ? d : d?.results || []);

export default function Resource({ cfg }) {
  const [rows, setRows] = useState([]);
  const [opts, setOpts] = useState({});
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setRows(list(await api(cfg.path)));
      const o = {};
      for (const f of cfg.fields) if (f.options) o[f.name] = list(await api(f.options.path));
      setOpts(o);
    } catch (e) {
      setErr(fmtErr(e));
    }
    setLoading(false);
  };

  useEffect(() => {
    setForm(null); setErr(""); setQ(""); setLoading(true);
    load();
  }, [cfg.path]);

  const change = (name, value) => {
    const next = { ...form, [name]: value };
    setForm(cfg.derive ? cfg.derive(next, name) : next);
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const body = {};
      cfg.fields.forEach((f) => {
        const v = form[f.name] ?? "";
        body[f.name] = f.type === "number" && v !== "" ? Number(v) : v;
      });
      if (form.id) await api(`${cfg.path}${form.id}/`, { method: "PUT", body });
      else await api(cfg.path, { method: "POST", body });
      setForm(null);
      load();
    } catch (x) {
      setErr(fmtErr(x));
    }
  };

  const remove = async (r) => {
    if (!confirm(`Delete this ${cfg.singular}? This cannot be undone.`)) return;
    try {
      await api(`${cfg.path}${r.id}/`, { method: "DELETE" });
      load();
    } catch (x) {
      setErr(fmtErr(x));
    }
  };

  const shown = rows.filter((r) => JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase()));

  return (
    <section>
      <header className="bar">
        <h2>{cfg.title} <span className="count">{rows.length}</span></h2>
        <input className="search" placeholder={`Search ${cfg.title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="primary" onClick={() => { setErr(""); setForm({}); }}>Add {cfg.singular}</button>
      </header>

      {err && !form && <div className="error">{err}</div>}

      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>{cfg.columns.map((c) => <th key={c.key}>{c.label}</th>)}<th></th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                {cfg.columns.map((c) => <td key={c.key}>{c.fmt ? c.fmt(r[c.key]) : r[c.key]}</td>)}
                <td className="actions">
                  {!cfg.noEdit && <button onClick={() => { setErr(""); setForm(r); }}>Edit</button>}
                  <button className="danger" onClick={() => remove(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && shown.length === 0 && (
          <p className="empty">{rows.length ? "No matches." : `No ${cfg.title.toLowerCase()} yet. Add the first one.`}</p>
        )}
        {loading && <p className="empty">Loading…</p>}
      </div>

      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <form className="panel modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{form.id ? "Edit" : "Add"} {cfg.singular}</h3>
            {cfg.fields.map((f) => (
              <label key={f.name}>
                {f.label}
                {f.options ? (
                  <select required value={form[f.name] ?? ""} onChange={(e) => change(f.name, e.target.value)}>
                    <option value="">Select…</option>
                    {(opts[f.name] || []).map((o) => <option key={o.id} value={o.id}>{f.options.label(o)}</option>)}
                  </select>
                ) : (
                  <input type={f.type || "text"} required min={f.type === "number" ? 0 : undefined}
                    value={form[f.name] ?? ""} onChange={(e) => change(f.name, e.target.value)} />
                )}
              </label>
            ))}
            {err && <div className="error">{err}</div>}
            <div className="row">
              <button type="button" onClick={() => setForm(null)}>Cancel</button>
              <button className="primary">Save {cfg.singular}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
