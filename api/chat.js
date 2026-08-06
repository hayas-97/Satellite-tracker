module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are Tracker AI, an AI assistant for a Satellite Tracker website. Answer clearly in plain text.\n\nUser: " +
                    message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.error) {
      return res.status(500).json({
        reply: data.error.message,
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      reply: err.message,
    });
  }
};
