import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import TrainerDashboard from "@/pages/trainer/TrainerDashboard";
import TrainerSession from "@/pages/trainer/TrainerSession";
import TrainerSessions from "@/pages/trainer/TrainerSessions";
import TraineeDashboard from "@/pages/trainee/TraineeDashboard";
import TraineeProgress from "@/pages/trainee/TraineeProgress";
import TraineeInstruments from "@/pages/trainee/TraineeInstruments";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminReports from "@/pages/admin/AdminReports";
import AdminLaboratories from "@/pages/admin/AdminLaboratories";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminInstruments from "@/pages/admin/AdminInstruments";
import AdminSettings from "@/pages/admin/AdminSettings";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser, t } = useApp();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setCurrentUser(null);
    setLocation("/");
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-2 border-b bg-background sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType; 
  allowedRoles?: string[];
}) {
  const { currentUser } = useApp();
  const [location] = useLocation();

  if (!currentUser) {
    return <Redirect to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const defaultPath = 
      currentUser.role === "trainer" ? "/trainer" :
      currentUser.role === "admin" ? "/admin" :
      "/trainee";
    return <Redirect to={defaultPath} />;
  }

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function Router() {
  const { currentUser } = useApp();

  return (
    <Switch>
      <Route path="/">
        {currentUser ? (
          <Redirect to={
            currentUser.role === "trainer" ? "/trainer" :
            currentUser.role === "admin" ? "/admin" :
            "/trainee"
          } />
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/trainer">
        <ProtectedRoute component={TrainerDashboard} allowedRoles={["trainer"]} />
      </Route>
      <Route path="/trainer/session">
        <ProtectedRoute component={TrainerSession} allowedRoles={["trainer"]} />
      </Route>
      <Route path="/trainer/sessions">
        <ProtectedRoute component={TrainerSessions} allowedRoles={["trainer"]} />
      </Route>

      <Route path="/trainee">
        <ProtectedRoute component={TraineeDashboard} allowedRoles={["trainee"]} />
      </Route>
      <Route path="/trainee/progress">
        <ProtectedRoute component={TraineeProgress} allowedRoles={["trainee"]} />
      </Route>
      <Route path="/trainee/instruments">
        <ProtectedRoute component={TraineeInstruments} allowedRoles={["trainee"]} />
      </Route>

      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute component={AdminReports} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/laboratories">
        <ProtectedRoute component={AdminLaboratories} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/instruments">
        <ProtectedRoute component={AdminInstruments} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettings} allowedRoles={["admin"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Router />
          <Toaster />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
