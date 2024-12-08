import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();

  // Listen for authentication state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      console.log("User signed in:", session.user.email);
      navigate("/dashboard");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card w-full max-w-md p-8 rounded-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">The Thatch House</h1>
          <p className="text-muted-foreground">Dashboard Login</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            }
          }}
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;