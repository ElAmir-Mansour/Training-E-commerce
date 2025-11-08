import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      console.log("[useAuth] Checking admin role for user:", userId);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("[useAuth] Error checking admin role:", error);
        return false;
      }

      console.log("[useAuth] Admin check result:", !!data);
      return !!data;
    } catch (error) {
      console.error("[useAuth] Error in checkAdminRole:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("[useAuth] Effect started");

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("[useAuth] Auth state changed:", event, "has session:", !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const adminStatus = await checkAdminRole(session.user.id);
          if (mounted) {
            setIsAdmin(adminStatus);
            setLoading(false);
            console.log("[useAuth] Loading complete (auth change), isAdmin:", adminStatus);
          }
        } else {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
            console.log("[useAuth] Loading complete (no session)");
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      console.log("[useAuth] Initial session check:", !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await checkAdminRole(session.user.id);
        if (mounted) {
          setIsAdmin(adminStatus);
          setLoading(false);
          console.log("[useAuth] Loading complete (initial), isAdmin:", adminStatus);
        }
      } else {
        if (mounted) {
          setLoading(false);
          console.log("[useAuth] Loading complete (no initial session)");
        }
      }
    }).catch(error => {
      console.error("[useAuth] Error getting session:", error);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, isAdmin, loading, checkAdminRole };
};
