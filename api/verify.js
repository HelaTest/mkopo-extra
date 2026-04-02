export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Reference is required" });
  }

  try {
    const response = await fetch(
      `https://hashpay.stkpush.co.ke/api/verify-payment/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Verification proxy failed",
      details: error.message,
    });
  }
}