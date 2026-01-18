const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const pagePath = body.page || "/";
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

    const payload = {
      data: [
        {
          event_name: "PageView",
          event_time: eventTime,
          action_source: "website",
          event_source_url: pagePath,
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
    console.log("PageView CAPI response:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("PageView error:", error);
    return {
      statusCode: 500,
      body: "Server error",
    };
  }
};
