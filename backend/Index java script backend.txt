require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // <-- Add this line
const app = express();
const PORT = process.env.PORT || 3000;

// Use the cors middleware for your frontend origin
app.use(cors({
  origin: 'https://code-commenter-frontend.netlify.app'
}));

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
        max_tokens: 2000,
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

// Add the /chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log("Received chat message:", message);

    // Build conversation prompt
    let prompt = '';
    if (Array.isArray(history)) {
      for (const entry of history) {
        if (entry.sender === 'user') {
          prompt += `User: ${entry.message}\n`;
        } else {
          prompt += `AI: ${entry.message}\n`;
        }
      }
    }
    prompt += `User: ${message}\nAI:`;

    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.generations?.[0]?.text?.trim() || "I couldn't process that chat message.";
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Error processing chat message:");
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