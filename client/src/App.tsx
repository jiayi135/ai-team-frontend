import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NewHome from "./pages/NewHome";
import Roles from "./pages/Roles";
import Tools from "./pages/Tools";
import ToolGenerator from "./pages/ToolGenerator";
import AgentConsole from "./pages/AgentConsole";
import SkillCenter from "./pages/SkillCenter";
import AgentChat from "./pages/AgentChat";
import Chat from "./pages/Chat";
import Negotiations from "./pages/Negotiations";
import Tasks from "./pages/Tasks";
import Costs from "./pages/Costs";
import Health from "./pages/Health";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Evolution from "./pages/Evolution";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/old-home"} component={NewHome} />
      <Route path={"/roles"} component={Roles} />
      <Route path={"/negotiations"} component={Negotiations} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/costs"} component={Costs} />
      <Route path={"/health"} component={Health} />
      <Route path={"/search"} component={Search} />
      <Route path={"/tools"} component={Tools} />
      <Route path={"/tool-generator"} component={ToolGenerator} />
      <Route path={"/agent-console"} component={AgentConsole} />
      <Route path={"/skill-center"} component={SkillCenter} />
      <Route path={"/agent-chat"} component={AgentChat} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/evolution"} component={Evolution} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Global patch for the notorious "removeChild" error
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function<T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (console) {
        console.warn('Prevented removeChild error: node is not a child of this parent.', {
          parent: this,
          child: child
        });
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };
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
