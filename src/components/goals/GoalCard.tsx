"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteGoal,
  updateGoalTitle,
} from "@/server/actions/goal-actions";

type GoalCardProps = {
  goal: {
    _id: string;
    title: string;
  };
};

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteGoal(goal._id);
      router.refresh();
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateGoalTitle(goal._id, title);

      if (!result.success) {
        setTitle(goal.title);
        setIsEditing(false);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className="group relative flex min-h-28 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 text-center text-lg font-semibold shadow-lg"
    >
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 text-sm text-zinc-400 opacity-0 transition hover:border-red-400 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
      >
        ×
      </button>

      {isEditing ? (
        <input
          value={title}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          onBlur={handleSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSave();

            if (event.key === "Escape") {
              setTitle(goal.title);
              setIsEditing(false);
            }
          }}
          className="w-full bg-transparent px-2 text-center outline-none"
        />
      ) : (
        <span className="px-5">{goal.title}</span>
      )}
    </div>
  );
}
