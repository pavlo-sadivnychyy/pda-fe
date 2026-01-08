"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import AIAssistantLanding from "@/components/Landing";
import Home from "@/components/Home/Home";

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <AIAssistantLanding />
      </SignedOut>

      <SignedIn>
        <Home />
      </SignedIn>
    </>
  );
}
