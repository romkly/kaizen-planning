import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { BrainstormGoalForm } from "@/components/goals/BrainstormGoalForm";
import { GoalGrid } from "@/components/goals/GoalGrid";
import { getBrainstormGoals } from "@/server/actions/get-goals";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function BrainstormPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const goals = await getBrainstormGoals();

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Life Goals Brainstorm
          </h1>

          <p className="mt-4 text-lg text-zinc-400">
            Write down all your wishes and goals until you run out of ideas.
          </p>

          <div className="mt-6 flex justify-center">
            <LogoutButton />
          </div>
        </header>

        <div className="mt-10">
          <BrainstormGoalForm />
          <GoalGrid goals={goals} />
        </div>

        <footer className="mt-auto flex items-center justify-between border-t border-zinc-800 pt-6">
          <button className="rounded-lg border border-zinc-700 px-8 py-3 font-semibold text-zinc-300">
            Back
          </button>

          <Link
            href="/categorize"
            className="rounded-lg border border-zinc-700 px-8 py-3 font-semibold text-white 
            transition hover:bg-white hover:text-black"
          >
            Continue
          </Link>
        </footer>
      </section>
    </main>
  );
}
