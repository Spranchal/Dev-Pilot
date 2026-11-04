import { LoadingScreen } from "@/components/loading-ui/loading-screen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      message="Loading repositories..."
      submessage="Fetching indexed codebases and branches"
    />
  );
}
