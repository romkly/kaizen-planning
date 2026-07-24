"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerUser } from "@/server/actions/auth-actions";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await registerUser({ name, email, password });

      if (!result.success) {
        setError(result.error ?? "Registration failed");
        return;
      }

      router.push("/login");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Name</label>
        <input
          name="name"
          type="text"
          placeholder="Roman"
          className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
        />
      </div>

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
          placeholder="Minimum 8 characters"
          className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        disabled={isPending}
        className="w-full rounded-xl border border-white bg-white px-4 py-3 font-bold text-black transition hover:bg-black hover:text-white disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white underline">
          Login
        </Link>
      </p>
    </form>
  );
}
