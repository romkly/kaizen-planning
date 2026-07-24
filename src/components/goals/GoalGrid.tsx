import { GoalCard } from "@/components/goals/GoalCard";

type Goal = {
  _id: string;
  title: string;
};

type GoalGridProps = {
  goals: Goal[];
};

export function GoalGrid({ goals }: GoalGridProps) {
  if (goals.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 p-16 text-center text-zinc-500">
        No goals yet. Start dumping ideas.
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {goals.map((goal) => (
        <GoalCard key={goal._id} goal={goal} />
      ))}
    </div>
  );
}
