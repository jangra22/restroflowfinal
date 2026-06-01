/**
 * ====================================================================
 * GANESHWARAM SIGNATURE - PRODUCTION AGGREGATOR ORDER WEBHOOK RECEIVER
 * ====================================================================
 * Platform: Node.js (Express)
 * Integration Gateway: Zomato, Swiggy, or UrbanPiper APIs
 * Target Database: Supabase PostgreSQL Cloud instance
 * ====================================================================
 */

require('dotenv').config(); // Load secure cloud credentials
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json()); // Process incoming JSON dockets

// 1. Initialize Connection with Supabase PostgreSQL client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("CRITICAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. Map of Aggregator Dish IDs to internal POS Menu IDs (Menu matching database)
const ITEM_MAP = {
    "ZOM-BUTTER-CHICKEN": "m1",
    "SWI-BUTTER-CHICKEN": "m1",
    "ZOM-PANEER-TIKKA": "m2",
    "SWI-PANEER-TIKKA": "m2",
    "ZOM-PANEER-PIZZA": "m3",
    "SWI-PANEER-PIZZA": "m3",
    "ZOM-CHICKEN-PIZZA": "m4",
    "SWI-CHICKEN-PIZZA": "m4",
    "ZOM-LASSI": "m5",
    "SWI-LASSI": "m5",
    "ZOM-CHAI": "m6",
    "SWI-CHAI": "m6",
    "ZOM-JAMUN": "m7",
    "SWI-JAMUN": "m7"
};

// 3. Webhook receiver route
app.post('/api/v1/docket-receiver', async (req, res) => {
    // A. Verify secure HTTP header key signature to block unauthorized traffic
    const gatewaySignature = req.headers['x-aggregator-signature'];
    const expectedSignature = process.env.WEBHOOK_SECRET || 'ganeshwaram_secure_key_2026';

    if (gatewaySignature !== expectedSignature) {
        // Log security alert in db
        await supabase.from('security_logs').insert([{
            level: 'WARNING',
            message: `Unauthorized webhook POST attempt blocked from source IP: ${req.ip}`
        }]);
        return res.status(401).json({ error: "Access unauthorized. Invalid signature token." });
    }

    const payload = req.body;
    
    try {
        console.log(`Processing incoming delivery docket ID: ${payload.order_id} from ${payload.platform}`);

        // B. Process items list and map aggregator dish IDs to internal POS recipe IDs
        const parsedItems = payload.items.map(item => {
            const posItemId = ITEM_MAP[item.aggregator_item_id] || "m6"; // Fallback to Masala Chai if missing
            return {
                id: posItemId,
                name: item.name,
                qty: item.quantity,
                price: item.price,
                customizations: item.customizations || []
            };
        });

        // C. Record docket order directly into central PostgreSQL DB
        const { data: insertedOrder, error: orderError } = await supabase
            .from('orders')
            .insert([{
                id: payload.order_id,
                status: 'pending',
                payment_status: 'paid', // Aggregator orders are pre-paid
                payment_method: `${payload.platform} API`,
                items: parsedItems,
                subtotal: payload.financials.subtotal,
                tax: payload.financials.tax,
                total: payload.financials.grand_total,
                order_type: 'Delivery'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // D. Trigger Ingredient Depletions automatically
        for (const item of parsedItems) {
            // Fetch ingredients recipe mapped to menu ID
            const { data: menuDish, error: menuError } = await supabase
                .from('menu')
                .select('ingredients')
                .eq('id', item.id)
                .single();

            if (menuError || !menuDish) continue;

            // Deduct recipe items from stock
            for (const [ingredientKey, amountUsed] of Object.entries(menuDish.ingredients)) {
                // Read current stock
                const { data: currentStock, error: stockFetchError } = await supabase
                    .from('inventory')
                    .select('qty, name')
                    .eq('key', ingredientKey)
                    .single();

                if (stockFetchError || !currentStock) continue;

                const newQty = Math.max(0, currentStock.qty - (amountUsed * item.qty));

                // Update database
                await supabase
                    .from('inventory')
                    .update({ qty: newQty })
                    .eq('key', ingredientKey);
                
                // If stock drops below threshold, log low stock alert
                const { data: updatedStock } = await supabase
                    .from('inventory')
                    .select('qty, min_threshold')
                    .eq('key', ingredientKey)
                    .single();

                if (updatedStock && updatedStock.qty <= updatedStock.min_threshold) {
                    await supabase.from('security_logs').insert([{
                        level: 'WARNING',
                        message: `Low Stock Alert: Raw ingredient '${currentStock.name}' is low (${updatedStock.qty} units left).`
                    }]);
                }
            }
        }

        // E. Log secure audit record
        await supabase.from('security_logs').insert([{
            level: 'INFO',
            message: `Successfully accepted delivery order docket ${payload.order_id} from ${payload.platform}. KOT dispatched.`
        }]);

        // F. Respond with 200 OK to aggregator to finalize pipeline transaction
        return res.status(200).json({
            status: "success",
            message: "Order successfully accepted, mapped, and KOT dispatched.",
            pos_transaction_id: payload.order_id
        });

    } catch (err) {
        console.error("Aggregator Webhook Processing Error:", err);
        
        // Log error inside security audit db
        await supabase.from('security_logs').insert([{
            level: 'ERROR',
            message: `Failed to process webhook transaction ${payload.order_id || 'unknown'} from ${payload.platform || 'unknown'}: ${err.message}`
        }]);

        return res.status(500).json({ error: "Failed to process docket integration", details: err.message });
    }
});

// App Launcher
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Ganeshwaram Aggregator Webhook Receiver Online     `);
    console.log(` Mode: Production API Gateway Endpoint              `);
    console.log(` API Endpoint: http://localhost:${PORT}/api/v1/docket-receiver `);
    console.log(`====================================================`);
});
