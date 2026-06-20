/* ==========================================================
   NEOGEN — script.js
   Handles: mobile nav drawer, smooth scroll + active link
   highlighting, scroll-reveal animations, button actions,
   toast notifications, and the back-to-top button.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSmoothScroll();
  initActiveNavOnScroll();
  initScrollReveal();
  initButtonActions();
  initBackToTop();
});

/* ---------- Mobile nav drawer ---------- */
function initMobileNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Build hamburger toggle button
  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Toggle navigation menu');
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>`;

  const navRight = nav.querySelector('.nav-right');
  if (navRight) nav.insertBefore(toggle, navRight.nextSibling);

  // Build the drawer itself from existing nav-links + login button
  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  const navLinks = nav.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = link.textContent;
    drawer.appendChild(a);
  });
  const loginBtn = document.createElement('button');
  loginBtn.className = 'btn-login-mobile';
  loginBtn.textContent = 'Log in';
  loginBtn.addEventListener('click', () => {
    closeDrawer();
    showToast('Login coming soon');
  });
  drawer.appendChild(loginBtn);

  nav.insertAdjacentElement('afterend', drawer);

  function closeDrawer() {
    drawer.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  // Close drawer after tapping a link
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // Close drawer if window resizes back to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeDrawer();
  });
}

/* ---------- Smooth scroll for in-page anchors ---------- */
function initSmoothScroll() {
  const navHeight = document.querySelector('nav')?.offsetHeight || 64;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---------- Highlight active nav link based on scroll position ---------- */
function initActiveNavOnScroll() {
  const sections = Array.from(document.querySelectorAll('section[id], div[id]'))
    .filter(el => document.querySelector(`.nav-links a[href="#${el.id}"]`));
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (!sections.length || !navAnchors.length) return;

  const navHeight = document.querySelector('nav')?.offsetHeight || 64;

  function onScroll() {
    let current = null;
    const scrollPos = window.pageYOffset + navHeight + 8;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });

    navAnchors.forEach(a => {
      const match = a.getAttribute('href') === `#${current}`;
      a.classList.toggle('active', match);
    });
  }

  window.addEventListener('scroll', throttle(onScroll, 100));
  onScroll();
}

/* ---------- Scroll-reveal animation for sections/cards ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.path-card, .tc, .nc, .pr, .testi, .why-row, .sb-item'
  );

  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ---------- Button click actions ---------- */
function initButtonActions() {
  // Primary CTAs -> scroll to pricing / enroll
  document.querySelectorAll(
    '.btn-enroll, .ha-main, .path-btn-sub, .pr-btn-f, .cta-w'
  ).forEach(btn => {
    btn.addEventListener('click', () => {
      const pricing = document.querySelector('#pricing');
      if (pricing) {
        const navHeight = document.querySelector('nav')?.offsetHeight || 64;
        const top = pricing.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      showToast('Redirecting you to enrollment…');
    });
  });

  // Store-related CTAs -> scroll to store
  document.querySelectorAll(
    '.ha-ghost, .path-btn-store, .cta-o'
  ).forEach(btn => {
    btn.addEventListener('click', () => {
      const store = document.querySelector('#store');
      if (store) {
        const navHeight = document.querySelector('nav')?.offsetHeight || 64;
        const top = store.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      showToast('Browsing the notes store…');
    });
  });

  // "Get started" monthly plan button
  document.querySelectorAll('.pr-btn-o').forEach(btn => {
    btn.addEventListener('click', () => showToast('Starting your monthly plan…'));
  });

  // Login button (desktop)
  document.querySelectorAll('.btn-login').forEach(btn => {
    btn.addEventListener('click', () => showToast('Login coming soon'));
  });

  // Notes store cards -> simple feedback on click
  document.querySelectorAll('.nc').forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.nc-title')?.textContent || 'this bundle';
      showToast(`Added "${title}" to cart`);
    });
  });

  // Teacher cards -> simple feedback on click
  document.querySelectorAll('.tc').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('.tc-name')?.textContent || 'this teacher';
      showToast(`Viewing ${name}'s profile…`);
    });
  });
}

/* ---------- Toast notifications ---------- */
let toastTimeout;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/* ---------- Back-to-top button ---------- */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '&uarr;';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', throttle(() => {
    btn.classList.toggle('show', window.pageYOffset > 600);
  }, 150));
}

/* ---------- Utility: throttle ---------- */
function throttle(fn, wait) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
