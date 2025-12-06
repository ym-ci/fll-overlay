import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/server/better-auth";
import { getSession } from "@/server/better-auth/server";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await getSession();


  return (
    // TODO: add stats page
    <div>
      <h1>Home</h1>
    </div>
  );
}
