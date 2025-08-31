
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";
import { MobileLayout } from "@/components/MobileLayout";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import Dashboard from "@/pages/admin/Dashboard";
import Customers from "@/pages/admin/Customers";
import CustomerManagementPage from "@/pages/admin/CustomerManagement";
import Tasks from "@/pages/admin/Tasks";
import Services from "@/pages/admin/Services";
import Employees from "@/pages/admin/Employees";
import Manpower from "@/pages/admin/Manpower";
import Attendance from "@/pages/admin/Attendance";
import Salary from "@/pages/admin/Salary";
import Revenue from "@/pages/admin/Revenue";
import Accounts from "@/pages/admin/Accounts";
import Stocks from "@/pages/admin/Stocks";
import Assets from "@/pages/admin/Assets";
import SubContractors from "@/pages/admin/SubContractors";
import Vendors from "@/pages/admin/Vendors";
import Feedback from "@/pages/admin/Feedback";
import Inspection from "@/pages/admin/Inspection";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Customer Routes */}
              <Route 
                path="/customer" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes with Mobile Layout */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <MobileLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customer-management" element={<CustomerManagementPage />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="services" element={<Services />} />
                <Route path="employees" element={<Employees />} />
                <Route path="manpower" element={<Manpower />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="salary" element={<Salary />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="stocks" element={<Stocks />} />
                <Route path="assets" element={<Assets />} />
                <Route path="sub-contractors" element={<SubContractors />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="inspection" element={<Inspection />} />
              </Route>
              
              {/* Role-based redirect for authenticated users */}
              <Route 
                path="/redirect" 
                element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
