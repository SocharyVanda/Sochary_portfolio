(function () {
  "use strict";

  var app = document.getElementById("app");
  var desktop = document.getElementById("desktop");
  var dock = document.querySelector(".dock");
  var menuAppName = document.getElementById("menuAppName");
  var desktopHint = document.getElementById("desktopHint");
  var clockEl = document.getElementById("clock");

  var windows = Array.prototype.slice.call(document.querySelectorAll(".mac-window"));
  var windowMap = {};
  windows.forEach(function (w) { windowMap[w.getAttribute("data-window")] = w; });

  var PROJECTS = [
    {
      id: "booklan",
      title: "BookLan",
      thumb: "assets/images/projects/booklan-thumb.jpg",
      hero: "assets/images/projects/booklan-hero.jpg",
      tags: [],
      tools: [],
      description: "BookLan is a mobile application that helps people who are on the road see the incoming bus and book it on the spot.",
      link: { label: "View on Figma", url: "https://www.figma.com/design/e6fx794L1o7bO24l9gcjP2/MIS-Challenge---2026?node-id=372-25570&t=bXyNLY0IRSAJ4ZsM-1" }
    },
    {
      id: "brewfinder",
      title: "BrewFinder",
      thumb: "assets/images/projects/brewfinder-thumb.jpg",
      hero: "assets/images/projects/brewfinder-hero.jpg",
      tags: ["Team"],
      tools: ["Notion", "Figma", "Discord"],
      description: "BrewFinder is an app that helps cafe-hoppers find the most personalized cafe shops, from a first wireframe pass through to a working flow."
    },
    {
      id: "tesla",
      title: "Tesla Clone",
      thumb: "assets/images/projects/tesla-thumb.jpg",
      hero: "assets/images/projects/tesla-hero.jpg",
      tags: [],
      tools: ["Figma", "Notion"],
      description: "A front-end clone of Tesla's marketing site, rebuilt to practice pixel-accurate layout, typography, and motion."
    },
    {
      id: "skincare",
      title: "GlowSkin — Skincare Website",
      thumb: "assets/images/projects/skincare-thumb.jpg",
      hero: "assets/images/projects/skincare-hero.jpg",
      tags: ["Researcher", "Designer", "Team"],
      tools: ["Notion", "Figma"],
      description: "A team project (Team 8, MIS Challenge) to design a skincare e-commerce website. Before the design stage, the team conducted user research together to identify pain points, the target audience, and the overall experience visitors would have.",
    },
    {
      id: "wedpod",
      title: "WedPod",
      thumb: "assets/images/projects/wedpod-thumb.jpg",
      hero: "assets/images/projects/wedpod-hero.jpg",
      tags: [],
      tools: ["Figma"],
      description: "WedPod is a wedding-planning platform that helps couples plan and book their wedding venue."
    }
  ];

  var zCounter = 20;
  var openWindows = {}; // name -> true while open (incl. minimized)
  var minimized = {};
  var focusedName = null;
  var hintDismissed = false;

  function isMobile() {
    return window.innerWidth <= 680;
  }

  function dismissHint() {
    if (hintDismissed) return;
    hintDismissed = true;
    desktopHint.classList.add("hidden");
  }

  function titleFor(name) {
    var t = windowMap[name] && windowMap[name].querySelector(".window-title");
    return t ? t.textContent : name;
  }

  function setDockRunning(name, isRunning) {
    document.querySelectorAll('.dock-item[data-open="' + name + '"]').forEach(function (el) {
      el.classList.toggle("running", !!isRunning);
    });
  }

  function cascadePosition(win, index) {
    var rect = desktop.getBoundingClientRect();
    var w = parseInt(win.getAttribute("data-w"), 10) || 480;
    var h = parseInt(win.getAttribute("data-h"), 10) || 400;
    w = Math.min(w, rect.width - 24);
    h = Math.min(h, rect.height - 24);
    var offset = (index % 6) * 26;
    var left = Math.max(12, (rect.width - w) / 2 + offset - 40);
    var top = Math.max(12, (rect.height - h) / 2.6 + offset - 20);
    win.style.width = w + "px";
    win.style.height = h + "px";
    win.style.left = left + "px";
    win.style.top = top + "px";
  }

  function focus(name) {
    var win = windowMap[name];
    if (!win) return;
    windows.forEach(function (w) { w.classList.remove("focused"); });
    win.classList.add("focused");
    zCounter += 1;
    win.style.zIndex = Math.min(zCounter, 350);
    focusedName = name;
    menuAppName.textContent = titleFor(name);
    document.querySelectorAll(".dock-item").forEach(function (el) {
      el.classList.toggle("active-app", el.getAttribute("data-open") === name);
    });
  }

  var positionedOnce = {};
  var openIndex = 0;

  function openWindow(name) {
    var win = windowMap[name];
    if (!win) return;
    dismissHint();

    if (!positionedOnce[name]) {
      cascadePosition(win, openIndex++);
      positionedOnce[name] = true;
    }

    if (isMobile()) {
      win.classList.add("maximized");
    }

    win.classList.add("open");
    minimized[name] = false;
    openWindows[name] = true;
    setDockRunning(name, true);

    requestAnimationFrame(function () {
      win.classList.add("show");
    });

    focus(name);
  }

  function closeWindow(name) {
    var win = windowMap[name];
    if (!win) return;
    win.classList.remove("show");
    openWindows[name] = false;
    minimized[name] = false;
    setDockRunning(name, false);
    setTimeout(function () {
      if (!win.classList.contains("show")) win.classList.remove("open");
    }, 220);
    if (focusedName === name) {
      focusedName = null;
      menuAppName.textContent = "Finder";
    }
  }

  function minimizeWindow(name) {
    var win = windowMap[name];
    if (!win) return;
    win.classList.remove("show");
    minimized[name] = true;
    setTimeout(function () {
      if (!win.classList.contains("show")) win.classList.remove("open");
    }, 220);
    if (focusedName === name) {
      focusedName = null;
      menuAppName.textContent = "Finder";
    }
  }

  function toggleMaximize(name) {
    var win = windowMap[name];
    if (!win) return;
    win.classList.toggle("maximized");
    focus(name);
  }

  function handleDockClick(name) {
    if (openWindows[name] && !minimized[name] && focusedName === name) {
      minimizeWindow(name);
    } else if (openWindows[name] && !minimized[name]) {
      focus(name);
    } else {
      openWindow(name);
    }
  }

  // ---- Projects folder + detail rendering ----
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderProjectGrid() {
    var grid = document.getElementById("projectGrid");
    if (!grid) return;
    grid.innerHTML = PROJECTS.map(function (p) {
      return (
        '<div class="project-icon" data-project="' + p.id + '" tabindex="0" role="button" aria-label="Open ' + escapeHtml(p.title) + '">' +
          '<img src="' + p.thumb + '" alt="" loading="lazy" />' +
          "<span>" + escapeHtml(p.title) + "</span>" +
        "</div>"
      );
    }).join("");

    var lastTap = {};
    grid.querySelectorAll(".project-icon").forEach(function (el) {
      var id = el.getAttribute("data-project");
      el.addEventListener("click", function () {
        grid.querySelectorAll(".project-icon.selected").forEach(function (o) {
          if (o !== el) o.classList.remove("selected");
        });
        var now = Date.now();
        if (now - (lastTap[id] || 0) < 400) {
          el.classList.remove("selected");
          openProjectDetail(id);
          lastTap[id] = 0;
        } else {
          el.classList.add("selected");
          lastTap[id] = now;
        }
      });
      el.addEventListener("dblclick", function () { openProjectDetail(id); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProjectDetail(id); }
      });
    });
  }

  function openProjectDetail(id) {
    var project = PROJECTS.filter(function (p) { return p.id === id; })[0];
    if (!project) return;

    document.getElementById("projectDetailTitle").textContent = project.title;

    var tagsHtml = project.tags.map(function (t) {
      return '<span class="tag-pill">' + escapeHtml(t) + "</span>";
    }).join("");

    var toolsHtml = project.tools.length
      ? '<h4>Tools</h4><div class="chip-row" style="margin-bottom:1.2rem;">' +
        project.tools.map(function (t) { return '<span class="chip chip-purple">' + escapeHtml(t) + "</span>"; }).join("") +
        "</div>"
      : "";

    var linkHtml = project.link
      ? '<a class="project-link" href="' + project.link.url + '" target="_blank" rel="noopener">' + escapeHtml(project.link.label) + " &rarr;</a>"
      : "";

    document.getElementById("projectDetailBody").innerHTML =
      '<img class="project-hero" src="' + project.hero + '" alt="' + escapeHtml(project.title) + ' cover" />' +
      '<div class="project-detail-content">' +
        "<h2>" + escapeHtml(project.title) + "</h2>" +
        (tagsHtml ? '<div class="project-tag-row">' + tagsHtml + "</div>" : "") +
        '<p class="desc">' + escapeHtml(project.description) + "</p>" +
        toolsHtml +
        linkHtml +
      "</div>";

    openWindow("project-detail");
  }

  renderProjectGrid();

  // ---- Wire up desktop icons (double-click / double-tap to open) ----
  document.querySelectorAll(".desktop-icon[data-open]").forEach(function (icon) {
    var lastTap = 0;
    icon.addEventListener("click", function (e) {
      document.querySelectorAll(".desktop-icon.selected").forEach(function (el) {
        if (el !== icon) el.classList.remove("selected");
      });
      var now = Date.now();
      if (now - lastTap < 400) {
        icon.classList.remove("selected");
        openWindow(icon.getAttribute("data-open"));
        lastTap = 0;
      } else {
        icon.classList.add("selected");
        lastTap = now;
      }
    });
    icon.addEventListener("dblclick", function () {
      openWindow(icon.getAttribute("data-open"));
    });
  });

  desktop.addEventListener("click", function (e) {
    if (!e.target.closest(".desktop-icon")) {
      document.querySelectorAll(".desktop-icon.selected").forEach(function (el) {
        el.classList.remove("selected");
      });
    }
  });

  // ---- Wire up dock ----
  document.querySelectorAll(".dock-item[data-open]").forEach(function (item) {
    item.addEventListener("click", function () {
      handleDockClick(item.getAttribute("data-open"));
    });
  });

  // ---- Wire up window chrome ----
  windows.forEach(function (win) {
    var name = win.getAttribute("data-window");

    win.addEventListener("pointerdown", function () { focus(name); });

    win.querySelector('[data-action="close"]').addEventListener("click", function (e) {
      e.stopPropagation();
      closeWindow(name);
    });
    win.querySelector('[data-action="min"]').addEventListener("click", function (e) {
      e.stopPropagation();
      minimizeWindow(name);
    });
    win.querySelector('[data-action="max"]').addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMaximize(name);
    });

    // Dragging via titlebar
    var titlebar = win.querySelector(".window-titlebar");
    var drag = null;
    titlebar.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".tl") || win.classList.contains("maximized")) return;
      var rect = win.getBoundingClientRect();
      var deskRect = desktop.getBoundingClientRect();
      drag = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      win.classList.add("dragging");
      titlebar.setPointerCapture(e.pointerId);
      focus(name);
    });
    titlebar.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var deskRect = desktop.getBoundingClientRect();
      var w = win.offsetWidth;
      var h = win.offsetHeight;
      var left = e.clientX - deskRect.left - drag.offsetX;
      var top = e.clientY - deskRect.top - drag.offsetY;
      left = Math.max(-w + 80, Math.min(left, deskRect.width - 80));
      top = Math.max(0, Math.min(top, deskRect.height - 40));
      win.style.left = left + "px";
      win.style.top = top + "px";
    });
    function endDrag(e) {
      if (!drag) return;
      drag = null;
      win.classList.remove("dragging");
      try { titlebar.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    titlebar.addEventListener("pointerup", endDrag);
    titlebar.addEventListener("pointercancel", endDrag);

    // Resizing
    var handle = win.querySelector(".resize-handle");
    var resize = null;
    handle.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      resize = { startW: win.offsetWidth, startH: win.offsetHeight, startX: e.clientX, startY: e.clientY };
      handle.setPointerCapture(e.pointerId);
      focus(name);
    });
    handle.addEventListener("pointermove", function (e) {
      if (!resize) return;
      var newW = Math.max(320, resize.startW + (e.clientX - resize.startX));
      var newH = Math.max(220, resize.startH + (e.clientY - resize.startY));
      win.style.width = newW + "px";
      win.style.height = newH + "px";
    });
    function endResize(e) {
      if (!resize) return;
      resize = null;
      try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    handle.addEventListener("pointerup", endResize);
    handle.addEventListener("pointercancel", endResize);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && focusedName) {
      closeWindow(focusedName);
    }
  });

  // ---- Clock ----
  function updateClock() {
    var now = new Date();
    var opts = { weekday: "short", hour: "numeric", minute: "2-digit" };
    clockEl.textContent = now.toLocaleString(undefined, opts);
  }
  updateClock();
  setInterval(updateClock, 15000);

  // ---- Reveal app + auto-open About ----
  app.hidden = false;
  setTimeout(function () {
    openWindow("about");
  }, 350);

  window.addEventListener("resize", function () {
    windows.forEach(function (win) {
      if (!win.classList.contains("open") || win.classList.contains("maximized")) return;
      var deskRect = desktop.getBoundingClientRect();
      var left = parseFloat(win.style.left) || 0;
      var top = parseFloat(win.style.top) || 0;
      left = Math.max(0, Math.min(left, deskRect.width - 80));
      top = Math.max(0, Math.min(top, deskRect.height - 40));
      win.style.left = left + "px";
      win.style.top = top + "px";
    });
  });
})();
