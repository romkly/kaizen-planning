import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/validators/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const validated = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!validated.success) return null;

        const { email, password } = validated.data;

        await connectToDatabase();

        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user || !user.passwordHash) return null;

        const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordIsValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
