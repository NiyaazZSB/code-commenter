let isAnalyzing = false;

// Main function to generate code comments
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
        
        // Animate the result
        output.style.opacity = "0";
        setTimeout(() => {
            output.innerHTML = `<pre class="whitespace-pre-wrap font-sans">${comment}</pre>`;
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

// Function to clear the code input and reset the interface
function clearCode() {
    document.getElementById("codeInput").value = "";
    const output = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    
    output.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-lg mb-2">Ready to analyze your code</p>
                <p class="text-sm">Paste your code and click "Analyze Code" to get started</p>
            </div>
        </div>
    `;
    copyBtn.classList.add("hidden");
    document.getElementById("codeInput").focus();
}

// Function to copy the output text to clipboard
function copyOutput() {
    const output = document.getElementById("output");
    const text = output.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById("copyBtn");
        const originalContent = copyBtn.innerHTML;
        
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
    }).catch(() => {
        showMessage("Failed to copy to clipboard", "error");
    });
}

// Function to show messages (for future enhancements)
function showMessage(message, type = "info") {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Could be extended to show toast notifications
}

// Initialize Tailwind configuration
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                animation: {
                    'gradient': 'gradient 6s ease infinite',
                    'float': 'float 3s ease-in-out infinite',
                    'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
                    'typing': 'typing 2s steps(20) infinite'
                },
                keyframes: {
                    gradient: {
                        '0%, 100%': {
                            'background-size': '200% 200%',
                            'background-position': 'left center'
                        },
                        '50%': {
                            'background-size': '200% 200%',
                            'background-position': 'right center'
                        }
                    },
                    float: {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-10px)' }
                    },
                    'pulse-glow': {
                        '0%': { 'box-shadow': '0 0 20px rgba(139, 92, 246, 0.3)' },
                        '100%': { 'box-shadow': '0 0 40px rgba(139, 92, 246, 0.6)' }
                    },
                    typing: {
                        '0%, 50%': { opacity: '1' },
                        '51%, 100%': { opacity: '0' }
                    }
                }
            }
        }
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateComment();
        }
        
        if (e.key === 'Escape') {
            const codeInput = document.getElementById('codeInput');
            if (document.activeElement === codeInput) {
                codeInput.blur();
            }
        }
    });

    // Auto-resize textarea
    const textarea = document.getElementById('codeInput');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 500) + 'px';
        });

        // Focus on textarea when page loads
        textarea.focus();
    }

    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
});

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    const textarea = document.getElementById('codeInput');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 500) + 'px';
    }
});

// Prevent form submission if wrapped in a form
document.addEventListener('submit', function(e) {
    e.preventDefault();
    generateComment();
});

// Handle visibility change to pause/resume animations
document.addEventListener('visibilitychange', function() {
    const animatedElements = document.querySelectorAll('.animate-float, .animate-gradient, .animate-pulse-glow');
    
    if (document.hidden) {
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Performance optimization: Debounce textarea resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced resize function for textarea
const debouncedResize = debounce(function(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 500) + 'px';
}, 100);

// Utility function to format code for better display
function formatCodeOutput(text) {
    // Basic formatting improvements
    return text
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\t/g, '    '); // Convert tabs to spaces
}

// Error handling utility
function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    return `
        <div class="flex items-center text-red-400">
            <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
                <p class="font-semibold">Something went wrong</p>
                <p class="text-sm text-gray-400 mt-1">Please try again or check your connection.</p>
            </div>
        </div>
    `;
}

// Enhanced clipboard functionality with fallback
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (err) {
                textArea.remove();
                throw err;
            }
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
}

// Analytics and usage tracking (placeholder for future implementation)
function trackEvent(eventName, properties = {}) {
    // Placeholder for analytics
    console.log('Event:', eventName, properties);
}

// Initialize the application
function initializeApp() {
    // Track page load
    trackEvent('page_load');
    
    // Set initial focus
    const textarea = document.getElementById('codeInput');
    if (textarea) {
        setTimeout(() => textarea.focus(), 100);
    }
    
    // Add performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        });
    }
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
        