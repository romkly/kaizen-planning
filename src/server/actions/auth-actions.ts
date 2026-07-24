"use server";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { registerSchema } from "@/validators/auth";

export async function registerUser(input: unknown) {
  const validated = registerSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, email, password } = validated.data;

  await connectToDatabase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return {
      success: false,
      error: "User with this email already exists",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    passwordHash,
  });

  return {
    success: true,
  };
}
