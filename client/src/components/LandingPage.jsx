import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

const PREVIEW_ROWS = [
  { title: "Two Sum",                        source: "LeetCode",        difficulty: "Easy",   status: "solved",    topic: "Arrays" },
  { title: "Design a URL Shortener",         source: "Company Screen",  difficulty: "Hard",   status: "solved",    topic: "System Design" },
  { title: "Binary Tree Level Order",        source: "NeetCode",        difficulty: "Medium", status: "attempted", topic: "Trees" },
  { title: "Explain async/await in JS",      source: "Phone Interview", difficulty: "Easy",   status: "solved",    topic: "JavaScript" },
  { title: "Merge K Sorted Lists",           source: "On-site",         difficulty: "Hard",   status: "attempted", topic: "Linked Lists" },
  { title: "LRU Cache",                      source: "LeetCode",        difficulty: "Medium", status: "solved",    topic: "Design" },
  { title: "Design a Notification System",   source: "On-site",         difficulty: "Hard",   status: "todo",      topic: "System Design" },
  { title: "Tell me about a challenge",      source: "Phone Interview", difficulty: "Easy",   status: "solved",    topic: "Behavioral" },
  { title: "Valid Parentheses",              source: "HackerRank",      difficulty: "Easy",   status: "solved",    topic: "Stack" },
  { title: "Word Ladder",                    source: "NeetCode",        difficulty: "Hard",   status: "todo",      topic: "BFS/Graphs" },
];

const DIFFICULTY_BADGE = {
  Easy:   "bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/20",
  Medium: "bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20",
  Hard:   "bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20",
};

const STATUS_DOT   = { solved: "bg-[#2cbb5d]", attempted: "bg-[#ffc01e]", todo: "bg-[#8d8d8d]" };
const STATUS_LABEL = { solved: "Solved",        attempted: "Attempted",    todo: "To Do" };
const STATUS_BADGE = {
  solved:    "bg-[#2cbb5d]/10 text-[#2cbb5d] border border-[#2cbb5d]/20",
  attempted: "bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20",
  todo:      "bg-[#8d8d8d]/10 text-[#8d8d8d] border border-[#8d8d8d]/20",
};

export default function LandingPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--color-bg-page)]">

      {/* Hero */}
      <div className="flex-shrink-0 max-w-5xl mx-auto w-full px-6 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full px-4 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-blue)]" />
          <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-wide">Prep Tracker</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-none mb-4">
          Track every<br />
          <span className="text-[var(--color-blue)]">question. From anywhere.</span>
        </h1>

        <p className="text-base text-[var(--color-text-secondary)] max-w-xl mx-auto mb-6 leading-relaxed">
          Replace scattered Excel sheets and Notion pages with a purpose-built tracker.
          Log questions from any source — coding platforms, company screens, system design, and more.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <SignedOut>
            <Link to="/sign-up"
              className="bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white font-semibold px-6 py-2.5 rounded-md transition-colors text-sm no-underline">
              Get Started — Free
            </Link>
            <Link to="/sign-in"
              className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] font-medium px-6 py-2.5 rounded-md transition-colors text-sm no-underline">
              Sign In →
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard"
              className="bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white font-semibold px-6 py-2.5 rounded-md transition-colors text-sm no-underline">
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* App preview — fills remaining space */}
      <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full px-6 pb-4">
        <div className="h-full flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">

          {/* Window chrome */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 border-b border-[var(--color-border)]"
            style={{ backgroundColor: "var(--color-bg-subtle)" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ff375f", opacity: 0.7 }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ffc01e", opacity: 0.7 }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#00b8a3", opacity: 0.7 }} />
            <span className="ml-4 text-xs font-mono text-[var(--color-text-muted)]">Prep Tracker — Dashboard</span>
          </div>

          {/* Stat bar */}
          <div className="flex-shrink-0 grid grid-cols-4 border-b border-[var(--color-border)]">
            {[
              { label: "Solved",  value: "2/5", color: "var(--color-blue)" },
              { label: "Easy",    value: "2",   color: "#00b8a3" },
              { label: "Medium",  value: "1",   color: "#ffc01e" },
              { label: "Hard",    value: "2",   color: "#ff375f" },
            ].map((s, i) => (
              <div key={s.label} className={`px-5 py-3 ${i < 3 ? "border-r border-[var(--color-border)]" : ""}`}>
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold mb-1">{s.label}</p>
                <p className="text-lg font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 overflow-y-auto relative">
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 z-10"
              style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg-card))" }} />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]"
                  style={{ backgroundColor: "var(--color-bg-subtle)" }}>
                  {["Question", "Source", "Difficulty", "Status", "Topic"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREVIEW_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-[var(--color-border-subtle)] ${i === PREVIEW_ROWS.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[row.status]}`} />
                        <span className="font-medium text-[var(--color-text-primary)]">{row.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] text-xs">{row.source}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${DIFFICULTY_BADGE[row.difficulty]}`}>{row.difficulty}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${STATUS_BADGE[row.status]}`}>{STATUS_LABEL[row.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs font-mono">{row.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-[var(--color-border-subtle)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-text-secondary)]">
            Amii<span className="text-[var(--color-accent)]">Apps</span>
            <span className="text-[var(--color-text-muted)] font-normal"> — Your Interview Study Hub</span>
          </span>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">Prep Tracker</span>
        </div>
      </div>

    </div>
  );
}
