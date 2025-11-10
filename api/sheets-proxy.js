export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbz8UzQNHn1c7MlKqiU-1ikYp9-az0wCmS7H1pbZ5k8k2uic6pNbTeluSvNuJlhzTHPyUw/exec"; // 🔹 Ganti dengan URL kamu
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    return res.status(200).json({ message: text });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: error.toString() });
  }
}





























