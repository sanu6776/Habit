exports.handler = async (event) => {
  try {
    // Gumroad sends data as form-encoded
    const body = new URLSearchParams(event.body);

    const saleId = body.get("sale_id");
    const email = body.get("email");
    const price = body.get("price"); // in cents
    const productName = body.get("product_name");
    const currency = body.get("currency");

    console.log("Gumroad purchase received:", {
      saleId,
      email,
      price,
      productName,
      currency,
    });

    // Gumroad ko OK response dena zaroori hota hai
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Webhook error:", error);

    return {
      statusCode: 500,
      body: "Webhook failed",
    };
  }
};
