import type { ReactNode } from "react";

import { AppSidebar } from "@/components/navigation/AppSideBar";

type PlannerLayoutProps = {
  children: ReactNode;
};

export default function PlannerLayout({
  children,
}: PlannerLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1920px] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}