import React, { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5555";

const SOURCES = [
  "LeetCode", "NeetCode", "HackerRank", "CodeSignal", "Codeforces",
  "Company Screen", "Phone Interview", "On-site", "System Design", "Book", "Other",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["todo", "attempted", "solved"];

const STATUS_LABEL = { todo: "To Do", attempted: "Attempted", solved: "Solved" };

const DIFFICULTY_BADGE = {
  Easy:   "bg-[#00b8a3]/10 text-[var(--color-easy)] border border-[#00b8a3]/20",
  Medium: "bg-[#ffc01e]/10 text-[var(--color-medium)] border border-[#ffc01e]/20",
  Hard:   "bg-[#ff375f]/10 text-[var(--color-hard)] border border-[#ff375f]/20",
};

const STATUS_BADGE = {
  solved:    "bg-[#2cbb5d]/10 text-[var(--color-solved)] border border-[#2cbb5d]/20",
  attempted: "bg-[#ffc01e]/10 text-[var(--color-attempted)] border border-[#ffc01e]/20",
  todo:      "bg-[#8d8d8d]/10 text-[var(--color-todo)] border border-[#8d8d8d]/20",
};

const STATUS_DOT = {
  solved:    "bg-[var(--color-solved)]",
  attempted: "bg-[var(--color-attempted)]",
  todo:      "bg-[var(--color-todo)]",
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

function StatCard({ label, value, colorClass = "text-[var(--color-text-primary)]", accentColor }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      {accentColor && <div className="h-[3px]" style={{ backgroundColor: accentColor }} />}
      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold mb-1.5">{label}</p>
        <p className={`text-2xl font-bold font-mono leading-none ${colorClass}`}>{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ solved, total }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-5 py-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold">Completion</span>
          <span className="text-xs font-mono font-semibold text-[var(--color-blue)]">{pct}%</span>
        </div>
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{solved} of {total} solved</span>
      </div>
      <div className="h-1.5 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: "var(--color-blue)" }}
        />
      </div>
    </div>
  );
}

function DifficultyPills({ value, onChange }) {
  const pills = [
    { label: "All",    val: "",       active: "bg-[var(--color-blue)] text-white border border-transparent" },
    { label: "Easy",   val: "Easy",   active: "bg-[#00b8a3]/15 text-[var(--color-easy)] border border-[#00b8a3]/30" },
    { label: "Medium", val: "Medium", active: "bg-[#ffc01e]/15 text-[var(--color-medium)] border border-[#ffc01e]/30" },
    { label: "Hard",   val: "Hard",   active: "bg-[#ff375f]/15 text-[var(--color-hard)] border border-[#ff375f]/30" },
  ];
  return (
    <div className="flex gap-1.5">
      {pills.map((p) => (
        <button
          key={p.val}
          onClick={() => onChange(p.val)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono tracking-wide transition-colors ${
            value === p.val
              ? p.active
              : "bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-transparent"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, displayMap }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-medium rounded-md px-3 py-1.5 focus:outline-none focus:border-[var(--color-blue)] transition-colors cursor-pointer"
    >
      <option value="">All {label}s</option>
      {options.map((o) => (
        <option key={o} value={o}>{displayMap ? displayMap[o] || o : o}</option>
      ))}
    </select>
  );
}

function FormField({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[var(--color-blue)] transition-colors placeholder-[var(--color-text-muted)]";
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
        <span className="text-[var(--color-text-muted)] font-mono text-sm tracking-widest animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] leading-none">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {user?.firstName
              ? `Welcome back, ${user.firstName}`
              : "Log and track questions from any source — LeetCode, company screens, system design, and more"}
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
          className="bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors whitespace-nowrap"
        >
          + New Question
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Solved" value={`${stats.total_solved}/${stats.total_problems}`} colorClass="text-[var(--color-blue)]" accentColor="var(--color-blue)" />
            <StatCard label="Easy"   value={stats.by_difficulty?.Easy   ?? 0} colorClass="text-[var(--color-easy)]"   accentColor="#00b8a3" />
            <StatCard label="Medium" value={stats.by_difficulty?.Medium ?? 0} colorClass="text-[var(--color-medium)]" accentColor="#ffc01e" />
            <StatCard label="Hard"   value={stats.by_difficulty?.Hard   ?? 0} colorClass="text-[var(--color-hard)]"   accentColor="#ff375f" />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <DifficultyPills value={filters.difficulty} onChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))} />
        <div className="w-px h-5 bg-[var(--color-border)]" />
        <FilterSelect label="Source" value={filters.platform} options={SOURCES} onChange={(v) => setFilters((f) => ({ ...f, platform: v }))} />
        <FilterSelect label="Status" value={filters.status}   options={STATUSES} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} displayMap={STATUS_LABEL} />
      </div>

      {/* Question form */}
      {showForm && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-4 rounded-full bg-[var(--color-blue)]" />
            <h2 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-[0.12em]">
              {editingId ? "Edit Question" : "Log a Question"}
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Question" className="sm:col-span-2">
                <input required
                  placeholder="e.g. Two Sum, Design a URL Shortener, Explain async/await..."
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={inputCls} />
              </FormField>

              <FormField label="Source">
                <select value={form.platform} onChange={(e) => setField("platform", e.target.value)} className={selectCls}>
                  {SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="Difficulty">
                <select value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)} className={selectCls}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>

              <FormField label="Status">
                <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={selectCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </FormField>

              <FormField label="Category / Topic">
                <input placeholder="e.g. Arrays, System Design, Behavioral, Trees..."
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)} className={inputCls} />
              </FormField>

              <FormField label="Link" className="sm:col-span-2">
                <input placeholder="https://leetcode.com/problems/... or any reference URL"
                  value={form.link}
                  onChange={(e) => setField("link", e.target.value)} className={inputCls} />
              </FormField>

              <FormField label="Notes" className="sm:col-span-2">
                <textarea
                  placeholder="Approach, key insights, follow-up questions, time complexity..."
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)} rows={3}
                  className={`${inputCls} font-mono text-xs resize-none`} />
              </FormField>
            </div>

            <div className="flex gap-3 mt-5">
              <button type="submit"
                className="bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors">
                {editingId ? "Save Changes" : "Log Question"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium px-5 py-2 rounded-md transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section label */}
      {problems.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold">Questions</span>
          <span className="text-xs font-mono font-semibold text-[var(--color-blue)]">{problems.length}</span>
        </div>
      )}

      {/* Table */}
      {problems.length === 0 ? (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-6 py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-input)] flex items-center justify-center mx-auto mb-4">
            <span className="font-mono font-bold text-lg text-[var(--color-text-muted)]">#</span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm font-semibold">No questions logged yet</p>
          <p className="text-[var(--color-text-muted)] text-xs mt-1.5">
            Add questions from LeetCode, company interviews, system design rounds, or anywhere else
          </p>
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
            className="mt-5 bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
          >
            + Log your first question
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: "var(--color-bg-subtle)" }}>
                {["Question", "Source", "Difficulty", "Status", "Topic", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p.id}
                  className={`border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] transition-colors ${i === problems.length - 1 ? "border-b-0" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[p.status]}`} />
                      <div>
                        {p.link
                          ? <a href={p.link} target="_blank" rel="noreferrer"
                              className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-blue)] transition-colors">
                              {p.title}
                            </a>
                          : <span className="font-medium text-[var(--color-text-primary)]">{p.title}</span>
                        }
                        {p.notes && (
                          <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5 truncate max-w-xs">{p.notes}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] text-xs">{p.platform}</td>
                  <td className="px-4 py-3">
                    <Badge label={p.difficulty} colorClass={DIFFICULTY_BADGE[p.difficulty]} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={STATUS_LABEL[p.status] || p.status} colorClass={STATUS_BADGE[p.status]} />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs font-mono">{p.category || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => startEdit(p)}
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-blue)] transition-colors font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-hard)] transition-colors font-medium">
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
