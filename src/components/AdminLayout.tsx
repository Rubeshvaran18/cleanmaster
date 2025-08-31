
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b px-4 md:px-6 py-4" style={{ backgroundColor: 'hsl(142, 45%, 15%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile menu trigger */}
                <SidebarTrigger className="md:hidden text-white hover:bg-white/10" />
                <img 
                  src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
                  alt="MASTERKEY Logo" 
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">MASTERKEY</h1>
                  <p className="text-sm text-yellow-400 font-semibold">The Key of Trust</p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-0">
            <div className="p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
