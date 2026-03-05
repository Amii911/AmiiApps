import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import NavBar from "./NavBar";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import SignInPage from "./SignInPage";
import SignUpPage from "./SignUpPage";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn redirectUrl="/dashboard" /></SignedOut>
    </>
  );
}

function App() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-page)]">
      <NavBar />
      <main className="flex-1 min-h-0 overflow-auto">
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/sign-in/*"  element={<SignInPage />} />
        <Route path="/sign-up/*"  element={<SignUpPage />} />
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
      </main>
    </div>
  );
}

export default App;
