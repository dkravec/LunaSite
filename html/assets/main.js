(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scripts = document.getElementsByTagName("script");
  var assetBase = "";
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute("src") || "";
    if (src.indexOf("main.js") !== -1) {
      assetBase = src.replace("main.js", "");
      break;
    }
  }
  var siteRoot = assetBase.replace("assets/", "");
  var DOWNLOAD_URL = "https://testflight.apple.com/join/estR1gfD";

  var NAV_LINKS = [
    { href: "#experience", text: "Features", class: "nav-link--text" },
    { href: "#screenshots", text: "Screenshots", class: "nav-link--text" },
    { href: "#nasa", text: "NASA", class: "nav-link--text" },
    { href: "#bodies", text: "Bodies", class: "nav-link--text" },
    { href: DOWNLOAD_URL, text: "TestFlight", class: "btn btn--outline btn--small", external: true }
  ];

  var FOOTER_LINKS = [
    { href: "support/", text: "Support" },
    { href: "privacy/", text: "Privacy Policy" },
    { href: "changelog/", text: "Changelog" },
    { href: "mailto:daniel@dkravec.net", text: "Contact", absolute: true },
    { href: "https://novapro.net", text: "novapro.net", absolute: true, external: true }
  ];

  function pageRootHref(href) {
    if (href.charAt(0) === "#") return siteRoot ? "/" + href : href;
    return siteRoot + href;
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str == null ? "" : String(str)));
    return div.innerHTML;
  }

  function injectNavLinks() {
    var ul = document.getElementById("nav-links");
    if (!ul) return;
    NAV_LINKS.forEach(function (link) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = link.external ? link.href : pageRootHref(link.href);
      a.textContent = link.text;
      if (link.class) a.className = link.class;
      if (link.external) { a.target = "_blank"; a.rel = "noopener"; }
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  function injectFooterLinks() {
    var ul = document.getElementById("footer-links");
    if (!ul) return;
    FOOTER_LINKS.forEach(function (link) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = link.absolute ? link.href : siteRoot + link.href;
      a.textContent = link.text;
      if (link.external) { a.target = "_blank"; a.rel = "noopener"; }
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  function injectFooterCopy() {
    var p = document.getElementById("footer-copy");
    if (p) p.innerHTML = "&copy; " + new Date().getFullYear() + " Luna. All rights reserved.";
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  });

  function initFaqAccordion(container) {
    container.addEventListener("click", function (event) {
      var btn = event.target.closest(".faq-item__btn");
      if (!btn) return;
      var item = btn.closest(".faq-item");
      var isOpen = item.hasAttribute("open");
      if (isOpen) {
        item.removeAttribute("open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.setAttribute("open", "");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  function formatDistance(value) {
    if (value == null) return "N/A";
    if (value === 0) return "0 km";
    if (value < 1) return Math.round(value * 1000).toLocaleString() + " m";
    if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\.0$/, "") + "B km";
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M km";
    return Math.round(value).toLocaleString() + " km";
  }


  var SCREENSHOT_SETS = {
    iphone: {
      label: "iPhone",
      basePath: "img/screenshots/iphone/",
      frameClass: "screenshot-card--phone",
      items: [
        { title: "Home", file: "home.png" },
        { title: "Explore", file: "explore.png" },
        { title: "Explore Detail", file: "explore-detail-mode.png" },
        { title: "Object Mode", file: "object-mode.png" },
        { title: "Scene", file: "scene.png" },
        { title: "AR", file: "ar.png" },
        { title: "APOD", file: "apod.png" },
        { title: "Settings", file: "settings.png" }
      ]
    },
    ipad: {
      label: "iPad",
      basePath: "img/screenshots/ipad/",
      frameClass: "screenshot-card--tablet",
      items: [
        { title: "Home", file: "home.png" },
        { title: "Explore", file: "explore.png" },
        { title: "Explore Detail", file: "explore-detail-mode.png" },
        { title: "Scene", file: "scene.png" },
        { title: "AR", file: "ar.png" },
        { title: "APOD", file: "apod.png" },
        { title: "Settings", file: "settings.png" }
      ]
    },
    mac: {
      label: "Mac",
      basePath: "img/screenshots/mac/",
      frameClass: "screenshot-card--desktop",
      items: [
        { title: "Home", file: "home.png" },
        { title: "Explore", file: "explore.png" },
        { title: "Explore Detail", file: "explore-detail-mode.png" },
        { title: "Scene", file: "scene.png" },
        { title: "Object Mode", file: "object-mode.png" },
        { title: "APOD", file: "apod.png" },
        { title: "NASA Credits", file: "credits.png" }
      ]
    }
  };

  function imageExists(src, callback) {
    var image = new Image();
    image.onload = function () { callback(true); };
    image.onerror = function () { callback(false); };
    image.src = src;
  }

  function renderScreenshotGallery(device) {
    var gallery = document.getElementById("screenshot-gallery");
    if (!gallery) return;

    var set = SCREENSHOT_SETS[device] || SCREENSHOT_SETS.iphone;
    gallery.innerHTML = "";

    set.items.forEach(function (item) {
      var path = assetBase + set.basePath + item.file;
      var card = document.createElement("article");
      card.className = "screenshot-card " + set.frameClass;
      card.innerHTML =
        '<div class="screenshot-frame" data-state="placeholder">' +
          '<div class="screenshot-placeholder">' +
            '<span class="screenshot-placeholder__device">' + escapeHTML(set.label) + '</span>' +
            '<strong>' + escapeHTML(item.title) + '</strong>' +
            '<code>' + escapeHTML("assets/" + set.basePath + item.file) + '</code>' +
          '</div>' +
        '</div>' +
        '<h3>' + escapeHTML(item.title) + '</h3>';

      gallery.appendChild(card);

      imageExists(path, function (exists) {
        if (!exists) return;
        var frame = card.querySelector(".screenshot-frame");
        frame.setAttribute("data-state", "image");
        frame.innerHTML = '<img src="' + escapeHTML(path) + '" alt="Luna ' + escapeHTML(item.title) + ' screenshot on ' + escapeHTML(set.label) + '" loading="lazy" />';
      });
    });
  }

  function initScreenshotSection() {
    var gallery = document.getElementById("screenshot-gallery");
    if (!gallery) return;

    var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-screenshot-tab]"));
    var activeDevice = "iphone";

    function setActive(device) {
      activeDevice = device;
      tabs.forEach(function (tab) {
        var selected = tab.getAttribute("data-screenshot-tab") === device;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
      });
      renderScreenshotGallery(activeDevice);
      if (gallery.scrollTo) gallery.scrollTo({ left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        setActive(tab.getAttribute("data-screenshot-tab"));
      });
    });
    setActive(activeDevice);
  }

  function loadBodyHighlights() {
    var grid = document.getElementById("body-highlights");
    if (!grid) return;
    fetch(assetBase + "celestial-bodies.json")
      .then(function (res) { return res.json(); })
      .then(function (bodies) {
        var wanted = ["earth", "moon", "mars", "jupiter", "terra_satellite", "tess_satellite"];
        var byId = {};
        bodies.forEach(function (body) { byId[body.id] = body; });
        wanted.map(function (id) { return byId[id]; }).filter(Boolean).forEach(function (body) {
          var card = document.createElement("article");
          card.className = "body-card";
          card.innerHTML =
            '<span class="body-card__type">' + escapeHTML(body.type.replace(/([A-Z])/g, " $1")) + '</span>' +
            '<h3>' + escapeHTML(body.name) + '</h3>' +
            '<p>' + escapeHTML(body.summary) + '</p>' +
            '<div class="body-card__facts">' +
              '<span><strong>Radius:</strong> ' + escapeHTML(formatDistance(body.radiusKm)) + '</span>' +
              '<span><strong>Orbit:</strong> ' + escapeHTML(body.orbitalPeriodDays == null ? "N/A" : body.orbitalPeriodDays.toLocaleString() + " days") + '</span>' +
            '</div>';
          grid.appendChild(card);
        });
      })
      .catch(function () {
        grid.innerHTML = '<p class="empty-note">Could not load body highlights.</p>';
      });
  }

  function loadFaq() {
    var list = document.getElementById("faq-list");
    if (!list) return;
    fetch(assetBase + "faq.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.render) return;
        data.faqs.filter(function (f) { return f.shown; }).forEach(function (faq) {
          var item = document.createElement("div");
          item.className = "faq-item";
          item.innerHTML =
            '<button class="faq-item__btn" aria-expanded="false">' +
              '<span>' + escapeHTML(faq.question) + '</span>' +
              '<svg class="faq-item__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
                '<line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
                '<line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
              '</svg>' +
            '</button>' +
            '<div class="faq-item__answer"><p>' + escapeHTML(faq.answer) + '</p></div>';
          list.appendChild(item);
        });
        initFaqAccordion(list);
      })
      .catch(function () { list.innerHTML = '<p class="empty-note">Could not load FAQ.</p>'; });
  }

  function loadChangelog() {
    var list = document.getElementById("changelog-list");
    if (!list) return;
    fetch(assetBase + "changelog.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.render) return;
        var shown = data.entries.filter(function (entry) { return entry.shown; });
        if (!shown.length) { list.innerHTML = '<p class="empty-note">No releases yet.</p>'; return; }
        shown.forEach(function (entry) {
          var el = document.createElement("div");
          el.className = "changelog-entry";
          var changes = entry.changes.map(function (change) { return '<li>' + escapeHTML(change) + '</li>'; }).join("");
          el.innerHTML =
            '<h2 class="changelog-entry__version">v' + escapeHTML(entry.version) + '</h2>' +
            '<time class="changelog-entry__date" datetime="' + escapeHTML(entry.date) + '">' + escapeHTML(entry.date) + '</time>' +
            '<ul>' + changes + '</ul>';
          list.appendChild(el);
        });
      })
      .catch(function () { list.innerHTML = '<p class="empty-note">Could not load changelog.</p>'; });
  }

  var SWETRIX_PROJECT_ID = "LSZ6ytCGblVs";
  var SWETRIX_API_URL = "https://analytics.novapro.net/backend/v1/log";
  var swetrixStarted = false;

  function pageSource() {
    var params = new URLSearchParams(window.location.search);
    var source = params.get("source") || params.get("utm_source");
    if (source) return source;
    if (!document.referrer) return undefined;
    try { return new URL(document.referrer).hostname.replace(/^www\./, ""); } catch (err) { return undefined; }
  }

  function initSwetrix() {
    if (swetrixStarted || !window.swetrix || typeof window.swetrix.init !== "function") return;
    swetrixStarted = true;
    window.swetrix.init(SWETRIX_PROJECT_ID, { apiURL: SWETRIX_API_URL });
    window.swetrix.trackViews({
      callback: function (payload) {
        if (!payload) return true;
        if (!payload.pg) payload.pg = window.location.pathname || "/";
        if (!payload.so) {
          var source = pageSource();
          if (source) payload.so = source;
        }
        return payload;
      }
    });
  }

  injectNavLinks();
  injectFooterLinks();
  injectFooterCopy();
  initScreenshotSection();
  loadBodyHighlights();
  loadFaq();
  loadChangelog();

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSwetrix, { once: true });
  else initSwetrix();
  window.addEventListener("load", initSwetrix, { once: true });
  window.setTimeout(initSwetrix, 1500);
})();
