import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, password } = await req.json();

    // 1. Check if there are any admin users
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (adminError) {
      throw adminError;
    }

    if (adminUsers.length > 0) {
      return new Response(
        JSON.stringify({ error: "An admin user already exists." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Create the new user
    const { data: authData, error: signUpError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user.");
    }

    // 3. Assign the admin role
    const { error: roleError } = await supabaseClient
      .from("user_roles")
      .insert([{ user_id: authData.user.id, role: "admin" }]);

    if (roleError) {
      // If role assignment fails, delete the user to avoid an orphaned user
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw roleError;
    }

    return new Response(
      JSON.stringify({ message: "Admin user created successfully." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
