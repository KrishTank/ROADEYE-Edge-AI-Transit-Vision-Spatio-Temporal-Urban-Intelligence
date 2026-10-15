/* =========================================================
   ROADEYE — AI ASSISTANT NAVIGATION (chatbot.js)
   Connects sidebar AI Assistant button to the dedicated
   RAVI AI Assistant workspace.
   ========================================================= */

(function () {
  function init() {
    const btn = document.getElementById('chatbotBtn');
    if (!btn) return;

    // Check if we are already on the assistant page
    const isAssistantPage = window.location.pathname.toLowerCase().includes('assistant');
    if (isAssistantPage) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', function (e) {
      if (isAssistantPage) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const inPages = window.location.pathname.includes('/pages/') || 
                      document.querySelector('a[href="../dashboard.html"]') !== null;
      window.location.href = inPages ? 'assistant.html' : 'pages/assistant.html';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
