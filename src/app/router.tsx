import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const HistoryPage = lazy(() =>
  import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
const DayPage = lazy(() =>
  import('@/pages/DayPage').then((m) => ({ default: m.DayPage })),
);
const IndicatorStudiesPage = lazy(() =>
  import('@/pages/IndicatorStudiesPage').then((m) => ({
    default: m.IndicatorStudiesPage,
  })),
);
const CalibrationPage = lazy(() =>
  import('@/pages/CalibrationPage').then((m) => ({
    default: m.CalibrationPage,
  })),
);
const ReportPage = lazy(() =>
  import('@/pages/ReportPage').then((m) => ({ default: m.ReportPage })),
);

function PageFallback(): React.ReactNode {
  return <p className="text-sm text-ink-muted">Loading page…</p>;
}

export function AppRouter(): React.ReactNode {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Shell>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/day/:date" element={<DayPage />} />
            <Route path="/studies" element={<IndicatorStudiesPage />} />
            <Route path="/studies/:date" element={<IndicatorStudiesPage />} />
            <Route path="/calibration" element={<CalibrationPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  );
}
