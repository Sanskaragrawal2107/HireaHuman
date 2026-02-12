
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { DocsPage } from './pages/Docs';
import { ProfilePage } from './pages/Profile';
import { DashboardPage } from './pages/Dashboard';
import { BrowsePage } from './pages/Browse'; // Assuming this exists based on list_dir
import { JoinPage } from './pages/Join';
import { VerifyCompanyPage } from './pages/VerifyCompany';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminPage } from './pages/Admin';
import { NotFoundPage } from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <LandingPage />
      </Layout>
    )
  },
  {
    path: "/browse",
    element: (
      <Layout>
        <BrowsePage />
      </Layout>
    )
  },
  {
    path: "/join",
    element: (
      <Layout>
        <JoinPage />
      </Layout>
    )
  },
  {
    path: "/login",
    element: (
      <Layout>
        <JoinPage />
      </Layout>
    )
  },
  {
    path: "/docs",
    element: (
      <Layout>
        <DocsPage />
      </Layout>
    )
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <ProfilePage />
      </Layout>
    )
  },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <DashboardPage />
      </Layout>
    )
  },
  {
    path: "/verify",
    element: (
      <Layout>
        <VerifyCompanyPage />
      </Layout>
    )
  },
  {
    path: "/recruiter-dashboard",
    element: (
      <Layout>
        <RecruiterDashboard />
      </Layout>
    )
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <AdminPage />
      </Layout>
    )
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
