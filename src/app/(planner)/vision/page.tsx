import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { VisionBoard } from "@/components/goals/VisionBoard";
import { getVisionGoals } from "@/server/actions/get-vision-goals";

export default async function VisionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const goals = await getVisionGoals();

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-white">
      <section className="mx-auto max-w-[1600px] px-6 py-10">
        <header className="mx-auto max-w-3xl text-center">

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Vision Board
          </h1>

          <p className="mt-4 text-lg leading-8 text-zinc-400">
            Build a map of your long-term direction. Organize goals into
            flexible parent and subgoal relationships.
          </p>
        </header>

        <div className="mt-10">
          <VisionBoard initialGoals={goals} />
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-6">
          <Link
            href="/priorities"
            className="rounded-lg border border-zinc-700 px-8 py-3 font-semibold text-zinc-300 transition hover:border-white hover:text-white"
          >
            Back
          </Link>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg border border-zinc-700 px-8 py-3 font-semibold text-zinc-500 opacity-60"
          >
            Continue
          </button>
        </footer>
      </section>
    </main>
  );
}