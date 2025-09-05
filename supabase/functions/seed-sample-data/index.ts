import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get or create an organization
    let orgResult = await supabaseAdmin.from('organizations').select('*').limit(1);
    let orgId;
    
    if (!orgResult.data || orgResult.data.length === 0) {
      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert([{ name: 'Premium Catering Co', tax_rate: 0.08 }])
        .select()
        .single();
      
      if (orgError) throw orgError;
      orgId = newOrg.id;
    } else {
      orgId = orgResult.data[0].id;
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error("User not authenticated");

    // Sample dishes
    const sampleDishes = [
      {
        name: "Herb-Crusted Salmon",
        description: "Fresh Atlantic salmon with herb crust, served with lemon butter sauce",
        base_price_per_guest: 28.50,
        is_gluten_free: true,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Beef Tenderloin",
        description: "Prime beef tenderloin with roasted vegetables and red wine reduction",
        base_price_per_guest: 35.00,
        is_gluten_free: true,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Vegetarian Wellington",
        description: "Mushroom and spinach wellington with puff pastry",
        base_price_per_guest: 22.00,
        is_vegetarian: true,
        is_vegan: false,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Chicken Marsala",
        description: "Pan-seared chicken breast with marsala wine sauce and mushrooms",
        base_price_per_guest: 24.00,
        is_gluten_free: false,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Quinoa Power Bowl",
        description: "Organic quinoa with roasted vegetables, avocado, and tahini dressing",
        base_price_per_guest: 18.00,
        is_vegetarian: true,
        is_vegan: true,
        is_gluten_free: true,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Mediterranean Sea Bass",
        description: "Grilled sea bass with olive tapenade and roasted tomatoes",
        base_price_per_guest: 32.00,
        is_gluten_free: true,
        user_id: user.id,
        organization_id: orgId
      }
    ];

    // Insert dishes
    const { data: dishes, error: dishError } = await supabaseAdmin
      .from('dishes')
      .insert(sampleDishes)
      .select();
    
    if (dishError) throw dishError;

    // Sample packages
    const samplePackages = [
      {
        name: "Executive Lunch Package",
        description: "Perfect for corporate meetings and business lunches",
        price_per_guest: 32.00,
        min_guests: 10,
        prep_time: 45,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Wedding Reception Deluxe",
        description: "Elegant three-course meal perfect for wedding celebrations",
        price_per_guest: 85.00,
        min_guests: 50,
        prep_time: 120,
        user_id: user.id,
        organization_id: orgId
      },
      {
        name: "Casual Gathering",
        description: "Relaxed menu perfect for informal events and parties",
        price_per_guest: 25.00,
        min_guests: 15,
        prep_time: 60,
        user_id: user.id,
        organization_id: orgId
      }
    ];

    // Insert packages
    const { data: packages, error: packageError } = await supabaseAdmin
      .from('packages')
      .insert(samplePackages)
      .select();
    
    if (packageError) throw packageError;

    // Add dishes to packages
    if (packages && dishes && packages.length > 0 && dishes.length > 0) {
      const packageItems = [
        // Executive Lunch Package
        { package_id: packages[0].id, dish_id: dishes[3].id, qty_per_guest: 1 }, // Chicken Marsala
        { package_id: packages[0].id, dish_id: dishes[4].id, qty_per_guest: 0.5 }, // Quinoa Bowl (side)
        
        // Wedding Reception Deluxe
        { package_id: packages[1].id, dish_id: dishes[1].id, qty_per_guest: 1 }, // Beef Tenderloin
        { package_id: packages[1].id, dish_id: dishes[0].id, qty_per_guest: 0.5 }, // Salmon (alternative)
        
        // Casual Gathering
        { package_id: packages[2].id, dish_id: dishes[3].id, qty_per_guest: 1 }, // Chicken Marsala
        { package_id: packages[2].id, dish_id: dishes[2].id, qty_per_guest: 0.3 }, // Vegetarian option
      ];

      await supabaseAdmin.from('package_items').insert(packageItems);
    }

    // Sample client
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert([{
        name: "Tech Innovations Inc",
        email: "events@techinnovations.com",
        phone: "(555) 123-4567",
        address: "123 Business Ave",
        city: "San Francisco",
        state: "CA",
        zip_code: "94105",
        practice_type: "Corporate",
        organization_id: orgId
      }])
      .select()
      .single();
    
    if (clientError) throw clientError;

    // Sample events
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const sampleEvents = [
      {
        title: "Annual Board Meeting Lunch",
        client_name: "Tech Innovations Inc",
        event_date: today.toISOString().split('T')[0],
        event_time: "12:00:00",
        number_of_guests: 25,
        status: "confirmed",
        address: "123 Business Ave, San Francisco, CA",
        user_id: user.id,
        organization_id: orgId,
        total_revenue: 800.00,
        food_cost: 400.00,
        labor_cost: 200.00,
        deposit_amount: 200.00,
        deposit_paid: true
      },
      {
        title: "Product Launch Celebration",
        client_name: "Tech Innovations Inc",
        event_date: nextWeek.toISOString().split('T')[0],
        event_time: "18:30:00",
        number_of_guests: 75,
        status: "booked",
        address: "456 Innovation Plaza, San Francisco, CA",
        user_id: user.id,
        organization_id: orgId,
        total_revenue: 2250.00,
        food_cost: 1125.00,
        labor_cost: 450.00,
        deposit_amount: 500.00,
        deposit_paid: false
      },
      {
        title: "Executive Team Retreat",
        client_name: "Tech Innovations Inc",
        event_date: nextMonth.toISOString().split('T')[0],
        event_time: "11:00:00",
        number_of_guests: 15,
        status: "confirmed",
        address: "789 Mountain View Resort, CA",
        user_id: user.id,
        organization_id: orgId,
        total_revenue: 1275.00,
        food_cost: 637.50,
        labor_cost: 255.00,
        deposit_amount: 300.00,
        deposit_paid: true
      }
    ];

    // Insert events
    const { data: events, error: eventError } = await supabaseAdmin
      .from('events')
      .insert(sampleEvents)
      .select();
    
    if (eventError) throw eventError;

    // Sample staff
    const sampleStaff = [
      {
        name: "Sarah Johnson",
        email: "sarah@premiumcatering.com",
        phone: "(555) 234-5678",
        role: "Head Chef",
        hourly_rate: 35.00,
        default_flat_fee: 280.00,
        user_id: user.id
      },
      {
        name: "Mike Rodriguez",
        email: "mike@premiumcatering.com",
        phone: "(555) 345-6789",
        role: "Event Coordinator",
        hourly_rate: 25.00,
        default_flat_fee: 200.00,
        user_id: user.id
      },
      {
        name: "Emma Davis",
        email: "emma@premiumcatering.com",
        phone: "(555) 456-7890",
        role: "Server",
        hourly_rate: 18.00,
        default_flat_fee: 144.00,
        user_id: user.id
      }
    ];

    // Insert staff
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert(sampleStaff)
      .select();
    
    if (staffError) throw staffError;

    // Sample invoices
    if (events && events.length > 0) {
      const sampleInvoices = [
        {
          invoice_number: "INV-2024-001",
          event_id: events[0].id,
          client_id: client.id,
          billing_period_start: today.toISOString().split('T')[0],
          billing_period_end: today.toISOString().split('T')[0],
          total_collections: 800.00,
          fee_percentage: 0.10,
          invoice_amount: 800.00,
          subtotal: 740.74,
          tax: 59.26,
          deposit_amount: 200.00,
          balance_due: 600.00,
          status: "sent",
          issued_at: today.toISOString(),
          due_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payment_terms: "Net 30"
        }
      ];

      await supabaseAdmin.from('invoices').insert(sampleInvoices);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sample data created successfully",
        data: {
          dishes: dishes?.length || 0,
          packages: packages?.length || 0,
          events: events?.length || 0,
          staff: staff?.length || 0,
          organization: orgId
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error seeding data:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});