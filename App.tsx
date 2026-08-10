import { lazy, Suspense, useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PageLoader, Protected } from "./components/app/Shell";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";

/* Code-split every app route so the landing page stays fast. */
const LoginPage = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.SignupPage })),
);
const PropertiesPage = lazy(() => import("./pages/Properties"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetail"));
const AddPropertyPage = lazy(() => import("./pages/AddProperty"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));

/** Jump to the top on route change, but leave in-page #anchors alone. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    /**
     * HashRouter (URLs look like `/#/signup`) is used deliberately.
     *
     * This app builds to a single static `dist/index.html` with no server, so a
     * hard request to `/signup` 404s at the host before React ever loads —
     * that is the "Not found: /signup" error. The hash fragment is never sent
     * to the server, so every deep link resolves to index.html and React
     * Router takes over on the client.
     *
     * Deploying behind a host with an SPA rewrite (see `public/_redirects` and
     * `vercel.json`)? Swap this back to `BrowserRouter` for clean URLs.
     */
    <HashRouter>
      <ErrorBoundary>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />

            {/* protected */}
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <DashboardPage />
                </Protected>
              }
            />
            <Route
              path="/add-property"
              element={
                <Protected>
                  <AddPropertyPage />
                </Protected>
              }
            />
            <Route
              path="/verification/:id"
              element={
                <Protected>
                  <VerificationPage />
                </Protected>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
      </ErrorBoundary>
    </HashRouter>
  );
}
