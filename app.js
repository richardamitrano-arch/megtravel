(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- nav background on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() { if (nav) nav.classList.toggle("is-stuck", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- reveal on enter ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- pain: tabs collapse into one card ---- */
  var collapse = document.getElementById("collapse");
  if (collapse) {
    if (reduce || !("IntersectionObserver" in window)) {
      collapse.classList.add("is-collapsed");
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { collapse.classList.add("is-collapsed"); co.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      co.observe(collapse);
    }
  }

  /* ---- budget hero: the signature — budget reveals a place + its photo ---- */
  var DESTS = [
    { city: "Cracovia",  country: "Polonia",    price: 59,  img: 0 },
    { city: "Valencia",  country: "Spagna",     price: 95,  img: 1 },
    { city: "Lisbona",   country: "Portogallo", price: 118, img: 2 },
    { city: "Atene",     country: "Grecia",     price: 175, img: 3 },
    { city: "Tenerife",  country: "Canarie",    price: 280, img: 4 },
    { city: "Marrakech", country: "Marocco",    price: 410, img: 5 }
  ];

  var slider = document.getElementById("slider");
  var amtEl = document.getElementById("amt");
  var cityEl = document.getElementById("city");
  var countryEl = document.getElementById("country");
  var allinEl = document.getElementById("allin");
  var rateEl = document.getElementById("rate");
  var imgs = document.querySelectorAll(".hero__img");
  var lastCity = null, lastImg = null;

  function pick(budget) {
    var chosen = DESTS[0];
    for (var i = 0; i < DESTS.length; i++) { if (DESTS[i].price <= budget) chosen = DESTS[i]; }
    return chosen;
  }

  function setImg(idx) {
    if (idx === lastImg) return;
    lastImg = idx;
    imgs.forEach(function (im) { im.classList.toggle("is-on", parseInt(im.dataset.i, 10) === idx); });
  }

  function render() {
    if (!slider) return;
    var budget = parseInt(slider.value, 10);
    if (amtEl) amtEl.textContent = budget;
    var d = pick(budget);
    if (allinEl) allinEl.textContent = d.price + "€";
    if (rateEl) rateEl.textContent = "3 rate da " + Math.round(d.price / 3) + "€";
    setImg(d.img);
    if (cityEl && d.city !== lastCity) {
      lastCity = d.city;
      var apply = function () {
        cityEl.textContent = d.city;
        if (countryEl) countryEl.textContent = d.country;
      };
      if (reduce) { apply(); return; }
      cityEl.classList.add("is-flip");
      setTimeout(function () { apply(); cityEl.classList.remove("is-flip"); }, 160);
    }
  }

  if (slider) {
    slider.value = 120;
    slider.addEventListener("input", render);
    render();
  }

  /* ---- waitlist form ----
     NOTE: not wired to storage yet. Hook up a backend (Formspree / Resend /
     a small Railway endpoint / Google Sheet) before launch so emails are saved. */
  var form = document.getElementById("signup");
  var email = document.getElementById("email");
  var hint = document.getElementById("signup-hint");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = (email.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) {
        hint.textContent = "Controlla l'email — manca qualcosa.";
        hint.className = "signup__hint is-err";
        email.focus();
        return;
      }
      var list = [];
      try { list = JSON.parse(localStorage.getItem("meg_waitlist") || "[]"); } catch (e) { list = []; }
      list.push(v);
      try { localStorage.setItem("meg_waitlist", JSON.stringify(list)); } catch (e) {}
      form.classList.add("is-done");
      hint.textContent = "Ci sei. Ti scriviamo noi quando puoi partire ✈";
      hint.className = "signup__hint is-ok";
    });
  }
})();
