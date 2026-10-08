/* ==========================================================================
   DISTINCTIVE WEALTH MANAGEMENT — Global Script
   Mobile nav, sticky header shadow, scroll reveal, form helpers.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var applyScrollState = function () {
      if (window.scrollY > 8) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    applyScrollState();
    window.addEventListener("scroll", applyScrollState, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    // Lock the page behind the menu. iPhone Safari ignores overflow:hidden
    // on <body>, so the body is pinned in place and the scroll position restored.
    var lockedScrollY = 0;
    var isOpen = false;
    var closeNav = function () {
      if (!isOpen) return;
      isOpen = false;
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
      document.documentElement.classList.remove("nav-locked");
      document.body.classList.remove("nav-locked");
      document.body.style.top = "";
      try {
        window.scrollTo({ top: lockedScrollY, left: 0, behavior: "instant" });
      } catch (err) {
        window.scrollTo(0, lockedScrollY);
      }
    };
    var openNav = function () {
      if (isOpen) return;
      isOpen = true;
      lockedScrollY = window.scrollY || window.pageYOffset;
      navToggle.setAttribute("aria-expanded", "true");
      mobileNav.classList.add("is-open");
      document.body.style.top = -lockedScrollY + "px";
      document.documentElement.classList.add("nav-locked");
      document.body.classList.add("nav-locked");
    };

    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) closeNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Auto stagger reveal delays within groups ---------- */
  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    var children = group.querySelectorAll(".reveal");
    children.forEach(function (child, i) {
      child.style.transitionDelay = (i * 90) + "ms";
    });
  });

  /* ---------- Footer year ---------- */
  var yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Contact form (Netlify) client-side niceties ---------- */
  var form = document.querySelector("form[name='contact']");
  if (form) {
    form.addEventListener("submit", function () {
      var honeypot = form.querySelector("input[name='bot-field']");
      if (honeypot && honeypot.value) {
        // Silently block obvious bot submissions client-side too.
        return false;
      }
    });
  }
})();
