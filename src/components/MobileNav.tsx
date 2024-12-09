import { routes } from "@/config/routes";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

export function MobileNav() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <ScrollArea className="h-full py-6 pl-8 pr-6">
      <div className="flex flex-col gap-4">
        {routes
          .filter(route => route.path !== "/" && route.path !== "/login")
          .map((route) => (
            <Button
              key={route.path}
              variant="ghost"
              className="justify-start"
              onClick={() => navigate(route.path)}
            >
              {route.path.slice(1).charAt(0).toUpperCase() + route.path.slice(2)}
            </Button>
          ))}
        <Button
          variant="ghost"
          className="justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </ScrollArea>
  );
}