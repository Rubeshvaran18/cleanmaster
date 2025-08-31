
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  DollarSign,
  Package,
  UserPlus,
  Truck,
  MessageSquare,
  UserCog,
  HardDrive,
  Search,
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
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Customer Management", url: "/admin/customer-management", icon: UserCog },
  { title: "Tasks", url: "/admin/tasks", icon: ClipboardList },
  { title: "Services", url: "/admin/services", icon: Settings },
  { title: "Employees", url: "/admin/employees", icon: UserPlus },
  { title: "Manpower", url: "/admin/manpower", icon: Search },
  { title: "Attendance", url: "/admin/attendance", icon: Calendar },
  { title: "Salary", url: "/admin/salary", icon: DollarSign },
  { title: "Revenue", url: "/admin/revenue", icon: BarChart3 },
  { title: "Accounts", url: "/admin/accounts", icon: DollarSign },
  { title: "Stocks", url: "/admin/stocks", icon: Package },
  { title: "Assets", url: "/admin/assets", icon: HardDrive },
  { title: "Sub Contractors", url: "/admin/sub-contractors", icon: UserPlus },
  { title: "Vendors", url: "/admin/vendors", icon: Truck },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
  { title: "Inspection", url: "/admin/inspection", icon: Search },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavClasses = (url: string) => {
    const isActive = currentPath === url || (url !== "/admin" && currentPath.startsWith(url));
    return isActive
      ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
      : "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50";
  };

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
