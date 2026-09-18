(function () {
  var grid = document.getElementById("grid");
  var stats = Array.prototype.slice.call(grid.querySelectorAll(".stat"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".filterbar button"));
  var showing = document.getElementById("showing");
  var total = stats.length;

  document.getElementById("total").textContent = String(total);

  function apply(filter) {
    var n = 0;
    stats.forEach(function (el) {
      var match = filter === "all" || el.getAttribute("data-cat") === filter;
      el.hidden = !match;
      if (match) n++;
    });
    showing.textContent = "Showing " + n + " of " + total;
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === filter));
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); });
  });

  apply("all");

  function citationFor(el) {
    var fig = el.querySelector(".fig").textContent.trim();
    var claim = el.querySelector(".claim").textContent.trim();
    var src = el.querySelector(".src").textContent.replace(/\s+/g, " ").trim();
    return fig + " " + claim + " (" + src + "). Via The AI Fluency Data Index, Fluencyfox.";
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".cite");
    if (!btn) return;
    var text = citationFor(btn.closest(".stat"));
    var done = function () {
      var original = "Copy citation";
      btn.textContent = "Copied";
      btn.setAttribute("data-done", "1");
      setTimeout(function () {
        btn.textContent = original;
        btn.removeAttribute("data-done");
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else {
      fallback(text, done);
    }
  });

  function fallback(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (err) { /* no-op */ }
    document.body.removeChild(ta);
  }
})();
