
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { BrowsePage } from './pages/Browse';
import { JoinPage } from './pages/Join';
import { ProfilePage } from './pages/Profile';
import { DocsPage } from './pages/Docs';
import { DashboardPage } from './pages/Dashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <LandingPage />
      </Layout>
    ),
  },
  {
    path: "/browse",
    element: (
      <Layout>
        <BrowsePage />
      </Layout>
    ),
  },
  {
    path: "/join",
    element: (
      <Layout>
        <JoinPage />
      </Layout>
    ),
  },
  {
    path: "/docs",
    element: (
      <Layout>
        <DocsPage />
      </Layout>
    ),
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
    path: "/login",
    element: (
      <Layout>
        <JoinPage />
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
    path: "*",
    element: (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-zinc-500 font-mono">404: RESOURCE_NOT_FOUND</div>
      </Layout>
    )
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
