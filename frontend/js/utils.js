// ================================================
// Toast notifications (premium system from toast.js)
// Fallback wrapper in case toast.js isn't loaded yet
// ================================================
function showToast(message, type = 'success', duration) {
  // If premium toast system is available, use it
  if (typeof window.__toastPremiumLoaded !== 'undefined' || document.querySelector('.np-toast')) {
    // toast.js will override this function on window
    return;
  }
  // Ultra-thin fallback: inject toast.js loader
  const script = document.createElement('script');
  script.src = 'js/toast.js';
  script.onload = () => {
    if (window.showToast) window.showToast(message, type === 'danger' ? 'error' : type, duration);
  };
  document.head.appendChild(script);
}

// Alert in container
function showAlert(containerId, message, type = 'danger') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

// Format currency in NGN
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format relative time
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Copy to clipboard
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => btn.innerHTML = original, 1500);
    }
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

// Get initials from name
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Check if user is admin
function isAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
}

// Get stored user
function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Protect routes
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

// Set button loading state
function setLoading(btn, loading = true) {
  if (loading) {
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.original || btn.innerHTML;
    btn.disabled = false;
  }
}

// Debounce
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

// Number input validation
function validateNumber(input, min, max) {
  const value = parseFloat(input.value);
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

// Phone validation (basic)
function isValidPhone(phone) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 10;
}

// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Render pagination
function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span>...</span>`;
    }
  }

  html += `
    <button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = html;

  container.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
  });
}

// Sidebar toggle for mobile
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  function open() {
    sidebar?.classList.add('active');
    overlay?.classList.add('active');
  }

  function close() {
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
  }

  toggle?.addEventListener('click', () => sidebar?.classList.toggle('active'));
  mobileMenuBtn?.addEventListener('click', open);
  overlay?.addEventListener('click', close);
}

// Update user header
function updateUserHeader() {
  const user = getUser();
  if (!user) return;

  const nameEls = document.querySelectorAll('.user-name');
  const avatarEls = document.querySelectorAll('.user-avatar');
  const headerAvatarEls = document.querySelectorAll('.header-avatar');
  const initials = getInitials(user.fullName || user.username || '');

  nameEls.forEach(el => el.textContent = user.fullName || user.username || 'User');
  
  avatarEls.forEach(el => {
    el.textContent = initials;
    el.style.background = 'linear-gradient(135deg, #00C853 0%, #1A237E 100%)';
    el.style.color = '#fff';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontWeight = '700';
    el.style.borderRadius = '50%';
  });

  headerAvatarEls.forEach(el => {
    el.textContent = initials;
    el.style.background = 'linear-gradient(135deg, #00C853 0%, #1A237E 100%)';
    el.style.color = '#fff';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontWeight = '700';
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.borderRadius = '50%';
    el.style.fontSize = 'var(--text-sm)';
    el.style.cursor = 'pointer';
  });

  // Admin badge
  const roleEls = document.querySelectorAll('.user-role');
  roleEls.forEach(el => el.textContent = user.role === 'admin' ? 'Administrator' : 'User');
}

// Dashboard navigation active link
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Render avatar element with initials
function renderAvatar(name, size = 36) {
  const initials = getInitials(name);
  const div = document.createElement('div');
  div.className = 'avatar-initials';
  div.textContent = initials;
  div.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: ${size > 40 ? 'var(--text-lg)' : 'var(--text-sm)'};
    color: white;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  `;
  return div;
}

// ================================================
// PERFORMANCE UTILITIES
// ================================================

// Simple memoize/cache for expensive computations
function memoize(fn, ttlMs = 60000) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.time) < ttlMs) {
      return cached.value;
    }
    const result = fn.apply(this, args);
    cache.set(key, { value: result, time: Date.now() });
    // Auto-cleanup old entries when cache gets large
    if (cache.size > 50) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
    return result;
  };
}

// Passive event listener helper for scroll/touch (avoids blocking main thread)
function addPassiveEvent(target, event, handler) {
  target.addEventListener(event, handler, { passive: true });
}

// Schedule non-urgent work during browser idle time
function scheduleIdle(callback, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

// Lazy load images with intersection observer
function lazyLoadImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    document.querySelectorAll('img[loading="lazy"]').forEach(img => img.classList.add('loaded'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });
  document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));
}

// Skeleton loader HTML generator for tables and cards
function skeletonRows(count = 5, cols = 6) {
  return Array.from({ length: count }, () =>
    `<tr>${Array.from({ length: cols }, () => `<td><div class="skeleton" style="height:20px;border-radius:var(--radius-sm)"></div></td>`).join('')}</tr>`
  ).join('');
}

function skeletonCards(count = 4) {
  return Array.from({ length: count }, () =>
    `<div class="skeleton" style="height:120px;border-radius:var(--radius-lg)"></div>`
  ).join('');
}

// Batch DOM reads/writes to avoid forced synchronous layouts
function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    // Read phase
    const reads = updates.filter(u => u.type === 'read').map(u => u.fn());
    // Write phase
    requestAnimationFrame(() => {
      updates.filter(u => u.type === 'write').forEach((u, i) => u.fn(reads[i]));
    });
  });
}

// Preload critical resources
function preloadResource(href, as = 'script') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (as === 'font') link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
