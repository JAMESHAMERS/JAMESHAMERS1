import { getOverviewData } from "../infrastructure/mock-data";
import { WelcomeCard } from "./components/welcome-card";
import { TodayTasksCard } from "./components/today-tasks-card";
import { CalendarCard } from "./components/calendar-card";
import { FinanceSummaryCard } from "./components/finance-summary-card";
import { GoalProgressCard } from "./components/goal-progress-card";
import { RecentActivityCard } from "./components/recent-activity-card";
import { QuickActionsCard } from "./components/quick-actions-card";
import { ProductivityScoreCard } from "./components/productivity-score-card";

/**
 * Bento-style responsive grid: 1 column on mobile, 2 on tablet, a 12-unit
 * grid on desktop where each widget claims a deliberate span. Source order
 * doubles as the mobile stacking order (welcome, then today's tasks, then
 * supporting widgets), so it was chosen deliberately rather than left to
 * fall out of the desktop layout.
 */
export function OverviewView() {
  const data = getOverviewData();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
      <div className="sm:col-span-2 lg:col-span-12">
        <WelcomeCard streakDays={data.productivity.streakDays} />
      </div>

      <div className="lg:col-span-5">
        <TodayTasksCard tasks={data.tasksToday} />
      </div>
      <div className="lg:col-span-4">
        <CalendarCard markedDates={data.markedDates} />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <ProductivityScoreCard productivity={data.productivity} />
      </div>

      <div className="sm:col-span-2 lg:col-span-7">
        <FinanceSummaryCard finance={data.finance} />
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <GoalProgressCard goals={data.goals} />
      </div>

      <div className="sm:col-span-2 lg:col-span-8">
        <RecentActivityCard activity={data.activity} />
      </div>
      <div className="lg:col-span-4">
        <QuickActionsCard />
      </div>
    </div>
  );
}
