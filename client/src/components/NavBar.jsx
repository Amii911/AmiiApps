import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #e5e7eb" }}>
      <Link to="/" style={{ fontWeight: "700", fontSize: "1.25rem", textDecoration: "none", color: "inherit" }}>
        AmiiApps
      </Link>
      <div>
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="redirect" redirectUrl="/sign-in" />
        </SignedOut>
      </div>
    </nav>
  );
}

export default NavBar;
