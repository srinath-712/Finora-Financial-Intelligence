/**
 * VISUAL FREEZE: This file is the thin router wrapper.
 * All visual design lives in pages/ and components/.
 * Do NOT add styling here.
 */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";

// Store
import { AppProvider } from "./store/context";

// Shell
import { Shell } from "./components/Shell";

// Modals
import { QuickModal } from "./components/modals/TransactionModal";

// Pages
import { Overview }      from "./pages/Overview";
import { Transactions }  from "./pages/Transactions";
import { Accounts }      from "./pages/Accounts";
import { Budgets }       from "./pages/Budgets";
import { Goals }         from "./pages/Goals";
import { Portfolio }     from "./pages/Portfolio";
import { StockAnalysis } from "./pages/StockAnalysis";
import { Agents }        from "./pages/Agents";
import { Market }        from "./pages/Market";
import { Institutional } from "./pages/Institutional";
import { Risk }          from "./pages/Risk";
import { Simulator }     from "./pages/Simulator";
import { Reports }       from "./pages/Reports";
import { Assistant }     from "./pages/Assistant";
import { Recurring }     from "./pages/Recurring";
import { Profile }       from "./pages/Profile";
import NotFound          from "./pages/not-found";

const queryClient = new QueryClient();

// ─── App content (inside WouterRouter) ────────────────────────────────────────

function AppContent() {
  const [location, setLocation] = useLocation();
  const [quick, setQuick] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const go = (p: string) => setLocation(p);

  const page = (() => {
    const path = location === "/" ? "/overview" : location;
    switch (path) {
      case "/overview":      return <Overview go={go} />;
      case "/transactions":  return <Transactions categoryFilter={categoryFilter} />;
      case "/accounts":      return <Accounts go={go} />;
      case "/budgets":       return <Budgets go={go} setCategory={setCategoryFilter} />;
      case "/goals":         return <Goals />;
      case "/portfolio":     return <Portfolio go={go} />;
      case "/stock-analysis": return <StockAnalysis go={go} />;
      case "/agents":        return <Agents />;
      case "/market":        return <Market />;
      case "/institutional": return <Institutional />;
      case "/risk":          return <Risk go={go} />;
      case "/simulator":     return <Simulator />;
      case "/reports":       return <Reports />;
      case "/assistant":     return <Assistant />;
      case "/recurring":     return <Recurring />;
      case "/profile":       return <Profile />;
      default:               return <NotFound />;
    }
  })();

  return (
    <Shell onQuickAdd={() => setQuick(true)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {page}
        </motion.div>
      </AnimatePresence>

      {quick && (
        <QuickModal onClose={() => setQuick(false)} />
      )}
    </Shell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Router() {
  return (
    <ErrorBoundary resetKey={typeof window !== "undefined" ? window.location.pathname : "/"}>
      <AppContent />
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;