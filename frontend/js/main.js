// Landing page main JS - Self-contained, no external dependencies

document.addEventListener('DOMContentLoaded', () => {
  // ===== Utility fallbacks (in case utils.js is missing) =====
  const addPassiveEvent = window.addPassiveEvent || function(target, event, handler) {
    target.addEventListener(event, handler, { passive: true });
  };
  const scheduleIdle = window.scheduleIdle || function(callback) {
    if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout: 2000 });
    else setTimeout(callback, 1);
  };
  const lazyLoadImages = window.lazyLoadImages || function() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => img.classList.add('loaded'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('loaded'); obs.unobserve(e.target); } });
    }, { rootMargin: '50px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => obs.observe(img));
  };

  // ===== Navbar scroll effect =====
  const navbar = document.getElementById('navbar');
  let ticking = false;
  addPassiveEvent(window, 'scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  // ===== Mobile menu toggle =====
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  mobileToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    if (icon && navMenu) {
      icon.classList.toggle('fa-bars', !navMenu.classList.contains('active'));
      icon.classList.toggle('fa-times', navMenu.classList.contains('active'));
    }
  });

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // ===== Scroll reveal with IntersectionObserver =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.01 });

  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  revealElements.forEach(el => {
    // If element is already in viewport (above the fold), show immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('active');
    } else {
      revealObserver.observe(el);
    }
  });

  // ===== Contact form =====
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We will get back to you soon.', 'success');
    contactForm.reset();
  });

  // ===== Smooth scroll for nav links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navMenu?.classList.remove('active');
    });
  });

  // ===== Lazy load images =====
  scheduleIdle(() => lazyLoadImages());
});

// ===== showToast fallback =====
if (typeof showToast !== 'function') {
  window.showToast = function(message, type) { alert(message); };
}
