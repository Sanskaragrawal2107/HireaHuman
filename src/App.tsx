
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { DocsPage } from './pages/Docs';
import { ProfilePage } from './pages/Profile';
import { DashboardPage } from './pages/Dashboard';
import { BrowsePage } from './pages/Browse';
import { JoinPage } from './pages/Join';
import { VerifyCompanyPage } from './pages/VerifyCompany';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminPage } from './pages/Admin';
import { NotFoundPage } from './pages/NotFound';
import { BlogPage } from './pages/Blog';
import { BlogPostPage } from './pages/BlogPost';
import { VsRentAHuman } from './pages/VsRentAHuman';
import { HireHumansPage } from './pages/HireHumans';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: "browse",
        element: <BrowsePage />
      },
      {
        path: "join",
        element: <JoinPage />
      },
      {
        path: "login",
        element: <JoinPage />
      },
      {
        path: "docs",
        element: <DocsPage />
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "verify",
        element: <VerifyCompanyPage />
      },
      {
        path: "recruiter-dashboard",
        element: <RecruiterDashboard />
      },
      {
        path: "admin",
        element: <AdminPage />
      },
      {
        path: "blog",
        element: <BlogPage />
      },
      {
        path: "blog/:slug",
        element: <BlogPostPage />
      },
      {
        path: "hire-humans",
        element: <HireHumansPage />
      },
      {
        path: "vs/rentahuman",
        element: <VsRentAHuman />
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
