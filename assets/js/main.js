/* Pritam Dey — portfolio interactions */
(function () {
  "use strict";

  // ---------- Icons ----------
  if (window.lucide) window.lucide.createIcons();

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar: solid background after scrolling ----------
  var nav = document.getElementById("navbar");
  var solid = ["bg-zinc-950/95", "backdrop-blur-md", "border-zinc-800"];
  var clear = ["bg-transparent", "border-transparent"];
  function onScroll() {
    var scrolled = window.scrollY > 20;
    solid.forEach(function (c) { nav.classList.toggle(c, scrolled); });
    clear.forEach(function (c) { nav.classList.toggle(c, !scrolled); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    menu.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = '<i data-lucide="' + (open ? "x" : "menu") + '" class="w-6 h-6"></i>';
    if (window.lucide) window.lucide.createIcons();
    if (open) nav.classList.add("bg-zinc-950/95");
    else onScroll();
  }
  toggle.addEventListener("click", function () { setMenu(menu.classList.contains("hidden")); });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  // ---------- Active section highlight ----------
  var links = document.querySelectorAll(".nav-link");
  var sections = Array.prototype.map.call(links, function (l) { return document.querySelector(l.getAttribute("href")); });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (s) { if (s) spy.observe(s); });

  // ---------- Reveal on scroll ----------
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); revealer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .reveal-pop").forEach(function (el) { revealer.observe(el); });

  // ---------- Contact form (opens the visitor's email app) ----------
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = form.elements;
      var err = document.getElementById("cf-error");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim());
      if (!f.name.value.trim() || !emailOk || !f.message.value.trim()) { err.classList.remove("hidden"); return; }
      err.classList.add("hidden");
      var subject = f.subject.value.trim() || "Hello from your portfolio";
      var body = f.message.value.trim() + "\n\n— " + f.name.value.trim() + " (" + f.email.value.trim() + ")";
      window.location.href = "mailto:pritamde166@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  // ---------- Live GitHub stats ----------
  var gh = document.getElementById("github");
  var user = gh && gh.getAttribute("data-github-user");
  if (!user) return;


  var LANG_DOT = { "C#": "#178600", "HTML": "#e34c26", "CSS": "#663399", "JavaScript": "#f1e05a", "TypeScript": "#3178c6",
    "Python": "#3572A5", "Jupyter Notebook": "#DA5B0B", "HCL": "#844FBA", "Shell": "#89e051", "PowerShell": "#012456", "Dockerfile": "#384d54" };

  function timeAgo(iso) {
    var days = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (days < 1) return "today";
    if (days < 30) return days + (days === 1 ? " day" : " days") + " ago";
    var months = Math.floor(days / 30);
    if (months < 12) return months + (months === 1 ? " month" : " months") + " ago";
    var years = Math.floor(months / 12);
    return years + (years === 1 ? " year" : " years") + " ago";
  }

  function renderRepos(repos) {
    var grid = document.getElementById("gh-repos");
    if (!grid) return;
    var list = repos.slice().sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); }).slice(0, 6);
    grid.innerHTML = "";
    list.forEach(function (r) {
      var a = document.createElement("a");
      a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
      a.className = "group flex flex-col bg-zinc-900 border border-zinc-800 rounded-[5px] p-6 hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300";
      a.innerHTML =
        '<div class="flex items-start justify-between gap-3 mb-3">' +
          '<span class="flex items-center gap-2 min-w-0"><i data-lucide="book-marked" class="w-4 h-4 text-zinc-500 flex-shrink-0"></i>' +
          '<span class="repo-name text-white font-semibold truncate group-hover:text-emerald-400 transition-colors"></span></span>' +
          '<i data-lucide="arrow-up-right" class="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 flex-shrink-0"></i>' +
        '</div>' +
        '<p class="repo-desc text-zinc-400 text-sm leading-relaxed mb-5 line-clamp-2"></p>' +
        '<div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">' +
          (r.language ? '<span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background:' + (LANG_DOT[r.language] || "#71717a") + '"></span><span class="repo-lang"></span></span>' : "") +
          (r.stargazers_count ? '<span class="inline-flex items-center gap-1"><i data-lucide="star" class="w-3.5 h-3.5"></i>' + r.stargazers_count + '</span>' : "") +
          '<span>Updated ' + timeAgo(r.pushed_at) + '</span>' +
        '</div>';
      a.querySelector(".repo-name").textContent = r.name;
      a.querySelector(".repo-desc").textContent = r.description || "No description yet.";
      if (r.language) a.querySelector(".repo-lang").textContent = r.language;
      grid.appendChild(a);
    });
    if (window.lucide) window.lucide.createIcons();
  }

  var LANG_COLORS = ["bg-emerald-400", "bg-sky-400", "bg-amber-400", "bg-violet-400", "bg-zinc-500"];
  function set(key, val) {
    var el = gh.querySelector('[data-gh="' + key + '"]');
    if (el) el.textContent = val;
  }

  Promise.all([
    fetch("https://api.github.com/users/" + user).then(function (r) { if (!r.ok) throw r; return r.json(); }),
    fetch("https://api.github.com/users/" + user + "/repos?per_page=100&sort=updated").then(function (r) { if (!r.ok) throw r; return r.json(); })
  ]).then(function (res) {
    var profile = res[0], repos = res[1].filter(function (r) { return !r.fork; });
    set("repos", profile.public_repos);
    set("followers", profile.followers);
    set("since", new Date(profile.created_at).getFullYear());
    set("stars", repos.reduce(function (n, r) { return n + r.stargazers_count; }, 0));
    set("forks", repos.reduce(function (n, r) { return n + r.forks_count; }, 0));
    if (profile.bio) document.getElementById("gh-bio").textContent = profile.bio;

    // Latest repositories (most recently pushed, public, non-fork)
    renderRepos(repos);

    // Top languages by number of repos
    var counts = {};
    repos.forEach(function (r) { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    var sorted = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    var total = sorted.reduce(function (n, k) { return n + counts[k]; }, 0);
    if (!total) return;
    var top = sorted.slice(0, 4);
    var other = sorted.slice(4).reduce(function (n, k) { return n + counts[k]; }, 0);
    var items = top.map(function (k) { return [k, counts[k]]; });
    if (other) items.push(["Other", other]);

    var bar = document.getElementById("gh-lang-bar");
    var list = document.getElementById("gh-lang-list");
    bar.innerHTML = ""; list.innerHTML = "";
    items.forEach(function (it, i) {
      var pct = Math.round((it[1] / total) * 100);
      var color = LANG_COLORS[i] || "bg-zinc-500";
      var seg = document.createElement("div");
      seg.className = color; seg.style.width = pct + "%";
      bar.appendChild(seg);
      var row = document.createElement("div");
      row.className = "flex items-center gap-2";
      row.innerHTML = '<div class="w-2.5 h-2.5 rounded-full flex-shrink-0 ' + color + '"></div>' +
        '<span class="text-sm text-zinc-300"></span><span class="text-xs text-zinc-500 ml-auto">' + pct + ' %</span>';
      row.children[1].textContent = it[0];
      list.appendChild(row);
    });
  }).catch(function () {
    var grid = document.getElementById("gh-repos");
    if (grid) grid.innerHTML = '<a href="https://github.com/' + user + '?tab=repositories" target="_blank" rel="noopener" class="col-span-full block text-center rounded-[5px] border border-zinc-800 bg-zinc-900 p-6 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors">Browse all repositories on GitHub &rarr;</a>';
    document.getElementById("gh-lang-list").innerHTML = '<p class="text-sm text-zinc-500 col-span-full">Live stats are unavailable right now — see the full profile on GitHub.</p>';
  });
})();
