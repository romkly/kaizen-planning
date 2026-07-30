import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { YearlyKanban } from "@/components/year/YearlyKanban";
import { getYearlyGoals } from "@/server/actions/get-yearly-goals";

export default async function YearPage() {
  const session = await getServerSession(
    authOptions,
  );

  if (!session?.user) {
    redirect("/login");
  }

  const goals = await getYearlyGoals();
  const currentYear = new Date().getFullYear();

  return (
    <YearlyKanban
      initialGoals={goals}
      initialYear={currentYear}
    />
  );
}