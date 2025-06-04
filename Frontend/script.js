// Enhanced text formatting function using regex
function formatOutputText(text) {
    // Remove any existing HTML tags first
    text = text.replace(/<[^>]*>/g, '');
    
    // Format numbered lists (1. 2. 3. etc.)
    text = text.replace(/^(\d+\.\s+)(.+)$/gm, '<div class="mb-3"><span class="font-bold text-blue-400">$1</span>$2</div>');
    
    // Format bold headers (text followed by colon)
    text = text.replace(/\*\*([^*]+)\*\*:/g, '<h3 class="font-bold text-purple-400 mt-4 mb-2">$1:</h3>');
    
    // Format code blocks with triple backticks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
        return `<div class="my-4 bg-gray-800 rounded-lg border border-gray-600">
            <div class="px-3 py-2 bg-gray-700 rounded-t-lg border-b border-gray-600">
                <span class="text-xs text-gray-300 font-mono">${language || 'code'}</span>
            </div>
            <pre class="p-4 text-green-400 font-mono text-sm overflow-x-auto"><code>${code.trim()}</code></pre>
        </div>`;
    });
    
    // Format inline code with single backticks
    text = text.replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-800 text-green-400 rounded font-mono text-sm">$1</code>');
    
    // Format bullet points
    text = text.replace(/^[\s]*[-*]\s+(.+)$/gm, '<div class="ml-4 mb-2"><span class="text-purple-400 mr-2">•</span>$1</div>');
    
    // Format section headers (lines that end with colon and are standalone)
    text = text.replace(/^([A-Z][^:\n]*):$/gm, '<h2 class="font-bold text-blue-300 text-lg mt-6 mb-3 border-b border-gray-600 pb-2">$1</h2>');
    
    // Format emphasis with **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    
    // Format emphasis with *text*
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-blue-200">$1</em>');
    
    // Format function names and technical terms
    text = text.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(\)/g, '<span class="text-yellow-400 font-mono">$1()</span>');
    
    // Format variable names in quotes
    text = text.replace(/'([^']+)'/g, '<span class="text-cyan-400 font-mono">\'$1\'</span>');
    text = text.replace(/"([^"]+)"/g, '<span class="text-cyan-400 font-mono">"$1"</span>');
    
    // Convert line breaks to proper spacing
    text = text.replace(/\n\n/g, '<div class="mb-4"></div>');
    text = text.replace(/\n/g, '<br>');
    
    // Wrap paragraphs
    text = text.split('<div class="mb-4"></div>').map(paragraph => {
        if (paragraph.trim() && !paragraph.includes('<h') && !paragraph.includes('<div class="mb-3">')) {
            return `<p class="mb-4 leading-relaxed">${paragraph}</p>`;
        }
        return paragraph;
    }).join('<div class="mb-4"></div>');
    
    return text;
}

// Update the main generateComment function to use the formatter
async function generateComment() {
    if (isAnalyzing) return;
    
    const code = document.getElementById("codeInput").value.trim();
    const output = document.getElementById("output");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const statusIndicator = document.getElementById("statusIndicator");
    const copyBtn = document.getElementById("copyBtn");

    if (!code) {
        showMessage("Please enter some code to analyze.", "warning");
        return;
    }

    // Start loading state
    isAnalyzing = true;
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `
        <span class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            Analyzing...
        </span>
    `;
    statusIndicator.classList.remove("hidden");
    copyBtn.classList.add("hidden");

    // Show typing animation
    output.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mr-3"></div>
            <span class="text-purple-400">Analyzing your code</span>
            <span class="loading-dots relative ml-1"></span>
        </div>
    `;

    try {
        const response = await fetch("https://code-commenter.onrender.com/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });

        const data = await response.json();
        const comment = data.comment || "No explanation found.";
        
        // Format the text with enhanced markup
        const formattedComment = formatOutputText(comment);
        
        // Animate the result
        output.style.opacity = "0";
        setTimeout(() => {
            output.innerHTML = `<div class="formatted-output">${formattedComment}</div>`;
            output.style.opacity = "1";
            copyBtn.classList.remove("hidden");
        }, 300);

    } catch (err) {
        output.style.opacity = "0";
        setTimeout(() => {
            output.innerHTML = `
                <div class="flex items-center text-red-400">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <p class="font-semibold">Connection Error</p>
                        <p class="text-sm text-gray-400 mt-1">Could not fetch explanation. Please check your connection and try again.</p>
                    </div>
                </div>
            `;
            output.style.opacity = "1";
        }, 300);
    } finally {
        // Reset button state
        isAnalyzing = false;
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `
            <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Analyze Code
            </span>
        `;
        statusIndicator.classList.add("hidden");
    }
}

// Enhanced copy function to handle formatted text
function copyOutput() {
    const output = document.getElementById("output");
    // Get plain text version for clipboard
    const text = output.textContent || output.innerText;
    
    copyToClipboard(text).then(success => {
        const copyBtn = document.getElementById("copyBtn");
        const originalContent = copyBtn.innerHTML;
        
        if (success) {
            copyBtn.innerHTML = `
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Copied!
                </span>
            `;
            copyBtn.classList.add("bg-green-600", "hover:bg-green-700");
            copyBtn.classList.remove("bg-gray-700", "hover:bg-gray-600");
            
            setTimeout(() => {
                copyBtn.innerHTML = originalContent;
                copyBtn.classList.remove("bg-green-600", "hover:bg-green-700");
                copyBtn.classList.add("bg-gray-700", "hover:bg-gray-600");
            }, 2000);
        } else {
            showMessage("Failed to copy to clipboard", "error");
        }
    });
}