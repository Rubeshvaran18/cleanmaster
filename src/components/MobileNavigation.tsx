
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

interface MobileNavigationProps {
  onNavigate: () => void;
}

export function MobileNavigation({ onNavigate }: MobileNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavClasses = (url: string) => {
    const isActive = currentPath === url || (url !== "/admin" && currentPath.startsWith(url));
    return isActive
      ? "flex items-center gap-4 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "flex items-center gap-4 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Navigation</h2>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/admin"}
              className={getNavClasses(item.url)}
              onClick={onNavigate}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
