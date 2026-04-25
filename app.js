// ============================================
// HULT PRIZE AT FENI UNIVERSITY — APP.JS
// Handles: Navbar, Scroll Reveal, Nav Active,
//          Mobile Menu, Form, Animations
// ============================================

'use strict';

// ─── DOM References ──────────────────────────
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navLinkItems = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
const revealEls = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

// ─── Navbar: Scroll Effect ────────────────────
function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// ─── Active Nav Link on Scroll ────────────────
function setActiveNavLink() {
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop    = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinkItems.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

// ─── Scroll Reveal ────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger delay for siblings
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
          : [];
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ─── Mobile Menu Toggle ──────────────────────
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu on link click
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─── Smooth Anchor Scroll ────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 12;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  });
});

// ─── Contact Form Submission ──────────────────
// ─── Contact Form Submission (FIXED FOR FORMSPREE) ──────────
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page reload

    const btn = contactForm.querySelector('.btn-primary');
    const originalText = btn.querySelector('span').textContent;

    // Loading state
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    // Get the data from the form
    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        contactForm.reset();
        formSuccess.classList.add('show');
        btn.querySelector('span').textContent = 'Success!';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          formSuccess.classList.remove('show');
          btn.querySelector('span').textContent = originalText;
          btn.disabled = false;
        }, 5000);
      } else {
        // Formspree error
        const errorData = await response.json();
        alert(errorData.errors ? errorData.errors[0].message : "Submission failed.");
        btn.disabled = false;
        btn.querySelector('span').textContent = originalText;
      }
    } catch (error) {
      // Network error
      alert("Connectivity error. Please check your internet connection.");
      btn.disabled = false;
      btn.querySelector('span').textContent = originalText;
    }
  });
}

// ─── Stats Counter Animation ─────────────────
const statNums = document.querySelectorAll('.stat-num, .strip-num');

function animateCounter(el) {
  const rawText = el.textContent.trim();
  const match   = rawText.match(/(\$|)(\d[\d,]*)(\+|M|K|)/);
  if (!match) return;

  const prefix = match[1] || '';
  const target = parseInt(match[2].replace(/,/g, ''), 10);
  const suffix = match[3] || '';
  const duration = 1600;
  const start    = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOut(progress) * target);
    el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

statNums.forEach(el => counterObserver.observe(el));

// ─── Scroll Events (throttled) ───────────────
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleNavbarScroll();
      setActiveNavLink();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ─── Init ────────────────────────────────────
handleNavbarScroll();
setActiveNavLink();

// ─── Timeline hover micro-interaction ────────
document.querySelectorAll('.timeline-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.paddingLeft = '8px';
    item.style.transition  = 'padding 0.25s ease';
  });
  item.addEventListener('mouseleave', () => {
    item.style.paddingLeft = '';
  });
});

// ─── Card tilt effect on about cards ─────────
document.querySelectorAll('.visual-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect    = card.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -6;
    const rotateY = ((e.clientX - centerX) / (rect.width  / 2)) *  6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
});

// ─── Hero entrance animation coordination ────
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Force hero reveals immediately
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120 + 200);
  });
});

// ─── Achievement card hover sparkle ──────────
document.querySelectorAll('.achievement-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.setProperty('--shine', '1');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--shine', '0');
  });
});

// ─── Team card flip label effect ─────────────
document.querySelectorAll('.team-card').forEach(card => {
  const badge = card.querySelector('.team-role-badge');
  if (!badge) return;
  card.addEventListener('mouseenter', () => {
    badge.style.transform = 'scale(1.08)';
    badge.style.transition = 'transform 0.2s ease';
  });
  card.addEventListener('mouseleave', () => {
    badge.style.transform = '';
  });
});

// ─── Global strip scroll ticker ──────────────
(function setupStripScroll() {
  const stripInner = document.querySelector('.strip-inner');
  if (!stripInner) return;

  // On mobile, ensure it wraps cleanly (already handled in CSS)
  // This just adds a subtle pulse to numbers when in view
  const stripObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.strip-num').forEach((num, i) => {
          setTimeout(() => {
            num.style.transform = 'scale(1.1)';
            num.style.transition = 'transform 0.3s ease';
            setTimeout(() => { num.style.transform = ''; }, 300);
          }, i * 100);
        });
        stripObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stripObserver.observe(stripInner);
})();

console.log('%c🏆 Hult Prize at Feni University', 'color:#E8006A;font-size:18px;font-weight:bold;');
console.log('%cEmpowering students. Changing the world.', 'color:#1A1464;font-size:12px;');