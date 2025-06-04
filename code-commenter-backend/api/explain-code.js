export default async function handler(req, res) {
  const { code } = req.body;

  const prompt = `Explain this code in plain English:\n\n${code}`;

  const response = await fetch("https://api.cohere.ai/v1/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-r",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.6,
    }),
  });

  const data = await response.json();
  res.status(200).json({ result: data.generations[0].text.trim() });
}
