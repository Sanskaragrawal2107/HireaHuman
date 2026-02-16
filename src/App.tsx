import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';

// ── Lazy-loaded pages (code-split per route) ──────────────────────
const LandingPage = lazy(() => import('./pages/Landing').then(m => ({ default: m.LandingPage })));
const BrowsePage = lazy(() => import('./pages/Browse').then(m => ({ default: m.BrowsePage })));
const JoinPage = lazy(() => import('./pages/Join').then(m => ({ default: m.JoinPage })));
const DocsPage = lazy(() => import('./pages/Docs').then(m => ({ default: m.DocsPage })));
const BlogPage = lazy(() => import('./pages/Blog').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPostPage })));
const VsRentAHuman = lazy(() => import('./pages/VsRentAHuman').then(m => ({ default: m.VsRentAHuman })));
const HireHumansPage = lazy(() => import('./pages/HireHumans').then(m => ({ default: m.HireHumansPage })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFoundPage })));

// Protected pages — heavier bundles, only loaded when authenticated
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const VerifyCompanyPage = lazy(() => import('./pages/VerifyCompany').then(m => ({ default: m.VerifyCompanyPage })));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard').then(m => ({ default: m.RecruiterDashboard })));
const AdminPage = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPage })));

// ── Route loading skeleton ────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center font-mono">
    <div className="flex items-center gap-3 text-cyan-500 text-sm animate-pulse">
      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
      LOADING MODULE...
    </div>
  </div>
);

const SuspenseWrap = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <SuspenseWrap>
          <Outlet />
        </SuspenseWrap>
      </Layout>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: "browse", element: <BrowsePage /> },
      { path: "join", element: <JoinPage /> },
      { path: "login", element: <JoinPage /> },
      { path: "docs", element: <DocsPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "hire-humans", element: <HireHumansPage /> },
      { path: "vs/rentahuman", element: <VsRentAHuman /> },

      // ── Protected routes ──────────────────────────────────────
      {
        path: "profile",
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: "verify",
        element: <ProtectedRoute><VerifyCompanyPage /></ProtectedRoute>,
      },
      {
        path: "recruiter-dashboard",
        element: <ProtectedRoute><RecruiterDashboard /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <ProtectedRoute><AdminPage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: "*",
    element: <SuspenseWrap><NotFoundPage /></SuspenseWrap>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
