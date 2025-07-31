import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use SERVICE_ROLE_KEY for direct database access
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { userId, planType } = await req.json();
    logStep("Request body parsed", { userId, planType });

    if (!userId) {
      logStep("ERROR: No userId provided");
      throw new Error("User ID is required");
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) {
      logStep("ERROR: Failed to get user profile", { error: userError.message });
      throw new Error(`Failed to get user profile: ${userError.message}`);
    }

    // Get user email from auth.users
    const { data: authData, error: authError } = await supabaseClient.auth.admin.getUserById(userId);
    if (authError || !authData.user?.email) {
      logStep("ERROR: Failed to get user email", { error: authError?.message });
      throw new Error("Failed to get user email");
    }

    const userEmail = authData.user.email;
    logStep("User data retrieved", { userId, email: userEmail });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Define pricing based on plan with correct Stripe Product IDs
    let priceItem;
    switch (planType) {
      case 'standard':
        priceItem = {
          price_data: {
            currency: "eur",
            product: "prod_SlUB14ASR3vgpr", // Stripe Product ID for Standard
            unit_amount: 85000, // 850€ in cents
            recurring: { interval: "year" },
          },
          quantity: 1,
        };
        break;
      case 'premium':
        priceItem = {
          price_data: {
            currency: "eur",
            product: "prod_SlUB37aA6zXGmY", // Stripe Product ID for Premium
            unit_amount: 300000, // 3000€ in cents
            recurring: { interval: "year" },
          },
          quantity: 1,
        };
        break;
      default:
        throw new Error("Invalid plan type");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [priceItem],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/profile?canceled=true`,
      metadata: {
        user_id: userId,
        plan_type: planType
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});