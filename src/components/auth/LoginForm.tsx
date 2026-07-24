"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/brainstorm");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Email</label>
        <input
          name="email"
          type="email"
          placeholder="you@email.com"
          className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Your password"
          className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        disabled={isPending}
        className="w-full rounded-xl border border-white bg-white px-4 py-3 font-bold text-black transition hover:bg-black hover:text-white disabled:opacity-50"
      >
        {isPending ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        No account yet?{" "}
        <Link href="/register" className="font-semibold text-white underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
