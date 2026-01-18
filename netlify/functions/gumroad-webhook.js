const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    // Gumroad sends data as form-encoded
    const body = new URLSearchParams(event.body || "");

    const saleId = body.get("sale_id") || `test_${Date.now()}`;
    const email = body.get("email") || "test@example.com";
    const priceCents = body.get("price") || "0";
    const productName = body.get("product_name") || "Unknown Product";
    const currency = (body.get("currency") || "USD").toUpperCase();

    // ===== ENV VARIABLES (DO NOT HARD-CODE) =====
    const PIXEL_ID = process.env.FB_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.error("Missing FB_PIXEL_ID or FB_ACCESS_TOKEN");
      return {
        statusCode: 500,
        body: "Missing Facebook configuration",
      };
    }

    // Hash email (required by Meta)
    const hashedEmail = crypto
      .createHash("sha256")
      .update(email.trim().toLowerCase())
      .digest("hex");

    const eventTime = Math.floor(Date.now() / 1000);

    // ===== FACEBOOK CAPI PAYLOAD =====
    const payload = {
      test_event_code: "TEST34331", // ⚠️ ONLY FOR TESTING (remove later)
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          action_source: "website",
          event_id: saleId,
          user_data: {
            em: hashedEmail,
          },
          custom_data: {
            currency: currency,
            value: Number(priceCents) / 100,
            content_name: productName,
          },
        },
      ],
    };

    // Send event to Facebook
    const fbResponse = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const fbResult = await fbResponse.json();
    console.log("Facebook CAPI response:", fbResult);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Webhook error:", error);
    return {
      statusCode: 500,
      body: "Server error",
    };
  }
};
