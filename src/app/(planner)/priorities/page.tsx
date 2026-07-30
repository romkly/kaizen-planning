import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { PriorityBoard } from "@/components/goals/PriorityBoard";
import { getPriorityGoals } from "@/server/actions/get-priority-goals";

export default async function PrioritiesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const goals = await getPriorityGoals();

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Step 3
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Musts and Wants
          </h1>

          <p className="mt-4 text-lg leading-8 text-zinc-400">
            Separate essential commitments from goals that are desirable
            but optional.
          </p>
        </header>

        <div className="mt-10">
          <PriorityBoard initialGoals={goals} />
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-6">
          <Link
            href="/categorize"
            className="rounded-lg border border-zinc-700 px-8 py-3 font-semibold text-zinc-300 transition hover:border-white hover:text-white"
          >
            Back
          </Link>

          <Link
            href="/vision"
            className="rounded-lg border border-zinc-700 px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
          >
            Continue
          </Link>
        </footer>
      </section>
    </main>
  );
}