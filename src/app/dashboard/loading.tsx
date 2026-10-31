import { GoalForgeArrowLoader } from "@/components/ui/GoalForgeArrowLoader";

export default function DashboardLoading() {
  return (
    <GoalForgeArrowLoader
      message="Synchronizing Execution Dashboard..."
      subMessage="Fetching active roadmaps, today's focus tasks, and streak progress..."
    />
  );
}
