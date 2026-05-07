(function() {
  const THEME_KEY = 'naijapay-theme';
  const DEFAULT_THEME = 'dark';

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggleTheme() {
    const current = getStoredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    updateToggleIcons();
  }

  function updateToggleIcons() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const isLight = document.documentElement.hasAttribute('data-theme');
      btn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    });
  }

  function initThemeToggles() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
    updateToggleIcons();
  }

  // Apply theme immediately to prevent flash
  applyTheme(getStoredTheme());

  // Initialize after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggles);
  } else {
    initThemeToggles();
  }
})();
