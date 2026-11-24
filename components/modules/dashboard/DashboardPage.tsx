import { connection } from "next/server";
import AppShell from "@/components/layout/AppShell";
import RefreshControl from "@/components/common/RefreshControl";
import { getNotice } from "@/lib/notice";
import { getCurrentUrl, type SearchParams } from "@/lib/url";
import { getCategories } from "@/services/categories";
import { getDashboard } from "@/services/dashboard";
import { getUsers } from "@/services/users";
import AiQualityCard from "./AiQualityCard";
import BacklogCard from "./BacklogCard";
import CategoryCard from "./CategoryCard";
import DashboardToolbar from "./DashboardToolbar";
import KpiStrip from "./KpiStrip";
import MixCard from "./MixCard";
import ResponseCard from "./ResponseCard";
import SlaCard from "./SlaCard";
import StatusCard from "./StatusCard";
import TopicsCard from "./TopicsCard";
import TopListsCard from "./TopListsCard";
import TrendCard from "./TrendCard";
import VolumeCard from "./VolumeCard";
import WorkloadCard from "./WorkloadCard";
import { DASHBOARD_PATH, parseDashboardFilters } from "./dashboard-filters";

/** Height of the chart area inside every card, in pixels. Three rows of this fit one screen. */
const CHART_HEIGHT = 156;
/** The first row has a taller card (Urgency and tone), so its charts get more room. */
const FIRST_ROW_CHART_HEIGHT = CHART_HEIGHT + 90;

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DashboardPage({ searchParams: searchParamsPromise }: DashboardPageProps) {
  const params = await searchParamsPromise;
  // A custom range counts days back from today, so this page must be built per request.
  await connection();
  const filters = parseDashboardFilters(params);
  const todayIso = new Date().toISOString().slice(0, 10);

  const [dashboard, categories, users] = await Promise.all([
    getDashboard({ days: filters.days, category: filters.category || undefined, assignee: filters.assignee || undefined }),
    getCategories(),
    getUsers(),
  ]);
  const assignees = users.filter((user) => user.role === "owner" || user.role === "agent");

  return (
    <AppShell activePath={DASHBOARD_PATH} notice={getNotice(DASHBOARD_PATH, params)}>
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-4 pb-1">
        <div className="min-w-0">
          <h1 className="text-[30px] leading-tight font-light tracking-[-0.01em]">Dashboard</h1>
          <p className="mt-1 max-w-[620px] truncate text-sm text-ink-3" title={dashboard.narrative}>
            {dashboard.narrative}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RefreshControl href={getCurrentUrl(DASHBOARD_PATH, params)} syncedAt={new Date().toISOString()} autoRefreshSeconds={120} />
          <DashboardToolbar filters={filters} params={params} categories={categories} assignees={assignees} />
        </div>
      </div>

      <KpiStrip dashboard={dashboard} filters={filters} />

      <div className="grid shrink-0 grid-cols-12 gap-5">
        <VolumeCard volume={dashboard.volume} filters={filters} todayIso={todayIso} chartHeight={FIRST_ROW_CHART_HEIGHT} />
        <StatusCard open={dashboard.tiles.open} filters={filters} chartHeight={FIRST_ROW_CHART_HEIGHT} />
        <CategoryCard byCategory={dashboard.byCategory} categories={categories} filters={filters} chartHeight={FIRST_ROW_CHART_HEIGHT} />
        <MixCard urgency={dashboard.urgency} sentiment={dashboard.sentiment} filters={filters} sentimentTrend={dashboard.sentimentTrend} todayIso={todayIso} />

        <BacklogCard backlog={dashboard.backlog} filters={filters} chartHeight={CHART_HEIGHT} />
        <ResponseCard response={dashboard.response} categories={categories} filters={filters} chartHeight={CHART_HEIGHT} />
        <WorkloadCard workload={dashboard.workload} assignees={assignees} filters={filters} chartHeight={CHART_HEIGHT} />
        <SlaCard sla={dashboard.sla} filters={filters} chartHeight={CHART_HEIGHT} />

        <TrendCard trends={dashboard.categoryTrend} categories={categories} filters={filters} chartHeight={CHART_HEIGHT} />
        <TopListsCard
          senders={dashboard.topSenders}
          businessUnits={dashboard.topBusinessUnits}
          countries={dashboard.topCountries}
          filters={filters}
        />
        <TopicsCard topics={dashboard.topics} filters={filters} />
        <AiQualityCard ai={dashboard.ai} />
      </div>
    </AppShell>
  );
}
