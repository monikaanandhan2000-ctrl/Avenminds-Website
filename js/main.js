/* AvenMinds — shared site behaviour */
document.addEventListener('DOMContentLoaded', () => {

  /* Mobile nav toggle */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav){
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    // On mobile, tapping a "has-mega" link opens the submenu instead of navigating away
    document.querySelectorAll('.nav-item.has-mega > a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 980){
          e.preventDefault();
          link.parentElement.classList.toggle('open');
        }
      });
    });
  }

  /* Duplicate ticker content for seamless loop */
  document.querySelectorAll('.ticker-track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* FAQ accordion (used on faq.html and services.html) */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings within same list for a tidy accordion
      item.parentElement.querySelectorAll('.faq-item.open').forEach(sib => {
        if (sib !== item){
          sib.classList.remove('open');
          sib.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen){
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* Mark current nav item */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.closest('.nav-item')?.classList.add('current');
  });

  /* Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
