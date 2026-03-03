import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <Link
        to="/"
        className="font-bold text-lg tracking-tight text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors no-underline"
      >
        Amii<span className="text-[var(--color-accent)]">Apps</span>
      </Link>

      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              variables: {
                colorPrimary: "#ffa116",
                colorBackground: "#282828",
                colorText: "#ebebeb",
                fontFamily: "Inter, sans-serif",
                borderRadius: "8px",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="redirect" redirectUrl="/sign-in">
            <button className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}

export default NavBar;
