import React from "react";
import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}

export default SignInPage;
