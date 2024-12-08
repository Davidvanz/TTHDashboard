import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          {/* Placeholder routes for future implementation */}
          <Route path="/bookings" element={
            <DashboardLayout>
              <div className="p-8">Source of Bookings (Coming Soon)</div>
            </DashboardLayout>
          } />
          <Route path="/rooms" element={
            <DashboardLayout>
              <div className="p-8">Room Statistics (Coming Soon)</div>
            </DashboardLayout>
          } />
          <Route path="/recommendations" element={
            <DashboardLayout>
              <div className="p-8">AI Recommendations (Coming Soon)</div>
            </DashboardLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;