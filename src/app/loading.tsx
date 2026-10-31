import { GoalForgeArrowLoader } from "@/components/ui/GoalForgeArrowLoader";

export default function RootLoading() {
  return (
    <GoalForgeArrowLoader
      message="Calibrating GoalForge Workspace..."
      subMessage="Aligning goal trajectories, streak telemetry, and cognitive engine..."
    />
  );
}
