import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  Settings,
  FlaskConical,
  ClipboardList,
  Building2,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

export function AppSidebar() {
  const [location] = useLocation();
  const { t, currentUser } = useApp();

  const role = currentUser?.role || "trainee";

  const trainerItems = [
    {
      title: t.navigation.dashboard,
      url: "/trainer",
      icon: LayoutDashboard,
    },
    {
      title: t.navigation.training,
      url: "/trainer/session",
      icon: GraduationCap,
    },
    {
      title: t.navigation.sessions,
      url: "/trainer/sessions",
      icon: ClipboardList,
    },
  ];

  const traineeItems = [
    {
      title: t.navigation.dashboard,
      url: "/trainee",
      icon: LayoutDashboard,
    },
    {
      title: t.navigation.progress,
      url: "/trainee/progress",
      icon: TrendingUp,
    },
    {
      title: t.navigation.instruments,
      url: "/trainee/instruments",
      icon: FlaskConical,
    },
  ];

  const adminItems = [
    {
      title: t.navigation.dashboard,
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: t.navigation.laboratories,
      url: "/admin/laboratories",
      icon: Building2,
    },
    {
      title: t.navigation.users,
      url: "/admin/users",
      icon: Users,
    },
    {
      title: t.navigation.instruments,
      url: "/admin/instruments",
      icon: FlaskConical,
    },
    {
      title: t.navigation.reports,
      url: "/admin/reports",
      icon: FileText,
    },
    {
      title: t.navigation.settings,
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  const items =
    role === "trainer"
      ? trainerItems
      : role === "admin"
      ? adminItems
      : traineeItems;

  const roleLabel =
    role === "trainer"
      ? t.roles.trainer
      : role === "admin"
      ? t.roles.admin
      : t.roles.trainee;

  const roleColor =
    role === "trainer"
      ? "default"
      : role === "admin"
      ? "destructive"
      : "secondary";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Training Tracker</span>
            <span className="text-xs text-muted-foreground">BDB France Scientific</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between gap-2">
            <span>Navigation</span>
            <Badge variant={roleColor} className="text-xs">
              {roleLabel}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url.replace(/\//g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {currentUser.email || currentUser.username}
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
