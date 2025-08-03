import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check existing subscriber data first
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    // If user is manually set as premium, respect that and don't override with Stripe data
    if (existingSubscriber?.plan_type === 'premium' && existingSubscriber?.subscribed === true) {
      logStep("User has manual premium subscription", { 
        email: user.email, 
        planType: existingSubscriber.plan_type 
      });
      
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: 'Premium',
        subscription_end: existingSubscriber.subscription_end,
        plan_type: 'premium',
        trial_active: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Check trial status before setting to freemium
      const trialActive = existingSubscriber?.trial_end ? 
        new Date(existingSubscriber.trial_end) > new Date() : false;
      
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        plan_type: 'freemium',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: 'freemium',
        trial_active: trialActive 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let planType = 'freemium';

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount >= 300000) { // 3000€
        subscriptionTier = "Premium";
        planType = "premium";
      } else if (amount >= 85000) { // 850€
        subscriptionTier = "Standard";
        planType = "standard";
      } else {
        subscriptionTier = "Basic";
        planType = "standard";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier, planType });
    }

    // Check trial status
    const { data: subscriberData } = await supabaseClient
      .from("subscribers")
      .select("trial_end")
      .eq("user_id", user.id)
      .single();

    const trialActive = subscriberData?.trial_end ? 
      new Date(subscriberData.trial_end) > new Date() : false;

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      plan_type: planType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Update search quotas based on plan
    let searchLimit = 10; // freemium default
    let exportLimit = 0;  // freemium default

    if (hasActiveSub) {
      searchLimit = planType === 'premium' ? -1 : 1000; // unlimited for premium, 1000 for standard
      exportLimit = planType === 'premium' ? -1 : 100;  // unlimited for premium, 100 for standard
    } else if (trialActive) {
      searchLimit = 50;   // trial gets more searches
      exportLimit = 10;   // trial gets some exports
    }

    await supabaseClient.from("search_quotas").upsert({
      user_id: user.id,
      searches_limit: searchLimit,
      exports_limit: exportLimit,
      plan_type: planType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      planType,
      trialActive 
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      plan_type: planType,
      trial_active: trialActive
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});