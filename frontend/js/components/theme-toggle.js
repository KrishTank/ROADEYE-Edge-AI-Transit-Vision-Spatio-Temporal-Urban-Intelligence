/* =========================================================
   URBANSENSE AI — THEME TOGGLE CONTROLLER
   Smooth Light/Dark switching with localStorage persistence
   ========================================================= */

(function () {
  'use strict';

  var STORAGE_KEY = 'urbansense_theme';

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function getCurrentTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return getSystemPreference();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn('[theme] Failed to save theme preference', e);
    }
    updateAllButtons(theme);
  }

  function updateAllButtons(theme) {
    var buttons = document.querySelectorAll('.theme-toggle-btn');
    buttons.forEach(function (btn) {
      var icon = btn.querySelector('.theme-toggle-icon');
      var label = btn.querySelector('.theme-toggle-label');

      if (theme === 'dark') {
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'Light Mode';
        btn.setAttribute('title', 'Switch to Light Mode');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        if (icon) icon.textContent = '🌙';
        if (label) label.textContent = 'Dark Mode';
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || getCurrentTheme();
    var nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // Expose globally
  window.UrbanSenseTheme = {
    get: getCurrentTheme,
    set: applyTheme,
    toggle: toggleTheme
  };

  // Attach click listener on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    var theme = getCurrentTheme();
    applyTheme(theme);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Listen for OS system theme changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  });
})();
