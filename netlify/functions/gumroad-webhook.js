import crypto from "crypto";

export async function handler(event) {
  try {
    const body = new URLSearchParams(event.body);

    const saleId = body.get("sale_id");
    const email = body.get("email");
    const priceCents = body.get("price");
    const productName = body.get("product_name");
    const currency = body.get("currency") || "USD";

    // ====== CONFIG (ONLY EDIT HERE) ======
    const PIXEL_ID = "PASTE_PIXEL_ID_HERE";
    const ACCESS_TOKEN = "PASTE_ACCESS_TOKEN_HERE";
    // ====================================

    const hashedEmail = crypto
      .createHash("sha256")
      .update(email.trim().toLowerCase())
      .digest("hex");

    const eventTime = Math.floor(Date.now() / 1000);

    const payload = {
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
            currency: currency.toUpperCase(),
            value: Number(priceCents) / 100,
            content_name: productName,
          },
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("Facebook CAPI response:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("CAPI error:", error);
    return {
      statusCode: 500,
      body: "CAPI failed",
    };
  }
}
