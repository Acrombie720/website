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
      var match = filter === "all" ||
        (filter === "ff" ? el.hasAttribute("data-ff") : el.getAttribute("data-cat") === filter);
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

  // Monthly update sign-up. Posts straight to a Google Form, which writes each
  // email into a private Google Sheet. Google does not let the page read the
  // reply, so a sent request counts as success.
  var form = document.getElementById("signup-form");
  var box = document.getElementById("signup");
  if (form && box && form.getAttribute("data-action") && form.getAttribute("data-field")) {
    box.hidden = false;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.setCustomValidity("Please enter a valid email address.");
        input.reportValidity();
        input.setCustomValidity("");
        return;
      }
      var btn = form.querySelector("button");
      btn.disabled = true;
      var body = new URLSearchParams();
      body.append(form.getAttribute("data-field"), email);
      fetch(form.getAttribute("data-action"), { method: "POST", mode: "no-cors", body: body })
        .then(function () {
          form.innerHTML = '<p class="done">Thanks. You will get the next update when it lands.</p>';
        }, function () {
          btn.disabled = false;
          btn.textContent = "Try again";
        });
    });
  }
})();
