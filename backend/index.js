require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join("C:/Users/User/Desktop/Capaciti Demand Programme 2/Projects/code-commenter")));

const COHERE_API_KEY = process.env.COHERE_API_KEY;
//console.log("API KEY:", process.env.COHERE_API_KEY);


app.post('/explain', async (req, res) => {
  try {
    const code = req.body.code;
    console.log("Received code:", code);

    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command', // Use 'command' for most accounts
        prompt: `Explain what the following code does:\n${code}`,
        max_tokens: 1000,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Raw response:", response.data);

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
  console.log(`Server running on http://localhost:${PORT}`);
});
