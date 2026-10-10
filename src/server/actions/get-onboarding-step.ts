import "server-only";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

import type { OnboardingStep } from "@/lib/onboarding";

export async function getOnboardingStep(): Promise<OnboardingStep> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return "brainstorm";
  }

  await connectToDatabase();

  const user = await User.findById(
    session.user.id,
  )
    .select("onboardingStep")
    .lean<{
      onboardingStep?: OnboardingStep;
    }>();

  /*
   * Existing users created before onboardingStep existed
   * should retain full access.
   */
  return user?.onboardingStep ?? "month";
}