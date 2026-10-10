"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function completeBrainstormStep() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();

  await User.updateOne(
    {
      _id: session.user.id,
      onboardingStep: "brainstorm",
    },
    {
      $set: {
        onboardingStep: "categorize",
      },
    },
  );

  /*
   * PlannerLayout reads onboardingStep.
   * Force Next to fetch the updated value.
   */
  revalidatePath("/", "layout");

  redirect("/categorize");
}