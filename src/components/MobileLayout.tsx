
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Outlet } from "react-router-dom";
import { MobileNavigation } from "./MobileNavigation";

export const MobileLayout = () => {
  const { signOut } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    <div className="flex flex-col h-screen w-full">
      {/* Mobile Header */}
      <header className="border-b px-4 py-3 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
                <MobileNavigation onNavigate={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <img 
              src="/lovable-uploads/7d74efec-31df-41e5-b69e-4cc73573e467.png" 
              alt="MASTERKEY Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">MASTERKEY</h1>
              <p className="text-xs text-yellow-400 font-semibold">The Key of Trust</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
