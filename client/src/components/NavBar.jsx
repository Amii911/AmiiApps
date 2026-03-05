import React from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <Link to="/" className="flex items-center gap-2.5 no-underline group">
        <span className="w-2 h-2 rounded-full bg-[var(--color-blue)] group-hover:bg-[var(--color-blue-hover)] transition-colors" />
        <span className="font-bold text-[17px] tracking-tight text-[var(--color-text-primary)]">
          Amii<span className="text-[var(--color-accent)]">Apps</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
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
