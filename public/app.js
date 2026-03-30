// app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- MULTI-STAGE JOURNEY LOGIC ---
    const landingPage = document.getElementById('landing-page');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    const loginOverlay = document.getElementById('login-overlay');
    const enterBtn = document.getElementById('enter-btn');
    
    const appContainer = document.getElementById('app-container');
    const emailInput = document.getElementById('user-email');
    const loginError = document.getElementById('login-error');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if user is already logged in
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        enterWorkspace(savedEmail);
    }

    // Stage 1: Landing Page -> Login Box
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            landingPage.classList.add('hidden');
            loginOverlay.classList.remove('hidden');
            
            setTimeout(() => {
                landingPage.style.display = 'none';
            }, 1500);
        });
    }

    // Stage 2: Login Box -> IDE Workspace
    enterBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (email.length < 2) {
            loginError.classList.add('visible');
            setTimeout(() => loginError.classList.remove('visible'), 3000);
            return;
        }

        loginError.classList.remove('visible');
        localStorage.setItem('userEmail', email);
        enterWorkspace(email);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userEmail');
        location.reload(); // Refresh the page to show landing screen again
    });

    function enterWorkspace(email) {
        // Update greeting based on email handle or full email
        const handle = email.split('@')[0];
        userGreeting.innerText = `Welcome, ${handle}`;

        if (landingPage) landingPage.classList.add('hidden');
        if (loginOverlay) loginOverlay.classList.add('hidden');
        
        appContainer.classList.remove('hidden');
        
        // Timeout to fully remove it from DOM to prevent overriding clicks
        setTimeout(() => {
            if (landingPage) landingPage.style.display = 'none';
            if (loginOverlay) loginOverlay.style.display = 'none';
        }, 1500);

        // Progressively force layout update for editors while fading in to prevent zero-width/height freezes
        let layoutTicks = 0;
        const layoutInterval = setInterval(() => {
            if (window.editorInstance) window.editorInstance.layout();
            if (window.tbEditorInstance) window.tbEditorInstance.layout();
            layoutTicks++;
            if (layoutTicks > 20) clearInterval(layoutInterval); // Stop after 2 seconds
        }, 100);

        // Initialize Monaco Editors ONLY once the workspace is becoming visible
        if (!window.editorInstance) {
            initEditors();
        }
    }

    // --- VERTICAL RESIZER LOGIC (Editor / Console) ---
    const resizer = document.getElementById('dragMe');
    const editorPanel = document.querySelector('.editor-panel');
    const workspace = document.querySelector('.workspace');

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'row-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const workspaceRect = workspace.getBoundingClientRect();
        // Calculate new height (Y position relative to workspace top)
        let newHeight = e.clientY - workspaceRect.top;
        
        // Limits
        if (newHeight < 100) newHeight = 100; // Minimum size for editor
        if (newHeight > workspaceRect.height - 100) newHeight = workspaceRect.height - 100; // Minimum console

        const heightPercentage = (newHeight / workspaceRect.height) * 100;
        editorPanel.style.flex = `0 0 ${heightPercentage}%`;
        
        // Resize Monaco editors immediately if available
        if (window.editorInstance) window.editorInstance.layout();
        if (window.tbEditorInstance) window.tbEditorInstance.layout();
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
        }
    });

    // --- HORIZONTAL RESIZER LOGIC (Design / Testbench) ---
    const resizerVertical = document.querySelector('.resizer-vertical');
    const designPane = document.querySelector('.design-pane');
    
    let isResizingHorizontal = false;

    resizerVertical.addEventListener('mousedown', (e) => {
        isResizingHorizontal = true;
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizingHorizontal) return;
        
        const panelRect = editorPanel.getBoundingClientRect();
        let newWidth = e.clientX - panelRect.left;
        
        if (newWidth < 100) newWidth = 100;
        if (newWidth > panelRect.width - 100) newWidth = panelRect.width - 100;

        const widthPercentage = (newWidth / panelRect.width) * 100;
        designPane.style.flex = `0 0 ${widthPercentage}%`;
        
        if (window.editorInstance) window.editorInstance.layout();
        if (window.tbEditorInstance) window.tbEditorInstance.layout();
    });

    document.addEventListener('mouseup', () => {
        if (isResizingHorizontal) {
            isResizingHorizontal = false;
            document.body.style.cursor = 'default';
        }
    });

    // --- MONACO EDITOR INITIALIZATION ---
    function initEditors() {
        try {
            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' }});
            require(['vs/editor/editor.main'], function() {
                
                // Register rudimentary Verilog syntax highlighting if not natively perfect
                // (Monaco has basic verilog support natively!)
                
                const defaultCode = `// Write your Verilog code here...\n`;

                window.editorInstance = monaco.editor.create(document.getElementById('editor-container'), {
                    value: `// Write your Design code here...\n`,
                    language: 'verilog',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: true,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on"
                });

                window.tbEditorInstance = monaco.editor.create(document.getElementById('tb-editor-container'), {
                    value: `// Write your Testbench code here...\n`,
                    language: 'verilog',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: true,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on"
                });
            });
        } catch(e) {
            console.error("Failed to load Monaco editor. Check your internet connection or adblocker.", e);
        }
    }

    // --- RUN SIMULATION LOGIC ---
    const runBtn = document.getElementById('run-btn');
    const consoleOutput = document.getElementById('console-output');
    const statusBadge = document.getElementById('status-badge');

    function appendToConsole(text, type = 'normal') {
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.innerText = text;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    runBtn.addEventListener('click', async () => {
        if (!window.editorInstance || !window.tbEditorInstance) return;

        const designCode = window.editorInstance.getValue();
        const tbCode = window.tbEditorInstance.getValue();
        const code = designCode + '\n\n' + tbCode;
        
        // Update UI state
        runBtn.disabled = true;
        runBtn.innerHTML = `
            <svg class="pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
            COMPILING...
        `;
        statusBadge.className = 'badge';
        statusBadge.innerText = 'Compiling...';
        
        appendToConsole('\n> iverilog && vvp', 'info');

        try {
            const response = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                statusBadge.className = 'badge success';
                statusBadge.innerText = 'Success';
                appendToConsole(data.output, 'success');
            } else {
                statusBadge.className = 'badge error';
                statusBadge.innerText = 'Error';
                appendToConsole(data.output || data.error, 'error');
            }

        } catch (err) {
            statusBadge.className = 'badge error';
            statusBadge.innerText = 'Failed';
            appendToConsole(`Network or Server Error: ${err.message}`, 'error');
        } finally {
            // Restore button state
            runBtn.disabled = false;
            runBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                RUN SIMULATION
            `;
        }
    });

});
