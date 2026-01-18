export async function handler(event) {
  const body = JSON.parse(event.body || "{}");

  const payload = {
    data: [
      {
        event_name: "ViewContent",
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: body.page,
        action_source: "website",
        user_data: {
          client_ip_address:
            event.headers["x-forwarded-for"] || "",
          client_user_agent:
            event.headers["user-agent"]
        },
        custom_data: {
          content_name: "HabitForge - Complete Habit Tracking System",
          content_type: "digital_product",
          value: 37,
          currency: "USD"
        }
      }
    ]
  };

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  const json = await res.json();
  console.log("ViewContent CAPI:", json);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
}
