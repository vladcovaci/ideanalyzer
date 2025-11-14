import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function Page() {
  return (
    <DashboardShell>
      <SectionCards />
      <ChartAreaInteractive />
    </DashboardShell>
  );
}
