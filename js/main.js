/* ============================================================
   AvenMinds — Site JS
   One shared file for every page (root pages load "js/main.js",
   pages under /blog/ load "../js/main.js" — same file).
   Each block only runs if its markup is present on the page,
   so this is safe to include everywhere.
   ============================================================ */
(function(){
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init(){
    setFooterYear();
    initMobileNav();
    initMegaMenuMobile();
    initScrollReveal();
    initFaqAccordion();
    initTicker();
    initCareersFilter();
    initCareersModal();
  }

  /* ---------- Footer year ---------- */
  function setFooterYear(){
    var el = document.getElementById("year");
    if(el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Mobile nav toggle ----------
     Pairs with the .main-nav / body.nav-open rules in blog.css
     (or wherever the mobile-nav block lives in your stylesheet). */
  function initMobileNav(){
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if(!toggle || !nav) return;

    toggle.addEventListener("click", function(){
      var isOpen = document.body.classList.toggle("nav-open");
      toggle.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on link click (so navigating within the same page closes the panel)
    nav.addEventListener("click", function(e){
      if(e.target.closest("a.nav-link") && !e.target.closest(".has-mega")){
        closeMobileNav();
      }
    });

    // Close on Escape
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeMobileNav();
    });

    function closeMobileNav(){
      document.body.classList.remove("nav-open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  /* ---------- Mega menu: tap-to-open on touch / narrow screens ----------
     Desktop opens the mega menu on hover via CSS. Below 980px there's
     no hover, so tapping the "Services" link toggles it open instead
     of following the href straight to services.html. */
  function initMegaMenuMobile(){
    var items = document.querySelectorAll(".nav-item.has-mega");
    if(!items.length) return;

    items.forEach(function(item){
      var link = item.querySelector(":scope > .nav-link");
      if(!link) return;

      link.addEventListener("click", function(e){
        if(window.innerWidth > 980) return; // desktop: let hover + href behave normally
        e.preventDefault();
        var isOpen = item.classList.toggle("open");
        link.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
  }

  /* ---------- Scroll reveal ----------
     Adds .in to any .reveal element once it enters the viewport,
     matching the opacity/translateY transition defined on .reveal. */
  function initScrollReveal(){
    var items = document.querySelectorAll(".reveal");
    if(!items.length) return;

    if(!("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("in"); });
      return;
    }

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          // slight stagger for items revealing together (e.g. a grid of cards)
          setTimeout(function(){ entry.target.classList.add("in"); }, i * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function(el){ observer.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaqAccordion(){
    var faqItems = document.querySelectorAll(".faq-item");
    if(!faqItems.length) return;

    faqItems.forEach(function(item){
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if(!q || !a) return;

      q.setAttribute("aria-expanded", "false");

      q.addEventListener("click", function(){
        var isOpen = item.classList.contains("open");

        // close any sibling that's open (single-open accordion)
        faqItems.forEach(function(other){
          if(other !== item && other.classList.contains("open")){
            other.classList.remove("open");
            other.querySelector(".faq-a").style.maxHeight = null;
            other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          }
        });

        if(isOpen){
          item.classList.remove("open");
          a.style.maxHeight = null;
          q.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
          q.setAttribute("aria-expanded", "true");
        }
      });
    });

    // keep open panels sized correctly on resize
    window.addEventListener("resize", debounce(function(){
      document.querySelectorAll(".faq-item.open .faq-a").forEach(function(a){
        a.style.maxHeight = a.scrollHeight + "px";
      });
    }, 150));
  }

  /* ---------- Marquee ticker ----------
     Duplicates the track content once so the CSS keyframe
     (translateX(0) -> -50%) loops seamlessly regardless of how
     many items are hand-written in the HTML. */
  function initTicker(){
    var track = document.querySelector(".ticker-track");
    if(!track || track.dataset.doubled) return;
    track.innerHTML += track.innerHTML;
    track.dataset.doubled = "true";
  }

  /* ---------- Careers: filter pills ---------- */
  function initCareersFilter(){
    var filterBar = document.querySelector(".filter-bar");
    var rows = document.querySelectorAll(".job-row");
    if(!filterBar || !rows.length) return;

    var buttons = filterBar.querySelectorAll(".filter-btn");
    var countEl = document.querySelector(".job-count");

    filterBar.addEventListener("click", function(e){
      var btn = e.target.closest(".filter-btn");
      if(!btn) return;

      buttons.forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");

      var filter = btn.dataset.filter || "all";
      var visible = 0;

      rows.forEach(function(row){
        var match = filter === "all" || row.dataset.category === filter;
        row.style.display = match ? "" : "none";
        if(match) visible++;
      });

      if(countEl) countEl.textContent = visible + (visible === 1 ? " open role" : " open roles");
    });
  }

  /* ---------- Careers: application modal ---------- */
  function initCareersModal(){
    var overlay = document.querySelector(".modal-overlay");
    if(!overlay) return;

    var openTriggers = document.querySelectorAll("[data-open-modal]");
    var closeTriggers = overlay.querySelectorAll(".modal-close, [data-close-modal]");
    var titleField = overlay.querySelector("[data-modal-title]");

    openTriggers.forEach(function(trigger){
      trigger.addEventListener("click", function(e){
        e.preventDefault();
        if(titleField){
          titleField.textContent = trigger.dataset.jobTitle || "";
        }
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });

    closeTriggers.forEach(function(trigger){
      trigger.addEventListener("click", function(){ closeModal(); });
    });

    overlay.addEventListener("click", function(e){
      if(e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });

    function closeModal(){
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  /* ---------- Utility ---------- */
  function debounce(fn, wait){
    var t;
    return function(){
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function(){ fn.apply(null, args); }, wait);
    };
  }
})();
