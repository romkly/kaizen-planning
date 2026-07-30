import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { MonthlyKanban } from "@/components/month/MonthlyKanban";
import { getMonthlyGoals } from "@/server/actions/get-monthly-goals";

export default async function MonthPage() {
  const session = await getServerSession(
    authOptions,
  );

  if (!session?.user) {
    redirect("/login");
  }

  const goals = await getMonthlyGoals();

  const currentDate = new Date();

  return (
      <MonthlyKanban
        initialGoals={goals}
        initialYear={currentDate.getFullYear()}
        initialMonth={currentDate.getMonth()}
      />
  );
}