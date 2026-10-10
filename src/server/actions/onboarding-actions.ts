"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

import type { OnboardingStep } from "@/lib/onboarding";

const nextStepMap: Partial<
  Record<OnboardingStep, OnboardingStep>
> = {
  brainstorm: "categorize",
  categorize: "priorities",
  priorities: "vision",

  vision: "month",
};

const routeMap: Record<OnboardingStep, string> = {
  brainstorm: "/brainstorm",
  categorize: "/categorize",
  priorities: "/priorities",
  vision: "/vision",
  year: "/year",
  month: "/month",
};

export async function advanceOnboarding(
  currentStep: OnboardingStep,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const nextStep = nextStepMap[currentStep];

  if (!nextStep) {
    return;
  }

  await connectToDatabase();

  const updateData: {
    onboardingStep: OnboardingStep;
    onboardingCompleted?: boolean;
  } = {
    onboardingStep: nextStep,
  };

  if (currentStep === "vision") {
    updateData.onboardingCompleted = true;
  }

  await User.updateOne(
    {
      _id: session.user.id,
      onboardingStep: currentStep,
    },
    {
      $set: updateData,
    },
  );

  revalidatePath("/", "layout");

  if (currentStep === "vision") {
    redirect("/year");
  }

  redirect(routeMap[nextStep]);
}