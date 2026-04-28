import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import SkyPage from "@/pages/SkyPage";
import NewEntryPage from "@/pages/NewEntryPage";
import JournalPage from "@/pages/JournalPage";
import EntryDetailPage from "@/pages/EntryDetailPage";
import CalendarPage from "@/pages/CalendarPage";
import InsightsPage from "@/pages/InsightsPage";
import { NavBar } from "@/components/layout/NavBar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={SkyPage} />
        <Route path="/new" component={NewEntryPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/entries/:id" component={EntryDetailPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/insights" component={InsightsPage} />
        <Route component={NotFound} />
      </Switch>
      <NavBar />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
