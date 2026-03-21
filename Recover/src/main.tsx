import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { migrateToZustandStores } from "./lib/store-migration";
import { initMonitoring } from "./lib/monitoring";

// Initialize monitoring (Sentry, LogRocket, etc.) before rendering
initMonitoring();

// Run migration from old AppContext to Zustand stores
// This preserves user data when upgrading to the new architecture
migrateToZustandStores();

createRoot(document.getElementById("root")!).render(<App />);
