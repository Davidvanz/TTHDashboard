import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookingSourcesComparison } from "@/components/BookingSourcesComparison";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Bookings() {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to login");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Bookings Overview</h1>
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please note: The booking data shown here may not be fully accurate as some source data was unavailable during compilation.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 gap-6">
        <BookingSourcesComparison />
      </div>
    </div>
  );
}