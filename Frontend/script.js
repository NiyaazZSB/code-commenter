let isAnalyzing = false;
let currentFiles = [];
const MAX_CODE_LENGTH = 4000; // Set your API-safe limit here


// Add at the top of script.js
const tabState = {
    code: {
        input: '',
        response: '',
        language: ''
    },
    file: {
        input: '',
        response: '',
        files: [],
        language: ''
    },
    chat: {
        messages: [],
        input: ''
    }
};

function showInputTooLargeMessage(currentLength) {
    // Show a toast as before
    showMessage(
        `Your code is too large (${currentLength} characters). The maximum allowed is ${MAX_CODE_LENGTH}. Please reduce your input and try again.`,
        "warning"
    );
    // Also show a persistent message in the output area
    const output = document.getElementById("output");
    if (output) {
        output.innerHTML = `
            <div class="flex items-center text-yellow-400">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="font-semibold">Input Too Large</p>
                    <p class="text-sm text-gray-400 mt-1">
                        Your code or files are too large to analyze at once.<br>
                        Please reduce the size or number of files and try again.
                    </p>
                </div>
            </div>
        `;
    }
    // Clear the code input and file list for reprompt
    const codeInput = document.getElementById("codeInput");
    if (codeInput) codeInput.value = "";
    const fileList = document.getElementById('fileList');
    if (fileList) fileList.classList.add('hidden');
    currentFiles = [];
}


// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    setTheme(theme);
    updateThemeToggle(theme);
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
    const outputSection = document.getElementById('outputSection');
    const inputSection = document.getElementById('inputSection');
    const mainGridInner = document.getElementById('mainGridInner');
    const chatTab = document.getElementById('chatTab');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const grid = document.getElementById('grid');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const previousTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
            const newTab = button.getAttribute('data-tab');
            
            // Save current state before switching
            if (previousTab === 'code' || previousTab === 'file') {
                saveTabState(previousTab);
            }

            // Switch tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.add('hidden'));

            // Handle button visibility based on tab
            if (newTab === 'chat') {
                if (analyzeBtn?.parentElement) analyzeBtn.parentElement.classList.add('hidden');
                if (clearBtn) clearBtn.classList.add('hidden');
                // Center the chat tab
                grid?.classList.add('chat-centered');
                document.getElementById('chatContainer')?.classList.add('chat-width');
            } else {
                if (analyzeBtn?.parentElement) analyzeBtn.parentElement.classList.remove('hidden');
                if (clearBtn) clearBtn.classList.remove('hidden');
                // Remove centering for other tabs
                grid?.classList.remove('chat-centered');
            }

            // Show appropriate content and handle layout
            if (newTab === 'code') {
                document.getElementById('codeTab')?.classList.remove('hidden');
                document.getElementById('fileTab')?.classList.add('hidden');
                document.getElementById('chatTab')?.classList.add('hidden');
                
                // Show output sections for code tab
                outputSection?.classList.remove('hidden');
                inputSection?.classList.remove('hidden');
                mainGridInner?.classList.add('lg:grid-cols-2');
                mainGridInner?.classList.remove('grid-cols-1');
                document.getElementById('output')?.parentElement?.classList.remove('hidden');
                document.getElementById('statusIndicator')?.classList.remove('hidden');
                
                restoreTabState('code');
                
            } else if (newTab === 'file') {
                document.getElementById('fileTab')?.classList.remove('hidden');
                document.getElementById('codeTab')?.classList.add('hidden');
                document.getElementById('chatTab')?.classList.add('hidden');
                
                // Show output sections for file tab
                outputSection?.classList.remove('hidden');
                inputSection?.classList.remove('hidden');
                mainGridInner?.classList.add('lg:grid-cols-2');
                mainGridInner?.classList.remove('grid-cols-1');
                document.getElementById('output')?.parentElement?.classList.remove('hidden');
                document.getElementById('statusIndicator')?.classList.remove('hidden');
                
                restoreTabState('file');
                
            } else if (newTab === 'chat') {
                document.getElementById('chatTab')?.classList.remove('hidden');
                document.getElementById('codeTab')?.classList.add('hidden');
                document.getElementById('fileTab')?.classList.add('hidden');
                
                // Hide output sections for chat tab
                outputSection?.classList.add('hidden');
                inputSection?.classList.add('hidden');
                mainGridInner?.classList.remove('lg:grid-cols-2');
                mainGridInner?.classList.add('grid-cols-1');
                document.getElementById('statusIndicator')?.classList.add('hidden');
                document.getElementById('output')?.parentElement?.classList.add('hidden');
                
                restoreTabState('chat');
            }
        });
    });
}

// Add this function right after initializeTabs
function ensureButtonsVisibility() {
    const currentTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');

    if (currentTab === 'chat') {
        if (analyzeBtn?.parentElement) analyzeBtn.parentElement.classList.add('hidden');
        if (clearBtn) clearBtn.classList.add('hidden');
    } else {
        if (analyzeBtn?.parentElement) analyzeBtn.parentElement.classList.remove('hidden');
        if (clearBtn) clearBtn.classList.remove('hidden');
    }
}

function saveTabState(tabName) {
    const codeInput = document.getElementById('codeInput');
    const output = document.getElementById('output');
    const languageDetector = document.getElementById('languageDetector');

    tabState[tabName].input = codeInput.value;
    tabState[tabName].response = output.innerHTML;
    tabState[tabName].language = languageDetector.innerHTML;

    if (tabName === 'file') {
        tabState.file.files = currentFiles;
    }
    // Add this at the end of the function:
    if (tabName === 'chat') {
        const chatInput = document.getElementById('chatInput');
        tabState.chat.input = chatInput ? chatInput.value : '';
        // Messages are already stored in tabState.chat.messages
    }
}

function restoreTabState(tabName) {
    const codeInput = document.getElementById('codeInput');
    const output = document.getElementById('output');
    const languageDetector = document.getElementById('languageDetector');
    const copyBtn = document.getElementById('copyBtn');
    const outputSection = document.getElementById('outputSection');
    const inputSection = document.getElementById('inputSection');
    const mainGridInner = document.getElementById('mainGridInner');

    // Restore input and response
    codeInput.value = tabState[tabName].input;
    output.innerHTML = tabState[tabName].response;

    // Show/hide elements based on state
    if (tabState[tabName].response) {
        copyBtn.classList.remove('hidden');
    } else {
        copyBtn.classList.add('hidden');
    }

    // Restore language detector
    if (tabState[tabName].language) {
        languageDetector.innerHTML = tabState[tabName].language;
        languageDetector.classList.remove('hidden');
    } else {
        languageDetector.classList.add('hidden');
    }

    // Restore file list if in file tab
    if (tabName === 'file' && tabState.file.files.length > 0) {
        currentFiles = tabState.file.files;
        updateFileList();
    }

    // Adjust textarea height
    autoResizeTextarea(codeInput);

    // Restore chat messages
    if (tabName === 'chat') {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = tabState.chat.input;
        }
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && tabState.chat.messages.length > 0) {
            renderChatMessages();
        }
    }

    // --- FIX: Always show output/input/mainGrid for code/file tabs ---
    if (tabName === 'file' || tabName === 'code') {
        outputSection?.classList.remove('hidden');
        inputSection?.classList.remove('hidden');
        mainGridInner?.classList.add('lg:grid-cols-2');
        mainGridInner?.classList.remove('grid-cols-1');
        document.getElementById('output')?.parentElement?.classList.remove('hidden');
        document.getElementById('statusIndicator')?.classList.remove('hidden');
    }

    ensureButtonsVisibility();
}

function clearFileInput() {
    currentFiles = [];
    const fileList = document.getElementById('fileList');
    if (fileList) fileList.classList.add('hidden');
    // Optionally reset file input element
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
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

function displayFileList(files, fileContents = {}) {
    const fileList = document.getElementById('fileList');
    const fileItems = document.getElementById('fileItems');
    
    fileItems.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex flex-col bg-surface p-3 rounded-xl mb-2';

        fileItem.innerHTML = `
            <div class="flex items-center justify-between">
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
            </div>
            <pre class="file-content-preview mt-2">${fileContents[file.name] ? escapeHtml(fileContents[file.name].slice(0, 1000)) : 'Loading...'}</pre>
        `;
        fileItems.appendChild(fileItem);
    });
    
    fileList.classList.remove('hidden');
}

// Helper to escape HTML for safe display
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

// Store file contents globally for display
let fileContentsMap = {};


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
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    let combinedContent = '';
    let filesLoaded = 0;
    fileContentsMap = {}; // Reset

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

            fileContentsMap[file.name] = content;

            filesLoaded++;

            if (filesLoaded === files.length) {
                if (combinedContent.length > MAX_CODE_LENGTH) {
                    showInputTooLargeMessage(combinedContent.length);
                    return;
                }
                // Only update code input if we're in the file tab
                if (activeTab === 'file') {
                    const codeInput = document.getElementById('codeInput');
                    codeInput.value = combinedContent;
                    autoResizeTextarea(codeInput);
                    updateLanguageDetector(language);
                }
                // Update file list with content previews
                displayFileList(files, fileContentsMap);
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
    
    if (language && language !== 'Unknown' && document.getElementById('codeInput').value.trim()) {
        languageSpan.textContent = language;
        detector.classList.remove('hidden');
    } else {
        detector.classList.add('hidden');
        languageSpan.textContent = '';
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
        output.innerHTML = `
            <div class="flex items-center text-yellow-400">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="font-semibold">No Input</p>
                    <p class="text-sm text-gray-400 mt-1">
                        Please enter some code to analyze or upload files.
                    </p>
                </div>
            </div>
        `;
        showMessage("Please enter some code to analyze or upload files.", "warning");
        return;
    }

    if (code.length > MAX_CODE_LENGTH) {
        showInputTooLargeMessage(code.length);
        // Reprompt: focus code input for user
        document.getElementById("codeInput").focus();
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
    // Handle code blocks first
    text = text.replace(/```([\s\S]*?)```/g, function(match, code) {
        // Escape HTML special chars in code blocks
        code = code.replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
        return `<pre><code>${code}</code></pre>`;
    });
    // Inline code
    text = text.replace(/`([^`]+)`/g, function(match, code) {
        code = code.replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
        return `<code>${code}</code>`;
    });
    // Bold and italics
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Paragraphs and line breaks (but not inside <pre>)
    text = text.replace(/\n\n/g, '</p><p>')
               .replace(/\n/g, '<br>');
    return `<p>${text}</p>`.replace(/<p>([\s\S]*?)<pre>/g, '<p>$1</p><pre>')
                           .replace(/<\/pre>([\s\S]*?)<\/p>/g, '</pre><p>$1</p>');
}

// Enhanced Clear Function
function clearCode() {
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    
    // Clear the state for the current tab
    tabState[activeTab] = {
        input: '',
        response: '',
        language: '',
        files: activeTab === 'file' ? [] : undefined
    };

    // Clear UI
    const codeInput = document.getElementById("codeInput");
    codeInput.value = "";
    
    // Always hide language detector when clearing
    const languageDetector = document.getElementById('languageDetector');
    languageDetector.classList.add('hidden');
    languageDetector.querySelector('#detectedLanguage').textContent = '';
    
    if (activeTab === 'file') {
        document.getElementById('fileList').classList.add('hidden');
        currentFiles = [];
    }
    
    const output = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    
    // Reset output area
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
    codeInput.focus();
    
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
    let message = `
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
    // Check for Cohere "too many tokens" error
    if (error && (error.message || error.toString()).includes('too many tokens')) {
        message = `
            <div class="flex items-center text-yellow-400">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="font-semibold">Input Too Large</p>
                    <p class="text-sm text-gray-400 mt-1">
                        Your code or files are too large to analyze at once.<br>
                        Please reduce the size or number of files and try again.
                    </p>
                </div>
            </div>
        `;
    }
    return message;
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

        // Enhanced language detection on input
        textarea.addEventListener('input', debounce(() => {
            const code = textarea.value.trim();
            const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
            
            if (activeTab === 'code' && code.length > 10) {
                const language = detectLanguageFromCode(code);
                if (language && language !== 'Unknown') {
                    updateLanguageDetector(language);
                }
            }
        }, 300));

        // Clear output when user provides new input
        textarea.addEventListener('input', () => {
            const output = document.getElementById("output");
            const copyBtn = document.getElementById("copyBtn");
            if (output) {
                output.innerHTML = '';
            }
            if (copyBtn) {
                copyBtn.classList.add("hidden");
            }
        });
    }

    // Add this inside the setupEventListeners function, after the existing textarea event listeners:

    // Chat input handling
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        // Auto-resize chat input
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            
            // Save input state
            tabState.chat.input = this.value;
        });
        
        // Send message on Enter (but not Shift+Enter)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
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

// Chat functionality
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');
    chatInput.value = '';
    tabState.chat.input = '';

    // Gather chat history
    const history = tabState.chat.messages.map(m => ({
        sender: m.sender,
        message: m.message
    }));

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch("https://code-commenter.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history }),
        });

        const data = await response.json();

        // Remove typing indicator and add AI response
        removeTypingIndicator();
        addChatMessage(data.response || "I'm sorry, I couldn't generate a response.", 'ai');

    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addChatMessage("Sorry, I'm having trouble connecting. Please try again.", 'ai');
    }
}

// ...existing code...
function addChatMessage(message, sender, saveToState = true) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'user') {
        messageDiv.className = 'flex justify-end';
        messageDiv.innerHTML = `
            <div class="user-message">
                <p class="text-sm">${escapeHtml(message)}</p>
                <div class="text-xs opacity-75 mt-1 text-right">${timestamp} • You</div>
            </div>
        `;
    } else {
        messageDiv.className = 'flex justify-start';
        messageDiv.innerHTML = `
            <div class="ai-message">
                <div class="formatted-output text-sm">${formatOutput(message)}</div>
                <div class="text-xs opacity-75 mt-1">AI Assistant • ${timestamp}</div>
            </div>
        `;
    }
    
    // Clear welcome message if it exists
    const welcomeMessage = chatMessages.querySelector('.text-center');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to state only if needed
    if (saveToState) {
        tabState.chat.messages.push({ message, sender, timestamp: Date.now() });
    }
}

function renderChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    tabState.chat.messages.forEach(({ message, sender }) => {
        addChatMessage(message, sender, false); // Don't save to state when rendering
    });
}
// ...existing code...

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'flex justify-start';
    typingDiv.innerHTML = `
        <div class="bg-accent text-primary p-3 rounded-2xl rounded-bl-md">
            <div class="flex items-center space-x-1">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
                    <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                </div>
                <span class="text-xs text-secondary ml-2">AI is typing...</span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}


function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    
    // Clear state
    tabState.chat.messages = [];
    tabState.chat.input = '';
    
    // Clear UI
    chatInput.value = '';
    chatMessages.innerHTML = `
        <div class="text-center text-secondary py-8">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
            </svg>
            <p class="text-sm">Start a conversation about code!</p>
            <p class="text-xs text-gray-400 mt-1">Ask questions, get explanations, discuss best practices</p>
        </div>
    `;
    
    trackEvent('chat_cleared');
}