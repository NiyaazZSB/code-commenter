# Code Commenter

**Live Demo:** [https://code-commenter-frontend.netlify.app/](https://code-commenter-frontend.netlify.app/)

## Overview
Code Commenter is a web application that uses AI to instantly analyze and explain code snippets or files. It helps developers understand, document, and gain insights into their code by providing natural language explanations powered by advanced AI models.

## Features
- **AI-Powered Code Analysis:** Paste code or upload files to receive instant, detailed explanations.
- **Multi-Language Support:** Works with all major programming languages and frameworks.
- **Modern UI:** Responsive, beautiful interface with light/dark themes and smooth user experience.
- **Chat Assistant:** Ask coding questions and get AI-powered answers (coding topics only).

## How It Works
- **Frontend:** Built with HTML, CSS (TailwindCSS), and JavaScript. The UI allows users to input code, upload files, and view AI-generated explanations.
- **Backend:** Node.js/Express server that connects to the Cohere AI API. It receives code from the frontend, sends it to the AI model, and returns the explanation.
- **Deployment:** The frontend is deployed on Netlify. The backend can be hosted on any Node.js-compatible server.

## Quick Start
1. **Frontend:**
   - Open `Frontend/index.html` in your browser or deploy to a static hosting service (like Netlify).
2. **Backend:**
   - Install dependencies: `npm install` in the `backend` folder.
   - Set up a `.env` file with your Cohere API key.
   - Start the server: `npm start`.
3. **Usage:**
   - Paste code or upload files in the web UI and click "Analyze Code" to get instant explanations.

---

Built with Node.js, Express, Cohere AI, and TailwindCSS.
