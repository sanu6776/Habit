exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const pageUrl = body.page || "unknown";
    const eventTime = Math.floor(Date.now() / 1000);

    const PIXEL_ID = process.env.FB_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.error("Missing FB_PIXEL_ID or FB_ACCESS_TOKEN");
      return {
        statusCode: 500,
        body: "Missing Facebook configuration",
      };
    }

    const clientIp =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "0.0.0.0";

    const userAgent = event.headers["user-agent"] || "unknown";

    const payload = {
      data: [
        {
          event_name: "InitiateCheckout",
          event_time: eventTime,
          action_source: "website",
          event_source_url: pageUrl,
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
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
    console.log("CTA CAPI response:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("CTA CAPI error:", error);
    return {
      statusCode: 500,
      body: "Server error",
    };
  }
};
