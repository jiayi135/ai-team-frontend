import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Roles from "./pages/Roles";
import Negotiations from "./pages/Negotiations";
import Tasks from "./pages/Tasks";
import Costs from "./pages/Costs";
import Health from "./pages/Health";
import Search from "./pages/Search";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/roles"} component={Roles} />
      <Route path={"/negotiations"} component={Negotiations} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/costs"} component={Costs} />
      <Route path={"/health"} component={Health} />
      <Route path={"/search"} component={Search} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
