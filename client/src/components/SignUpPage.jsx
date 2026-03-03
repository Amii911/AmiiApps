import React from "react";
import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}

export default SignUpPage;
