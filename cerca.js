(function () {
  "use strict";
  var DATA = null;
  var grid = document.getElementById("grid");
  var head = document.getElementById("results-head");
  var empty = document.getElementById("empty");
  var budget = document.getElementById("budget");
  var budgetOut = document.getElementById("budget-out");
  var dest = document.getElementById("dest");
  var surprise = document.getElementById("surprise");

  function city(c) { return (DATA.cities && DATA.cities[c]) || { name: c, country: "", img: "" }; }

  function current() {
    var max = parseInt(budget.value, 10);
    var d = dest.value;
    return DATA.stays
      .filter(function (s) { return s.price <= max && (d === "all" || s.city === d); })
      .sort(function (a, b) { return a.price - b.price; });
  }

  function card(s, i) {
    var c = city(s.city);
    var bits = ['<div class="chip">' + s.type + "</div>"];
    if (s.stars) bits.push('<div class="chip">' + s.stars + "★</div>");
    var score = s.score ? '<span class="score">' + s.score.toFixed(1) + "</span>" : "";
    return (
      '<article class="stay" data-i="' + i + '">' +
        '<div class="stay__img" style="background-image:url(\'' + c.img + "')\">" +
          '<div class="stay__city">' + c.name + "<span>" + c.country + "</span></div>" +
        "</div>" +
        '<div class="stay__body">' +
          '<div class="stay__name">' + s.name + "</div>" +
          '<div class="stay__meta">' + score + bits.join("") + "<span>" + s.area + "</span></div>" +
          '<div class="stay__foot">' +
            '<div class="stay__price">' + s.price + "€<small>2 notti · 2 persone</small></div>" +
            '<a class="stay__cta" href="' + s.url + '" target="_blank" rel="noopener">Prenota ↗</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    budgetOut.textContent = budget.value + "€";
    var list = current();
    if (!list.length) {
      grid.innerHTML = "";
      head.textContent = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    var cheapest = list[0].price;
    head.innerHTML = "<b>" + list.length + "</b> dove dormire sotto <b>" + budget.value + "€</b> · dal più economico (<b>" + cheapest + "€</b>)";
    grid.innerHTML = list.map(card).join("");
  }

  function doSurprise() {
    var pool = current();
    if (!pool.length) { pool = DATA.stays.slice().sort(function (a, b) { return a.price - b.price; }); }
    if (!pool.length) return;
    var pick = pool[Math.floor(Date.now() % pool.length)];
    if (pick.price > parseInt(budget.value, 10)) { budget.value = Math.min(200, Math.ceil(pick.price / 5) * 5); }
    dest.value = "all";
    render();
    var listNow = current();
    var cards = grid.querySelectorAll(".stay");
    for (var j = 0; j < listNow.length; j++) {
      if (listNow[j].name === pick.name && listNow[j].city === pick.city) {
        cards[j].scrollIntoView({ behavior: "smooth", block: "center" });
        cards[j].classList.add("flash");
        (function (el) { setTimeout(function () { el.classList.remove("flash"); }, 1600); })(cards[j]);
        break;
      }
    }
  }

  budget.addEventListener("input", render);
  dest.addEventListener("change", render);
  surprise.addEventListener("click", doSurprise);

  fetch("stays.json")
    .then(function (r) { return r.json(); })
    .then(function (d) { DATA = d; render(); })
    .catch(function () { head.textContent = "Ops, non riesco a caricare i risultati. Ricarica la pagina."; });
})();
