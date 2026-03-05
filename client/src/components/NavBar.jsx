import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
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
          <UserButton
            afterSignOutUrl="/sign-in"
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
          <SignInButton mode="redirect" redirectUrl="/sign-in">
            <button className="text-sm font-medium text-[var(--color-blue)] hover:text-[var(--color-blue-hover)] transition-colors">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}

export default NavBar;
