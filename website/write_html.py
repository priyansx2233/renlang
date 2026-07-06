
html = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ren Lang - Playground</title>
  <meta name="description" content="Write, run, and learn the Ren programming language in your browser. Interactive playground with AI assistant and full documentation.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="run-flash" id="runFlash"></div>

<!-- Navbar -->
<nav class="navbar">
  <a class="nav-logo" href="#">
    <div class="nav-logo-mark">R</div>
    <span class="nav-logo-name">Ren Lang</span>
  </a>
  <span class="nav-version">v0.1.0-alpha</span>
  <div class="nav-divider"></div>
  <div class="nav-tabs">
    <button class="nav-tab" id="navDocs" onclick="switchNavTab('docs')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
      Docs
    </button>
    <button class="nav-tab active" id="navPlayground" onclick="switchNavTab('playground')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Playground
    </button>
    <button class="nav-tab" id="navReference" onclick="switchNavTab('reference')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
      Reference
    </button>
  </div>
  <div class="nav-right">
    <div class="examples-btn" id="examplesBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
      Examples
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      <div class="dropdown-menu" id="dropdownMenu">
        <div class="dropdown-section-title">Beginner</div>
        <div class="dropdown-item" data-example="hello"><span class="item-icon">&#128075;</span>Hello World<span class="tag easy">Easy</span></div>
        <div class="dropdown-item" data-example="variables"><span class="item-icon">&#128230;</span>Variables &amp; Math<span class="tag easy">Easy</span></div>
        <div class="dropdown-item" data-example="conditions"><span class="item-icon">&#128256;</span>Conditions<span class="tag easy">Easy</span></div>
        <div class="dropdown-item" data-example="loops"><span class="item-icon">&#128257;</span>All Loop Types<span class="tag easy">Easy</span></div>
        <div class="dropdown-section-title">Intermediate</div>
        <div class="dropdown-item" data-example="functions"><span class="item-icon">&#9881;&#65039;</span>Functions &amp; Recursion<span class="tag mid">Medium</span></div>
        <div class="dropdown-item" data-example="fizzbuzz"><span class="item-icon">&#127919;</span>FizzBuzz<span class="tag mid">Medium</span></div>
        <div class="dropdown-item" data-example="fibonacci"><span class="item-icon">&#128026;</span>Fibonacci<span class="tag mid">Medium</span></div>
        <div class="dropdown-item" data-example="lists"><span class="item-icon">&#128203;</span>Lists &amp; Arrays<span class="tag mid">Medium</span></div>
        <div class="dropdown-section-title">Advanced</div>
        <div class="dropdown-item" data-example="classes"><span class="item-icon">&#127959;&#65039;</span>Classes &amp; Inheritance<span class="tag adv">Advanced</span></div>
        <div class="dropdown-item" data-example="errhandling"><span class="item-icon">&#128737;&#65039;</span>Error Handling<span class="tag adv">Advanced</span></div>
        <div class="dropdown-item" data-example="match"><span class="item-icon">&#127922;</span>Pattern Matching<span class="tag adv">Advanced</span></div>
        <div class="dropdown-item" data-example="sorting"><span class="item-icon">&#128202;</span>Bubble Sort<span class="tag adv">Advanced</span></div>
        <div class="dropdown-item" data-example="calculator"><span class="item-icon">&#129518;</span>Calculator App<span class="tag adv">Advanced</span></div>
      </div>
    </div>
    <button class="btn-share" id="shareBtn" title="Copy shareable link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      Share
    </button>
    <button class="btn-run" id="runBtn">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Run
    </button>
    <div class="btn-icon-nav" id="sidebarToggle" title="Toggle sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
    </div>
    <div class="btn-icon-nav" id="clearBtn" title="Clear output">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
    </div>
  </div>
</nav>

<!-- App Shell -->
<div class="app-shell" id="appLayout">

  <!-- Left Sidebar -->
  <div class="left-sidebar" id="docsSidebar">
    <div class="sidebar-label">Documentation</div>
    <div class="sidebar-search">
      <div class="sidebar-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" id="docsSearch" placeholder="Search docs..." autocomplete="off">
      </div>
    </div>
    <div class="sidebar-nav" id="docsNav"></div>
    <div class="sidebar-footer">
      <div class="sidebar-help" onclick="openHelpTopic()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Help
      </div>
    </div>
  </div>

  <!-- Editor Pane -->
  <div class="editor-pane" id="editorPane">
    <div class="editor-tabs-bar">
      <div class="editor-file-tab">
        <span>main.ren</span>
        <div class="tab-dot-modified" id="paneModified"></div>
        <div class="tab-dot-green" id="tabDotGreen"></div>
      </div>
    </div>
    <div class="editor-wrap"><textarea id="editor"></textarea></div>
  </div>

  <!-- Resizer -->
  <div class="resizer" id="resizer"></div>

  <!-- Right Panel -->
  <div class="right-panel" id="rightPanel">
    <div class="panel-tabs">
      <button class="panel-tab active" id="tabOutput" data-panel="output">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
        Output<div class="tab-badge" id="errorBadge"></div>
      </button>
      <button class="panel-tab" id="tabProblems" data-panel="problems">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Problems
      </button>
      <button class="panel-tab" id="tabTerminal" data-panel="terminal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        Terminal
      </button>
      <button class="panel-tab" id="tabDocs" data-panel="docs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        Docs
      </button>
      <button class="panel-tab" id="tabChat" data-panel="chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        AI Assistant
      </button>
    </div>

    <!-- Output -->
    <div class="output-panel active" id="panelOutput">
      <div class="output-toolbar">
        <div class="output-status">
          <div class="output-dot ok" id="outputDot"></div>
          <span id="outputStatus" style="font-size:11px;color:var(--text3)">Ready</span>
        </div>
        <div class="output-toolbar-right">
          <button class="output-btn" id="copyOutputBtn">Copy</button>
          <button class="output-btn" id="wrapToggleBtn">Wrap</button>
        </div>
      </div>
      <div class="output-wrap" id="outputWrap">
        <div class="output-empty" id="outputEmpty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.15"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <h3>No output yet</h3>
          <p>Press <strong>Run</strong> or <kbd>F5</kbd> to execute your code</p>
        </div>
      </div>
      <div class="error-card" id="errorCard">
        <div class="error-card-header">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div class="error-card-title" id="errorCardTitle">Error</div>
        </div>
        <div class="error-card-body" id="errorCardBody"></div>
      </div>
      <button class="error-ask-btn" id="errorAskBtn" style="display:none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        Ask AI: Why did this error happen?
      </button>
    </div>

    <!-- Problems -->
    <div class="problems-panel" id="panelProblems">
      <div class="no-problems">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>No problems detected</p>
      </div>
    </div>

    <!-- Terminal -->
    <div class="terminal-panel" id="panelTerminal">
      <div class="terminal-inner">
        <div><span class="terminal-prompt">ren@playground:~$</span> <span style="color:#8b949e">Ren v0.1.0 - Browser Interpreter Active</span></div>
        <div style="color:#6e7781;margin-top:6px;font-size:12px;">Use the <span style="color:#93c5fd;font-weight:600">Run</span> button or press <span style="color:#93c5fd;font-weight:600">F5</span> to execute code in the editor.</div>
        <div style="color:#484f58;font-size:11px;margin-top:8px;font-style:italic;">Sandboxed browser environment.</div>
      </div>
    </div>

    <!-- Docs -->
    <div class="docs-panel" id="panelDocs">
      <div class="docs-content" id="docsContent">
        <div class="docs-welcome" id="docsWelcome">
          <div class="docs-welcome-icon">&#128218;</div>
          <h3>Ren Language Guide</h3>
          <p>Select a topic from the sidebar or use a quick link below.</p>
          <div class="docs-welcome-links" id="docsWelcomeLinks"></div>
        </div>
      </div>
    </div>

    <!-- AI Chat -->
    <div class="chat-panel" id="panelChat">
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-quick-btns">
        <span style="font-size:10px;color:var(--text4);align-self:center;flex-shrink:0;margin-right:2px">Quick:</span>
        <button class="quick-btn" data-q="What are all the rules of Ren?">All rules</button>
        <button class="quick-btn" data-q="How do variables work?">Variables</button>
        <button class="quick-btn" data-q="Explain loops in Ren">Loops</button>
        <button class="quick-btn" data-q="How do functions work?">Functions</button>
        <button class="quick-btn" data-q="Explain classes in Ren">Classes</button>
        <button class="quick-btn" data-q="How to handle errors in Ren?">Errors</button>
        <button class="quick-btn" data-q="Explain why my error happened" id="qExplainError">My error</button>
      </div>
      <div class="chat-input-area">
        <textarea class="chat-input" id="chatInput" rows="1" placeholder="Ask AI a question..."></textarea>
        <button class="chat-send-btn" id="chatSend">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Status Bar -->
<div class="statusbar">
  <div class="status-item">
    <div class="status-dot ok" id="statusDot"></div>
    <span id="statusText">Ready</span>
  </div>
  <div class="status-item" style="margin-left:4px">
    <span class="status-lang">Ren</span>
  </div>
  <div class="status-right">
    <div class="status-item"><span id="cursorPos">Ln 1, Col 1</span></div>
    <div class="status-item"><span id="charCount">0 chars</span></div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/selection/active-line.min.js"></script>
<script>
// ── Nav tab switching ──
function switchNavTab(tab) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  var p = {
    output: document.getElementById('panelOutput'),
    problems: document.getElementById('panelProblems'),
    terminal: document.getElementById('panelTerminal'),
    docs: document.getElementById('panelDocs'),
    chat: document.getElementById('panelChat')
  };
  if (tab === 'docs' || tab === 'reference') {
    document.getElementById(tab === 'docs' ? 'navDocs' : 'navReference').classList.add('active');
    document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
    Object.values(p).forEach(el => el.classList.remove('active'));
    document.getElementById('tabDocs').classList.add('active');
    p.docs.classList.add('active');
    if (tab === 'reference') setTimeout(function(){ if (window.openTopic) openTopic('all-rules'); }, 150);
  } else {
    document.getElementById('navPlayground').classList.add('active');
  }
}

// ── Help topic ──
function openHelpTopic() {
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  ['panelOutput','panelProblems','panelTerminal','panelDocs','panelChat'].forEach(function(id){ document.getElementById(id).classList.remove('active'); });
  document.getElementById('tabDocs').classList.add('active');
  document.getElementById('panelDocs').classList.add('active');
  setTimeout(function(){ if (window.openTopic) openTopic('intro'); }, 150);
}

// ── Modified indicator ──
(function() {
  var mod = document.getElementById('paneModified');
  var grn = document.getElementById('tabDotGreen');
  var obs = new MutationObserver(function() {
    var shown = mod.style.display === 'block';
    grn.style.display = shown ? 'none' : 'block';
  });
  obs.observe(mod, { attributes: true, attributeFilter: ['style'] });
})();

// ── Extra panel tabs (Problems, Terminal) ──
document.addEventListener('DOMContentLoaded', function() {
  var allPanels = ['panelOutput','panelProblems','panelTerminal','panelDocs','panelChat'];
  function switchPanel(tabEl, panelEl) {
    tabEl.addEventListener('click', function() {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      allPanels.forEach(function(id){ document.getElementById(id).classList.remove('active'); });
      tabEl.classList.add('active');
      panelEl.classList.add('active');
    });
  }
  switchPanel(document.getElementById('tabProblems'), document.getElementById('panelProblems'));
  switchPanel(document.getElementById('tabTerminal'), document.getElementById('panelTerminal'));
});
</script>
<script src="ren_app.js"></script>
</body>
</html>"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done, chars:', len(html))
