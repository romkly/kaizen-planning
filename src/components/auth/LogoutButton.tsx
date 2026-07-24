"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white hover:text-black"
    >
      Logout
    </button>
  );
}
