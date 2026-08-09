(function () {
  'use strict';

  // ==================== Fridge Door ====================
  const fridgeOverlay = document.getElementById('fridgeOverlay');
  const fridgeScene   = document.getElementById('fridgeScene');
  const fridgeDoor    = document.getElementById('fridgeDoor');
  const fridgeTitle   = document.getElementById('fridgeTitle');

  const FRIDGE_KEY = 'um-igem-fridge-seen';
  var   readyToOpen = false;

  function openFridge() {
    if (!readyToOpen) return;
    if (!fridgeDoor || !fridgeOverlay) return;
    if (fridgeDoor.classList.contains('open')) return;
    if (fridgeOverlay.classList.contains('zoom-more')) return;

    // Zoom + door + whiteout + body fade — all start together
    fridgeOverlay.classList.add('zoom-more');
    fridgeDoor.classList.add('open');

    // Hide title
    if (fridgeTitle) fridgeTitle.classList.remove('show');

    // Body fade + whiteout appear (start immediately with zoom)
    var fridgeBody = document.querySelector('.fridge-body');
    if (fridgeBody) fridgeBody.classList.add('fading');
    var whiteout = document.getElementById('fridgeWhiteout');
    if (whiteout) whiteout.classList.add('show');

    // Whiteout fades out + background cleared → reveals homepage
    setTimeout(function () {
      var whiteout = document.getElementById('fridgeWhiteout');
      if (whiteout) {
        whiteout.classList.add('fade-out');
        whiteout.classList.remove('show');
      }
      fridgeOverlay.classList.add('clear-bg');
    }, 1500);

    // Hide overlay entirely
    setTimeout(function () {
      fridgeOverlay.style.display = 'none';
    }, 2100);

    try { sessionStorage.setItem(FRIDGE_KEY, '1'); } catch (e) { /* ignore */ }
  }

  if (fridgeOverlay && fridgeDoor && fridgeScene) {
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(FRIDGE_KEY) === '1'; } catch (e) { /* ignore */ }

    if (alreadySeen) {
      fridgeOverlay.style.display = 'none';
    } else {
      // Intro animation sequence
      // Stage 1: zoom entire scene (background + fridge together)
      setTimeout(function () {
        fridgeOverlay.classList.add('zoom');
      }, 1600);

      // Stage 2: title appears after zoom completes
      setTimeout(function () {
        readyToOpen = true;
        if (fridgeTitle) fridgeTitle.classList.add('show');
      }, 2900);

      // Click to open: door or title
      fridgeDoor.addEventListener('click', openFridge);
      if (fridgeTitle) fridgeTitle.addEventListener('click', openFridge);
    }
  }

  // ==================== Mobile Nav ====================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  const isMobile  = () => window.innerWidth <= 768;

  function closeNav() {
    if (!navToggle || !navLinks) return;
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  if (navToggle && navLinks) {
    // ── Hamburger toggle ──
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.classList.toggle('nav-open');
    });

    // ── Click a link → close nav ──
    navLinks.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
        setTimeout(closeNav, 100);
      }
    });
  }

  // ── Close on resize to desktop ──
  window.addEventListener('resize', function () {
    if (!isMobile()) closeNav();
  });

  // ==================== Scroll Progress Bar ====================
  const progressBar = document.querySelector('.wiki-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      progressBar.style.setProperty('--progress', progress);
    }, { passive: true });
  }

  // ==================== Back to Top ====================
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== Sidebar Active Highlight ====================
  const sidebarSectionLinks = document.querySelectorAll('.sidebar-sections a, #subNavLinks a');
  const sidebarModelLinks = document.querySelectorAll('.sidebar-model');

  function updateActiveSidebar() {
    // --- Section-level links ---
    const sections = [];
    sidebarSectionLinks.forEach((link) => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        const section = document.querySelector(id);
        if (section) sections.push({ id, link });
      }
    });

    let current = '';
    sections.forEach(({ id, link }) => {
      const el = document.querySelector(id);
      if (el && el.getBoundingClientRect().top <= 120) {
        current = id;
      }
    });

    sidebarSectionLinks.forEach((a) => {
      a.classList.remove('active');
      if (a.getAttribute('href') === current) {
        a.classList.add('active');
      }
    });

    // --- Model-level links ---
    let currentModel = '';
    sidebarModelLinks.forEach((link) => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#') && id.length > 1) {
        const el = document.querySelector(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          currentModel = id;
        }
      }
    });

    sidebarModelLinks.forEach((a) => {
      a.classList.remove('active');
      if (a.getAttribute('href') === currentModel) {
        a.classList.add('active');
      }
    });

    // Model 1 (first link) is active when no other model section is in view
    if (!currentModel && sidebarModelLinks.length > 0) {
      sidebarModelLinks[0].classList.add('active');
    }
  }

  if (sidebarSectionLinks.length > 0 || sidebarModelLinks.length > 0) {
    window.addEventListener('scroll', updateActiveSidebar, { passive: true });
    // Run once on load
    updateActiveSidebar();
  }

  // ==================== Smooth Scroll for Anchor Links ====================
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ==================== Home Panel Scroll Reveal ====================
  var homePanels = document.querySelectorAll('.home-panel-bg');
  if (homePanels.length > 0) {
    var panelObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          panelObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    homePanels.forEach(function (panel) {
      panelObserver.observe(panel);
    });
  }

  console.log('UM iGEM 2026 — Wiki ready');
})();
