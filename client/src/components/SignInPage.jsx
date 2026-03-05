import React from "react";
import { SignIn } from "@clerk/clerk-react";

const clerkAppearance = {
  variables: {
    colorPrimary: "#4f8ef7",
    colorBackground: "#282828",
    colorInputBackground: "#3c3c3c",
    colorInputText: "#ebebeb",
    colorText: "#ebebeb",
    colorTextSecondary: "#8d8d8d",
    colorNeutral: "#8d8d8d",
    colorDanger: "#ff375f",
    fontFamily: "Inter, sans-serif",
    borderRadius: "8px",
    fontSize: "14px",
  },
  elements: {
    card: "shadow-none border border-[#3c3c3c]",
    headerTitle: "font-bold text-[#ebebeb]",
    headerSubtitle: "text-[#8d8d8d]",
    formButtonPrimary: "bg-[#4f8ef7] hover:bg-[#6ba3ff] text-white font-semibold",
    footerActionLink: "text-[#4f8ef7] hover:text-[#6ba3ff]",
  },
};

function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Amii<span className="text-[var(--color-accent)]">Apps</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Your interview prep dashboard
        </p>
      </div>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </div>
  );
}

export default SignInPage;
