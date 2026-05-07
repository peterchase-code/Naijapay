/**
 * NaijaPay Premium Toast Notification System
 * Right-side slide-in | Glassmorphism | Auto-dismiss | Hover pause
 *
 * Usage:
 *   showSuccess('Payment verified successfully!');
 *   showError('Something went wrong.');
 *   showWarning('Session expires soon.');
 *   showInfo('New notification received.');
 *   showToast('Custom message', 'success', 6000); // message, type, duration
 */

(function () {
  'use strict';

  // ---- Configuration ----
  const DEFAULT_DURATION = 5000;   // 5 seconds
  const MAX_STACK = 5;              // Max visible toasts
  let toastIdCounter = 0;
  const activeToasts = new Map();   // id -> { element, remaining, timer, startTime, duration }

  // ---- Icon map ----
  const ICONS = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  // ---- Title map ----
  const TITLES = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  };

  // ---- Get or create container ----
  function getContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(container);
    }
    return container;
  }

  // ---- Remove oldest toast if over limit ----
  function enforceStackLimit() {
    if (activeToasts.size > MAX_STACK) {
      const oldestId = activeToasts.keys().next().value;
      dismissToast(oldestId);
    }
  }

  // ---- Core toast creation ----
  function createToast(message, type = 'info', duration = DEFAULT_DURATION) {
    const id = ++toastIdCounter;
    const container = getContainer();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `np-toast toast-${type}`;
    toast.id = `np-toast-${id}`;
    toast.setAttribute('role', 'alert');

    const iconClass = ICONS[type] || ICONS.info;
    const title = TITLES[type] || 'Notification';

    toast.innerHTML = `
      <div class="np-toast-icon"><i class="fas ${iconClass}"></i></div>
      <div class="np-toast-content">
        <div class="np-toast-title">${escapeHtml(title)}</div>
        <div class="np-toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="np-toast-close" aria-label="Close notification" onclick="dismissToast(${id})">
        <i class="fas fa-times"></i>
      </button>
      <div class="np-toast-progress-wrap">
        <div class="np-toast-progress" style="animation-duration:${duration}ms"></div>
      </div>
    `;

    container.appendChild(toast);

    // Track active toast
    const startTime = Date.now();
    const toastData = { element: toast, startTime, duration };
    activeToasts.set(id, toastData);

    // Auto-dismiss timer
    const timer = setTimeout(() => {
      dismissToast(id);
    }, duration);
    toastData.timer = timer;

    // Hover: pause dismiss
    toast.addEventListener('mouseenter', () => {
      const data = activeToasts.get(id);
      if (!data) return;
      clearTimeout(data.timer);
      const elapsed = Date.now() - data.startTime;
      data.remaining = Math.max(0, data.duration - elapsed);
    });

    // Mouse leave: resume with remaining time
    toast.addEventListener('mouseleave', () => {
      const data = activeToasts.get(id);
      if (!data || data.remaining === undefined) return;
      data.startTime = Date.now() - (data.duration - data.remaining);
      data.timer = setTimeout(() => dismissToast(id), data.remaining);
      // Resume CSS animation
      const progressEl = toast.querySelector('.np-toast-progress');
      if (progressEl) {
        progressEl.style.animationDuration = `${data.remaining}ms`;
        progressEl.style.animationName = 'none';
        progressEl.offsetHeight; // reflow
        progressEl.style.animationName = 'toastProgress';
      }
    });

    enforceStackLimit();
    return id;
  }

  // ---- Dismiss a toast ----
  function dismissToast(id) {
    const data = activeToasts.get(id);
    if (!data) return;
    const { element, timer } = data;
    clearTimeout(timer);
    activeToasts.delete(id);

    element.classList.add('toast-exit');
    element.addEventListener('animationend', () => {
      element.remove();
    });
  }

  // ---- Escape HTML to prevent XSS ----
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Public API ----
  window.showToast = function (message, type = 'info', duration) {
    return createToast(message, type, duration || DEFAULT_DURATION);
  };

  window.showSuccess = function (message, duration) {
    return createToast(message, 'success', duration || DEFAULT_DURATION);
  };

  window.showError = function (message, duration) {
    return createToast(message, 'error', duration || DEFAULT_DURATION);
  };

  window.showWarning = function (message, duration) {
    return createToast(message, 'warning', duration || DEFAULT_DURATION);
  };

  window.showInfo = function (message, duration) {
    return createToast(message, 'info', duration || DEFAULT_DURATION);
  };

  window.dismissToast = dismissToast;
  window.__toastPremiumLoaded = true;

})();
