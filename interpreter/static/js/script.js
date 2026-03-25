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

// Execute Code
async function runManglish() {
    const code = document.getElementById('editor').value;
    const outputDiv = document.getElementById('terminal-output');

    // Switch to output tab automatically
    showTab('output');
    outputDiv.innerText = ">> ACCESSING KERNEL...\n>> RUNNING MONE_INTERPRETER...\n\n";

    try {
        const response = await fetch('http://127.0.0.1:5000/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });
        const data = await response.json();
        outputDiv.innerText += data.output;
    } catch (err) {
        outputDiv.innerHTML += `<span style="color:red">>> CRITICAL_ERROR: CONNECTION_REFUSED</span>`;
    }
}