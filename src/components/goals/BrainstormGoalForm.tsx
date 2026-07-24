"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createGoal } from "@/server/actions/goal-actions";

export function BrainstormGoalForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError("");

    startTransition(async () => {
      const result = await createGoal({ title });

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }

      setTitle("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mx-auto flex max-w-3xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
        <div className="flex w-14 items-center justify-center border-r border-zinc-700 text-3xl text-zinc-300">
          +
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
          }}
          placeholder="Enter a life goal..."
          className="flex-1 bg-transparent px-5 py-4 text-lg text-white outline-none placeholder:text-zinc-500"
        />

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="border-l border-zinc-700 px-8 font-bold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Goal"}
        </button>
      </div>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
