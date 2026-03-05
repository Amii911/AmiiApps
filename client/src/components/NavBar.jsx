import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function NavBar() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <Link to="/" className="flex items-center gap-2.5 no-underline group">
        <span className="w-2 h-2 rounded-full bg-[var(--color-blue)] group-hover:bg-[var(--color-blue-hover)] transition-colors" />
        <span className="font-bold text-[17px] tracking-tight text-[var(--color-text-primary)]">
          Amii<span className="text-[var(--color-accent)]">Apps</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-input)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <SignedIn>
          <Link to="/dashboard"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline">
            Dashboard
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              variables: {
                colorPrimary: "#4f8ef7",
                colorBackground: "#282828",
                colorText: "#ebebeb",
                fontFamily: "Inter, sans-serif",
                borderRadius: "8px",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <Link to="/sign-in"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline">
            Sign in
          </Link>
          <Link to="/sign-up"
            className="bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors no-underline">
            Get Started
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
}

export default NavBar;
