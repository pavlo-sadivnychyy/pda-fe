'use client';

import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import {useCurrentUser} from "@/hooksNew/useAppBootstrap";
import {useOrganization} from "@/hooksNew/useAllUserOrganizations";
import AIAssistantLanding from "@/components/Landing";
import Home from "@/components/Home";

export default function HomePage() {
  const router = useRouter();
  const {data} = useCurrentUser();

  // const {data: allOrg} = useOrganization(data?.id)
  //
  //   console.log(allOrg)
  return (
      <>
        <SignedOut>
          <AIAssistantLanding/>
        </SignedOut>

        <SignedIn>
          <Home/>
        </SignedIn>
          </>
  );
}
