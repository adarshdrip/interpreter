// Start the system from Splash screen
function startSystem() {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('main-ui').style.display = 'block';
}

// Tab Switching Logic
function showTab(tabId) {
    // Hide all contents
    const contents = document.getElementsByClassName('tab-content');
    for (let s of contents) s.classList.remove('active');

    // Deactivate all buttons
    const buttons = document.getElementsByClassName('nav-item');
    for (let b of buttons) b.classList.remove('active');

    // Show selected
    document.getElementById(tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
}

function getExampleCode(button) {
    const card = button.closest('.feature-card');
    return card ? card.querySelector('.code-box code').textContent : '';
}

async function copyExample(button) {
    const code = getExampleCode(button);
    if (!code) return;

    await navigator.clipboard.writeText(code);
    const oldText = button.innerText;
    button.innerText = 'Copied';
    setTimeout(() => {
        button.innerText = oldText;
    }, 1200);
}

function useExample(button, inputs = '') {
    const code = getExampleCode(button);
    const editor = document.getElementById('editor');
    
    editor.value = code;
    document.getElementById('stdin-input').value = inputs;
    
    // NEW: Manually trigger the highlight and scroll reset
    updateHighlight(); 
    editor.scrollTop = 0;
    syncScroll();

    showTab('playground');
}

// Execute Code
async function runManglish() {
    const code = document.getElementById('editor').value;
    const stdinInput = document.getElementById('stdin-input').value;
    const outputDiv = document.getElementById('terminal-output');

    // Switch to output tab automatically
    showTab('output');
    outputDiv.innerText = ">> ACCESSING KERNEL...\n>> RUNNING MONE_INTERPRETER...\n\n";

    try {
        const response = await fetch('http://127.0.0.1:5000/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, inputs: stdinInput })
        });
        const data = await response.json();
        outputDiv.innerText += data.output;
    } catch (err) {
        outputDiv.innerHTML += `<span style="color:red">>> CRITICAL_ERROR: CONNECTION_REFUSED</span>`;
    }
}

function updateHighlight() {
    const editor = document.getElementById('editor');
    const highlightLayer = document.getElementById('highlight-layer');
    
    let code = editor.value;

    // 1. Escape HTML first (Crucial!)
    code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 2. Combined Regex (The "Big" Rule)
    // This looks for Keywords OR Strings OR Comments OR Numbers in one go
    const bigRegex = /(".*?"|'.*?')|(#.*)|(\b(?:namaskaram|nanni|parayu|eduku|anengil|enkil|allengil|pravarthanam|thirike|kodku|ghatana|avarthikuka)\b)|(\b\d+(\.\d+)?\b)/g;

    const highlightedCode = code.replace(bigRegex, (match, string, comment, keyword, number) => {
        if (string) return `<span class="token-string">${match}</span>`;
        if (comment) return `<span class="token-comment">${match}</span>`;
        if (keyword) return `<span class="token-keyword">${match}</span>`;
        if (number) return `<span class="token-number">${match}</span>`;
        return match;
    });

    // 3. Update the layer
    highlightLayer.innerHTML = highlightedCode + (code.endsWith('\n') ? ' ' : '');
    
    // 4. Force scroll sync
    syncScroll();
}

function syncScroll() {
    const editor = document.getElementById('editor');
    const highlightLayer = document.getElementById('highlight-layer');
    
    // Sync both vertical and horizontal scroll
    highlightLayer.scrollTop = editor.scrollTop;
    highlightLayer.scrollLeft = editor.scrollLeft;
}

// Add this inside your window.onload or at the end of startSystem()
document.addEventListener('DOMContentLoaded', () => {
    updateHighlight();
});

// Update useExample to refresh highlights
function useExample(button, inputs = '') {
    const code = getExampleCode(button);
    const editor = document.getElementById('editor');
    
    editor.value = code;
    document.getElementById('stdin-input').value = inputs;
    
    // Force a highlight refresh
    updateHighlight();
    showTab('playground');
    
    // Reset scroll to top
    editor.scrollTop = 0;
    syncScroll();
}

const editor = document.getElementById('editor');
editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // 1. Prevent moving focus to the next textarea
        e.preventDefault();

        // 2. Get cursor position
        const start = this.selectionStart;
        const end = this.selectionEnd;

        // 3. Set textarea value: [text before] + [4 spaces] + [text after]
        this.value = this.value.substring(0, start) + 
                     "    " + 
                     this.value.substring(end);

        // 4. Put cursor back 4 spaces ahead
        this.selectionStart = this.selectionEnd = start + 4;

        // 5. Trigger your highlight function so the new spaces are processed
        updateHighlight();
    }
});
