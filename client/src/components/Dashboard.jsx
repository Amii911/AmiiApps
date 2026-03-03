import React, { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5555";

const PLATFORMS = ["LeetCode", "NeetCode", "HackerRank", "CodeSignal", "Codeforces"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["todo", "attempted", "solved"];

const DIFFICULTY_COLORS = {
  Easy:   "text-[var(--color-easy)]",
  Medium: "text-[var(--color-medium)]",
  Hard:   "text-[var(--color-hard)]",
};

const DIFFICULTY_BADGE = {
  Easy:   "bg-[#00b8a3]/10 text-[var(--color-easy)]",
  Medium: "bg-[#ffc01e]/10 text-[var(--color-medium)]",
  Hard:   "bg-[#ff375f]/10 text-[var(--color-hard)]",
};

const STATUS_BADGE = {
  solved:    "bg-[#2cbb5d]/10 text-[var(--color-solved)]",
  attempted: "bg-[#ffc01e]/10 text-[var(--color-attempted)]",
  todo:      "bg-[#8d8d8d]/10 text-[var(--color-todo)]",
};

const EMPTY_FORM = {
  title: "", platform: "LeetCode", difficulty: "Easy",
  status: "todo", category: "", notes: "", link: "",
};

function Badge({ label, colorClass }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium tracking-wide ${colorClass}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value, colorClass = "text-[var(--color-text-primary)]" }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-5 py-4">
      <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
    >
      <option value="">All {label}s</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder-[var(--color-text-muted)]";
const selectCls = `${inputCls} cursor-pointer`;

export default function Dashboard() {
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
      name: user?.fullName || user?.firstName || null,
      email: user?.primaryEmailAddress?.emailAddress || null,
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
      title: problem.title, platform: problem.platform,
      difficulty: problem.difficulty, status: problem.status,
      category: problem.category || "", notes: problem.notes || "", link: problem.link || "",
    });
    setEditingId(problem.id);
    setShowForm(true);
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-[var(--color-text-muted)] font-mono text-sm tracking-widest">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {user?.firstName ? `Welcome back, ${user.firstName}` : "Your interview prep tracker"}
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#1a1a1a] text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          + Add Problem
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Solved" value={`${stats.total_solved}/${stats.total_problems}`} colorClass="text-[var(--color-accent)]" />
          <StatCard label="Easy" value={stats.by_difficulty?.Easy ?? 0} colorClass="text-[var(--color-easy)]" />
          <StatCard label="Medium" value={stats.by_difficulty?.Medium ?? 0} colorClass="text-[var(--color-medium)]" />
          <StatCard label="Hard" value={stats.by_difficulty?.Hard ?? 0} colorClass="text-[var(--color-hard)]" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterSelect label="difficulty" value={filters.difficulty} options={DIFFICULTIES} onChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))} />
        <FilterSelect label="platform"   value={filters.platform}   options={PLATFORMS}    onChange={(v) => setFilters((f) => ({ ...f, platform: v }))} />
        <FilterSelect label="status"     value={filters.status}     options={STATUSES}     onChange={(v) => setFilters((f) => ({ ...f, status: v }))} />
      </div>

      {/* Problem form */}
      {showForm && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">
            {editingId ? "Edit Problem" : "New Problem"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title">
                <input required placeholder="e.g. Two Sum" value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={`${inputCls} col-span-2`} />
              </FormField>

              <FormField label="Platform">
                <select value={form.platform} onChange={(e) => setField("platform", e.target.value)} className={selectCls}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </FormField>

              <FormField label="Difficulty">
                <select value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)} className={selectCls}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>

              <FormField label="Status">
                <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={selectCls}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="Category">
                <input placeholder="e.g. Arrays, DP, Trees" value={form.category}
                  onChange={(e) => setField("category", e.target.value)} className={inputCls} />
              </FormField>

              <FormField label="Link">
                <input placeholder="https://leetcode.com/problems/..." value={form.link}
                  onChange={(e) => setField("link", e.target.value)} className={`${inputCls} sm:col-span-2`} />
              </FormField>

              <FormField label="Notes">
                <textarea placeholder="Key observations, patterns, time complexity..." value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)} rows={3}
                  className={`${inputCls} sm:col-span-2 font-mono text-xs resize-none`} />
              </FormField>
            </div>

            <div className="flex gap-3 mt-5">
              <button type="submit"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#1a1a1a] text-sm font-semibold px-5 py-2 rounded-md transition-colors">
                {editingId ? "Save Changes" : "Add Problem"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium px-5 py-2 rounded-md transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Problem table */}
      {problems.length === 0 ? (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-6 py-16 text-center">
          <p className="text-[var(--color-text-secondary)] text-sm">No problems tracked yet.</p>
          <p className="text-[var(--color-text-muted)] text-xs mt-1">Hit <span className="text-[var(--color-accent)]">+ Add Problem</span> to get started.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {["Problem", "Platform", "Difficulty", "Status", "Category", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p.id}
                  className={`border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] transition-colors ${i === problems.length - 1 ? "border-b-0" : ""}`}>
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {p.link
                      ? <a href={p.link} target="_blank" rel="noreferrer"
                          className="hover:text-[var(--color-accent)] transition-colors">{p.title}</a>
                      : p.title}
                    {p.notes && <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5 truncate max-w-xs">{p.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.platform}</td>
                  <td className="px-4 py-3">
                    <Badge label={p.difficulty} colorClass={DIFFICULTY_BADGE[p.difficulty]} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={p.status} colorClass={STATUS_BADGE[p.status]} />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs font-mono">{p.category || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => startEdit(p)}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-hard)] transition-colors font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
