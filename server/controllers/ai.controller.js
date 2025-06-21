import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const chatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemPrompt = "You are an intelligent assistant that explains social media posts and user messages clearly, Explain the input clearly but briefly. Keep it under 200 words i.e 2-3 sentences or according to post length.If the input is not understandable, respond with 'Sorry, I couldn't understand that.Don't overexplain.it";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Error: ${errorText}`);
    }

    const data = await response.json();
    console.log("AI Response:", data);
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error("Error in AI controller:", error.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
};
