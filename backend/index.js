require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Manually set CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://code-commenter-frontend.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ✅ Handle preflight requests
app.options('/explain', (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());

const COHERE_API_KEY = process.env.COHERE_API_KEY;

app.post('/explain', async (req, res) => {
  try {
    const code = req.body.code;
    console.log("Received code:", code);

    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt: `Explain what the following code does:\n${code}`,
        max_tokens: 10000,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const comment = response.data.generations?.[0]?.text?.trim() || "No explanation found.";
    res.json({ comment });
  } catch (error) {
    console.error("Error generating comment:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      res.status(500).json({ error: error.response.data });
    } else {
      console.error("Message:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
