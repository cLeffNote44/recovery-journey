import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Home from "./pages/Home";
import AppPage from "./pages/AppPage";
import Onboarding from "./pages/Onboarding";
import Privacy from "./pages/Privacy";
import { LockScreen } from "./components/LockScreen";
import { biometricAuthManager } from "./lib/biometric-auth";
import { App as CapacitorApp } from '@capacitor/app';
import { useState, useEffect } from "react";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const userProfile = useSettingsStore((state) => state.userProfile);

  // Check if user profile exists - if not, redirect to onboarding
  if (!userProfile) {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/app"}>
        {() => <ProtectedRoute component={AppPage} />}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(true);

  useEffect(() => {
    // Check if authentication is required on app start
    checkAuthStatus();

    // Listen for app state changes (mobile)
    const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      setIsAppVisible(isActive);

      if (isActive) {
        // App came to foreground, check if auth is required
        checkAuthStatus();
      }
    });

    // Listen for page visibility changes (web)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      appStateListener.then(listener => listener.remove());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const checkAuthStatus = () => {
    const settings = biometricAuthManager.getSettings();

    // Only lock if biometric or PIN is enabled
    if (!settings.enabled && !settings.pinEnabled) {
      setIsLocked(false);
      return;
    }

    // Check if auth is required based on timeout
    if (biometricAuthManager.isAuthRequired()) {
      setIsLocked(true);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          {/* Screen reader announcements */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            id="accessibility-announcements"
          />
          <Toaster />

          {/* Lock Screen Overlay */}
          {isLocked && <LockScreen onUnlock={handleUnlock} />}

          {/* Main App Router */}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
