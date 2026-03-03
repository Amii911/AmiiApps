import React, { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5555";

const PLATFORMS = ["LeetCode", "NeetCode", "HackerRank", "CodeSignal", "Codeforces"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["todo", "attempted", "solved"];

const EMPTY_FORM = {
  title: "",
  platform: "LeetCode",
  difficulty: "Easy",
  status: "todo",
  category: "",
  notes: "",
  link: "",
};

function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ difficulty: "", platform: "", status: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const syncUser = useCallback(async () => {
    const headers = await authHeaders();
    await axios.patch(`${API}/users/me`, {
      name: user?.fullName || user?.firstName,
      email: user?.primaryEmailAddress?.emailAddress,
    }, { headers }).catch(() => {});
  }, [authHeaders, user]);

  const fetchProblems = useCallback(async () => {
    const headers = await authHeaders();
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const { data } = await axios.get(`${API}/problems`, { headers, params });
    setProblems(data);
  }, [authHeaders, filters]);

  const fetchStats = useCallback(async () => {
    const headers = await authHeaders();
    const { data } = await axios.get(`${API}/problems/stats`, { headers });
    setStats(data);
  }, [authHeaders]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await syncUser();
      await Promise.all([fetchProblems(), fetchStats()]);
      setLoading(false);
    })();
  }, [syncUser, fetchProblems, fetchStats]);

  async function handleSubmit(e) {
    e.preventDefault();
    const headers = await authHeaders();
    if (editingId) {
      await axios.patch(`${API}/problems/${editingId}`, form, { headers });
    } else {
      await axios.post(`${API}/problems`, form, { headers });
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    await Promise.all([fetchProblems(), fetchStats()]);
  }

  async function handleDelete(id) {
    const headers = await authHeaders();
    await axios.delete(`${API}/problems/${id}`, { headers });
    await Promise.all([fetchProblems(), fetchStats()]);
  }

  function startEdit(problem) {
    setForm({
      title: problem.title,
      platform: problem.platform,
      difficulty: problem.difficulty,
      status: problem.status,
      category: problem.category || "",
      notes: problem.notes || "",
      link: problem.link || "",
    });
    setEditingId(problem.id);
    setShowForm(true);
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          {stats && (
            <p style={{ margin: "0.25rem 0 0", color: "#6b7280" }}>
              {stats.total_solved} / {stats.total_problems} solved
              {Object.entries(stats.by_difficulty).map(([d, n]) => ` · ${n} ${d}`)}
            </p>
          )}
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}>
          + Add Problem
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { key: "difficulty", options: DIFFICULTIES },
          { key: "platform", options: PLATFORMS },
          { key: "status", options: STATUSES },
        ].map(({ key, options }) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
          >
            <option value="">All {key}s</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Problem form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Problem" : "New Problem"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
            <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Category (optional)" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <input placeholder="Link (optional)" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="submit">{editingId ? "Save" : "Add"}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Problem list */}
      {problems.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No problems yet. Add one above!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Title</th>
              <th style={{ padding: "0.5rem" }}>Platform</th>
              <th style={{ padding: "0.5rem" }}>Difficulty</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem" }}>
                  {p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.title}</a> : p.title}
                </td>
                <td style={{ padding: "0.5rem" }}>{p.platform}</td>
                <td style={{ padding: "0.5rem" }}>{p.difficulty}</td>
                <td style={{ padding: "0.5rem" }}>{p.status}</td>
                <td style={{ padding: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
