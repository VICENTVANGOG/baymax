import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai"; // Use OpenAI class directly

// Your OpenAI API Key
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey, // Pass the API key
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    try {
      const response = await openai.completions.create({
        model: "text-davinci-003", // Specify the model
        prompt: prompt,
        max_tokens: 150, // Customize tokens as needed
      });

      const reply = response.choices[0]?.text.trim();
      return res.status(200).json({ reply });
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
