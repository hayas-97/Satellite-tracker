module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    const { message } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://satellite-tracker-sigma-gray.vercel.app",
          "X-Title": "Tracker AI"
        },
        body: JSON.stringify({
          model: "fish-audio/s2.1-pro-free:free",
          messages: [
            {
              role: "system",
              content: "You are Tracker AI. Answer clearly in plain text. You can answer questions about satellites, weather, science, geography, technology and general knowledge."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: data.error?.message || "OpenRouter error"
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      reply: err.message
    });
  }
};
