export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    // Extract first IP from header
    const rawIp = (event.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim();

    // Validate public IP
    const isValidIp =
      rawIp &&
      rawIp !== "unknown" &&
      rawIp !== "::1" &&
      !rawIp.startsWith("10.") &&
      !rawIp.startsWith("192.168") &&
      !rawIp.startsWith("172.");

    const user_data = {
      client_user_agent: event.headers["user-agent"] || ""
    };

    // Attach IP only if valid
    if (isValidIp) {
      user_data.client_ip_address = rawIp;
    }

    const payload = {
      data: [
        {
          event_name: "ViewContent",
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: body.page,
          action_source: "website",
          user_data,
          custom_data: {
            content_name: "HabitForge - Complete Habit Tracking System",
            content_type: "digital_product",
            value: 37,
            currency: "USD"
          }
        }
      ]
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    console.log("ViewContent CAPI:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("ViewContent CAPI error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false })
    };
  }
}
