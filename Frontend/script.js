let isAnalyzing = false;
let currentFiles = [];

// Animated Background Setup
function initializeAnimatedBackground() {
    const TILE_SIZE = 120;
    const CONTAINER_TILE_SIZE = 80;
    const LOGO_SIZE = 64;
    const CONTAINER_LOGO_SIZE = 48;
    const body = document.body;
    
    // Get current theme colors
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const BG_COLOR = isDark ? '#0f172a' : '#ffffff';
    const LOGO_COLOR = isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'; // Much more visible purple
    
    // Create a pattern tile for body
    const canvas = document.createElement('canvas');
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const ctx = canvas.getContext('2d');
    
    // Create a pattern tile for container
    const containerCanvas = document.createElement('canvas');
    containerCanvas.width = CONTAINER_TILE_SIZE;
    containerCanvas.height = CONTAINER_TILE_SIZE;
    const containerCtx = containerCanvas.getContext('2d');
    
    if (ctx && containerCtx) {
        // Create body pattern
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        
        // Create container pattern
        containerCtx.fillStyle = 'transparent';
        containerCtx.fillRect(0, 0, CONTAINER_TILE_SIZE, CONTAINER_TILE_SIZE);
        
        // Create the laptop-code SVG as an image
        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="${LOGO_SIZE}" height="${LOGO_SIZE}">
                <path fill="${LOGO_COLOR}" d="M64 96c0-35.3 28.7-64 64-64l384 0c35.3 0 64 28.7 64 64l0 256-64 0 0-256L128 96l0 256-64 0L64 96zM0 403.2C0 392.6 8.6 384 19.2 384l601.6 0c10.6 0 19.2 8.6 19.2 19.2c0 42.4-34.4 76.8-76.8 76.8L76.8 480C34.4 480 0 445.6 0 403.2zM281 209l-31 31 31 31c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-48-48c-9.4-9.4-9.4-24.6 0-33.9l48-48c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM393 175l48 48c9.4 9.4 9.4 24.6 0 33.9l-48 48c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l31-31-31-31c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/>
            </svg>
        `;
        
        const containerSvgData = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="${CONTAINER_LOGO_SIZE}" height="${CONTAINER_LOGO_SIZE}">
                <path fill="${LOGO_COLOR}" d="M64 96c0-35.3 28.7-64 64-64l384 0c35.3 0 64 28.7 64 64l0 256-64 0 0-256L128 96l0 256-64 0L64 96zM0 403.2C0 392.6 8.6 384 19.2 384l601.6 0c10.6 0 19.2 8.6 19.2 19.2c0 42.4-34.4 76.8-76.8 76.8L76.8 480C34.4 480 0 445.6 0 403.2zM281 209l-31 31 31 31c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-48-48c-9.4-9.4-9.4-24.6 0-33.9l48-48c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM393 175l48 48c9.4 9.4 9.4 24.6 0 33.9l-48 48c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l31-31-31-31c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/>
            </svg>
        `;
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const containerSvgBlob = new Blob([containerSvgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const containerUrl = URL.createObjectURL(containerSvgBlob);
        
        const img = new Image();
        const containerImg = new Image();
        
        let loadedCount = 0;
        const totalImages = 2;
        
        function onImageLoad() {
            loadedCount++;
            if (loadedCount === totalImages) {
                // Draw body pattern
                ctx.drawImage(
                    img,
                    (TILE_SIZE - LOGO_SIZE) / 2,
                    (TILE_SIZE - LOGO_SIZE) / 2,
                    LOGO_SIZE,
                    LOGO_SIZE
                );
                
                // Draw container pattern
                containerCtx.drawImage(
                    containerImg,
                    (CONTAINER_TILE_SIZE - CONTAINER_LOGO_SIZE) / 2,
                    (CONTAINER_TILE_SIZE - CONTAINER_LOGO_SIZE) / 2,
                    CONTAINER_LOGO_SIZE,
                    CONTAINER_LOGO_SIZE
                );
                
                const patternDataUrl = canvas.toDataURL();
                const containerPatternDataUrl = containerCanvas.toDataURL();
                
                // Apply the pattern to body
                body.style.backgroundImage = `url('${patternDataUrl}')`;
                body.style.backgroundRepeat = 'repeat';
                body.style.backgroundSize = `${TILE_SIZE}px ${TILE_SIZE}px`;
                body.style.animation = 'code-diagonal-move 20s linear infinite';
                body.classList.add('animated-bg');
                
                // Set CSS custom property for container overlay
                document.documentElement.style.setProperty('--container-bg-pattern', `url('${containerPatternDataUrl}')`);
                
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(containerUrl);
            }
        }
        
        img.onload = onImageLoad;
        containerImg.onload = onImageLoad;
        img.src = url;
        containerImg.src = containerUrl;
    }
    
    // Add keyframes if not already added
    if (!document.getElementById('animated-bg-style')) {
        const style = document.createElement('style');
        style.id = 'animated-bg-style';
        style.innerHTML = `
            @keyframes code-diagonal-move { 
                0% { background-position: 0 0; } 
                100% { background-position: ${TILE_SIZE}px ${TILE_SIZE}px; } 
            }
            @keyframes code-diagonal-move-overlay { 
                0% { background-position: 0 0; } 
                100% { background-position: ${CONTAINER_TILE_SIZE}px ${CONTAINER_TILE_SIZE}px; } 
            }
        `;
        document.head.appendChild(style);
    }
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    setTheme(theme);
    updateThemeToggle(theme);
    
    // Initialize animated background after theme is set
    setTimeout(() => {
        initializeAnimatedBackground();
    }, 100);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update CSS custom properties
    const root = document.documentElement;
    if (theme === 'dark') {
        root.style.setProperty('--bg-primary', '#0f172a');
        root.style.setProperty('--bg-secondary', '#1e293b');
        root.style.setProperty('--bg-surface', '#334155');
        root.style.setProperty('--text-primary', '#f1f5f9');
        root.style.setProperty('--text-secondary', '#94a3b8');
        root.style.setProperty('--border-color', '#475569');
        root.style.setProperty('--accent-color', '#6366f1');
    } else {
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8fafc');
        root.style.setProperty('--bg-surface', '#e2e8f0');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#475569');
        root.style.setProperty('--border-color', '#cbd5e1');
        root.style.setProperty('--accent-color', '#6366f1');
    }
    
    // Reinitialize animated background with new theme colors
    setTimeout(() => {
        initializeAnimatedBackground();
    }, 100);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    
    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Update buttons
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    tabContents.forEach(content => {
        content.classList.add('hidden');
        if (content.id === tabName + 'Tab') {
            content.classList.remove('hidden');
        }
    });
}

// File Upload Management
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const fileList = document.getElementById('fileList');
    const fileItems = document.getElementById('fileItems');
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);
    dropZone.addEventListener('click', () => fileInput.click());
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('border-purple-500', 'bg-purple-500', 'bg-opacity-10');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('border-purple-500', 'bg-purple-500', 'bg-opacity-10');
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('border-purple-500', 'bg-purple-500', 'bg-opacity-10');
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    const validExtensions = ['.js', '.py', '.java', '.cpp', '.c', '.html', '.css', '.php', '.rb', '.go', '.rs', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];
    const validFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return validExtensions.includes(extension);
    });
    
    if (validFiles.length === 0) {
        showMessage('Please select valid code files', 'warning');
        return;
    }
    
    currentFiles = validFiles;
    displayFileList(validFiles);
    loadFileContents(validFiles);
}

function displayFileList(files) {
    const fileList = document.getElementById('fileList');
    const fileItems = document.getElementById('fileItems');
    
    fileItems.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between bg-surface p-3 rounded-xl';
        fileItem.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div>
                    <p class="text-primary font-medium">${file.name}</p>
                    <p class="text-secondary text-sm">${formatFileSize(file.size)}</p>
                </div>
            </div>
            <button onclick="removeFile(${index})" class="text-red-400 hover:text-red-300 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        fileItems.appendChild(fileItem);
    });
    
    fileList.classList.remove('hidden');
}

function removeFile(index) {
    currentFiles.splice(index, 1);
    
    if (currentFiles.length === 0) {
        document.getElementById('fileList').classList.add('hidden');
        document.getElementById('codeInput').value = '';
    } else {
        displayFileList(currentFiles);
        loadFileContents(currentFiles);
    }
}

function loadFileContents(files) {
    const codeInput = document.getElementById('codeInput');
    let combinedContent = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const language = detectLanguage(file.name);
            
            combinedContent += `// File: ${file.name}\n`;
            combinedContent += `// Language: ${language}\n`;
            combinedContent += `${'='.repeat(50)}\n\n`;
            combinedContent += content;
            combinedContent += '\n\n';
            
            if (index === files.length - 1) {
                codeInput.value = combinedContent;
                autoResizeTextarea(codeInput);
                updateLanguageDetector(language);
            }
        };
        reader.readAsText(file);
    });
}

// Language Detection
function detectLanguage(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
        'js': 'JavaScript',
        'jsx': 'React JSX',
        'ts': 'TypeScript',
        'tsx': 'React TSX',
        'py': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C',
        'html': 'HTML',
        'css': 'CSS',
        'php': 'PHP',
        'rb': 'Ruby',
        'go': 'Go',
        'rs': 'Rust',
        'vue': 'Vue.js',
        'svelte': 'Svelte'
    };
    
    return languageMap[extension] || 'Unknown';
}

function updateLanguageDetector(language) {
    const detector = document.getElementById('languageDetector');
    const languageSpan = document.getElementById('detectedLanguage');
    
    if (language && language !== 'Unknown') {
        languageSpan.textContent = language;
        detector.classList.remove('hidden');
    } else {
        detector.classList.add('hidden');
    }
}

// Auto-detect language from code content
function detectLanguageFromCode(code) {
    const patterns = {
        'JavaScript': [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/],
        'Python': [/def\s+\w+\s*\(/, /import\s+\w+/, /from\s+\w+\s+import/, /class\s+\w+\s*:/],
        'Java': [/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /import\s+java\./],
        'C++': [/#include\s*<\w+>/, /using\s+namespace\s+std/, /int\s+main\s*\(/],
        'HTML': [/<html/, /<div/, /<script/, /<style/],
        'CSS': [/\.\w+\s*{/, /#\w+\s*{/, /\w+\s*:\s*\w+;/]
    };
    
    for (const [language, regexes] of Object.entries(patterns)) {
        if (regexes.some(regex => regex.test(code))) {
            return language;
        }
    }
    
    return 'Unknown';
}

// Enhanced Main Analysis Function
async function generateComment() {
    if (isAnalyzing) return;
    
    const code = document.getElementById("codeInput").value.trim();
    const output = document.getElementById("output");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const statusIndicator = document.getElementById("statusIndicator");
    const copyBtn = document.getElementById("copyBtn");

    if (!code) {
        showMessage("Please enter some code to analyze or upload files.", "warning");
        return;
    }

    // Auto-detect language if not already detected
    const detectedLang = detectLanguageFromCode(code);
    updateLanguageDetector(detectedLang);

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

    // Show enhanced typing animation
    output.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mr-3"></div>
            <span class="text-purple-400">AI is analyzing your code</span>
            <span class="loading-dots relative ml-1">
                <span class="dot animate-pulse">.</span>
                <span class="dot animate-pulse" style="animation-delay: 0.2s;">.</span>
                <span class="dot animate-pulse" style="animation-delay: 0.4s;">.</span>
            </span>
        </div>
    `;

    try {
        const response = await fetch("https://code-commenter.onrender.com/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                code,
                language: detectedLang,
                files: currentFiles.map(f => f.name)
            }),
        });

        const data = await response.json();
        const comment = data.comment || "No explanation found.";
        
        // Animate the result with enhanced formatting
        output.style.opacity = "0";
        setTimeout(() => {
            output.innerHTML = `<div class="formatted-output">${formatOutput(comment)}</div>`;
            output.style.opacity = "1";
            copyBtn.classList.remove("hidden");
            
            // Scroll to output
            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);

        // Track successful analysis
        trackEvent('code_analyzed', { 
            language: detectedLang, 
            fileCount: currentFiles.length,
            codeLength: code.length 
        });

    } catch (err) {
        console.error('Analysis error:', err);
        output.style.opacity = "0";
        setTimeout(() => {
            output.innerHTML = handleError(err, 'during analysis');
            output.style.opacity = "1";
        }, 300);
        
        trackEvent('analysis_error', { error: err.message });
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

// Enhanced Output Formatting
function formatOutput(text) {
    // Convert markdown-like formatting to HTML
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    return `<p>${formatted}</p>`;
}

// Enhanced Clear Function
function clearCode() {
    document.getElementById("codeInput").value = "";
    document.getElementById('fileList').classList.add('hidden');
    document.getElementById('languageDetector').classList.add('hidden');
    currentFiles = [];
    
    const output = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    
    output.innerHTML = `
        <div class="flex items-center justify-center h-full text-secondary">
            <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-lg mb-2">Ready to analyze your code</p>
                <p class="text-sm">Paste your code or upload files and click "Analyze Code" to get started</p>
            </div>
        </div>
    `;
    copyBtn.classList.add("hidden");
    document.getElementById("codeInput").focus();
    
    trackEvent('code_cleared');
}

// Enhanced Copy Function
async function copyOutput() {
    const output = document.getElementById("output");
    const text = output.textContent;
    const copyBtn = document.getElementById("copyBtn");
    
    const success = await copyToClipboard(text);
    
    if (success) {
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
        copyBtn.classList.remove("bg-accent", "hover:bg-accent-hover");
        
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.remove("bg-green-600", "hover:bg-green-700");
            copyBtn.classList.add("bg-accent", "hover:bg-accent-hover");
        }, 2000);
        
        trackEvent('output_copied');
    } else {
        showMessage("Failed to copy to clipboard", "error");
    }
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 500) + 'px';
}

function showMessage(message, type = "info") {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full`;
    
    const bgColor = {
        'info': 'bg-blue-600',
        'success': 'bg-green-600',
        'warning': 'bg-yellow-600',
        'error': 'bg-red-600'
    }[type] || 'bg-blue-600';
    
    toast.className += ` ${bgColor} text-white`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
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

// Enhanced error handling
function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    return `
        <div class="flex items-center text-red-400">
            <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
                <p class="font-semibold">Connection Error</p>
                <p class="text-sm text-gray-400 mt-1">Could not fetch explanation. Please check your connection and try again.</p>
                ${context && `<p class="text-xs text-gray-500 mt-1">Context: ${context}</p>`}
            </div>
        </div>
    `;
}

// Analytics and usage tracking
function trackEvent(eventName, properties = {}) {
    // Enhanced analytics placeholder
    const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...properties
    };
    
    console.log('Analytics Event:', eventData);
    
    // Here you would send to your analytics service
    // Example: analytics.track(eventName, properties);
}

// Performance monitoring
function initializePerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                trackEvent('page_performance', {
                    loadTime: loadTime,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                });
            }, 1000);
        });
    }
}

// Enhanced initialization
function initializeApp() {
    // Initialize all components
    initializeTheme();
    initializeTabs();
    initializeFileUpload();
    initializePerformanceMonitoring();
    initializeAnimatedBackground();
    
    // Set up event listeners
    setupEventListeners();
    
    // Track page load
    trackEvent('page_load', {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        theme: document.body.getAttribute('data-theme')
    });
    
    // Set initial focus
    const textarea = document.getElementById('codeInput');
    if (textarea) {
        setTimeout(() => textarea.focus(), 100);
    }
}

// Enhanced event listeners setup
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // System theme change detection
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
            updateThemeToggle(e.matches ? 'dark' : 'light');
        }
    });
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to analyze
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateComment();
        }
        
        // Ctrl/Cmd + K to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearCode();
        }
        
        // Ctrl/Cmd + D to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Escape to blur focused element
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }
    });

    // Auto-resize textarea with debouncing
    const textarea = document.getElementById('codeInput');
    if (textarea) {
        const debouncedResize = debounce(() => autoResizeTextarea(textarea), 100);
        textarea.addEventListener('input', debouncedResize);
        
        // Language detection on input
        textarea.addEventListener('input', debounce(() => {
            const code = textarea.value;
            if (code.length > 50) { // Only detect if there's substantial code
                const language = detectLanguageFromCode(code);
                updateLanguageDetector(language);
            }
        }, 500));
    }

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (textarea) {
            autoResizeTextarea(textarea);
        }
    }, 250));

    // Handle visibility change for performance
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

    // Form submission prevention
    document.addEventListener('submit', function(e) {
        e.preventDefault();
        generateComment();
    });
}

// Chat functionality
let chatHistory = [];

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendChatBtn');
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Disable input and button
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
    `;
    
    // Add user message to chat
    addMessageToChat('user', message);
    chatInput.value = '';
    
    try {
        const response = await fetch('https://code-commenter.onrender.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add AI response to chat
        addMessageToChat('ai', data.response);
        
    } catch (error) {
        console.error('Error sending chat message:', error);
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
    }
    
    // Re-enable input and button
    chatInput.disabled = false;
    sendBtn.disabled = false;
    sendBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
    `;
    chatInput.focus();
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove empty state if it exists
    if (chatMessages.querySelector('.text-center')) {
        chatMessages.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = `max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        sender === 'user' 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
            : 'bg-accent text-primary border border-accent'
    }`;
    
    // Use the EXACT same formatting as AI Analysis
    const formattedMessage = formatOutput(message);
    
    // Add sender label and message
    messageContent.innerHTML = `
        <div class="text-xs opacity-75 mb-1">${sender === 'user' ? 'You' : 'AI Assistant'}</div>
        <div class="text-sm leading-relaxed"><div class="formatted-output">${formattedMessage}</div></div>
    `;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Add to chat history
    chatHistory.push({ sender, message });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatHistory = [];
    
    chatMessages.innerHTML = `
        <div class="text-center text-secondary py-8">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="text-sm">Start a conversation about your code!</p>
            <p class="text-xs mt-1">Ask questions about programming, debugging, best practices, and more.</p>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debounce utility
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}