import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0d] px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="mt-3 text-zinc-400">
            Start building your Kaizen system.
          </p>
        </div>

        <RegisterForm />
      </section>
    </main>
  );
}
