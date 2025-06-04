async function generateComment() {
  const code = document.getElementById("codeInput").value;
  const output = document.getElementById("output");
  output.textContent = "Analyzing code...";

  try {
    const response = await fetch("http://localhost:3000/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    const comment = data.comment || "No explanation found.";
    output.textContent = comment;
  } catch (err) {
    output.textContent = "Error: Could not fetch explanation.";
  }
}
