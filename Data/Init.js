let searchParams = new URLSearchParams(window.location.search);
let searchKeyword = searchParams.get("u");


if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    document.head.appendChild(viewport);
}

document.addEventListener("DOMContentLoaded", function () {
    // Load header
    fetch("/rbbp/HTML/header.html", { cache: "no-cache" })
        .then((res) => res.text())
        .then((html) => {
            document.body.insertAdjacentHTML("afterbegin", html);
            GetHamburgerMenu();
            requireAjax("/rbbp/Data/src/settings.js", function () {
                setupBackToTop();
                requireAjax("/rbbp/Data/src/dataloader.js", function () {
                    requireAjax("/rbbp/Data/src/tooltips.js", function () {
                        requireAjax("/rbbp/Data/src/lookuputils.js", function () {
                            requireAjax("/rbbp/Data/Search.js", function () {
                                requireAjax("/rbbp/Data/Faction.js", function () {
                                    requireAjax("/rbbp/Data/Builder.js", function () {
                                        CheckData();
                                        // wait for a while and then  HandleExtraTooltips();
                                        setTimeout(function () {
                                            HandleExtraTooltips();
                                        }, 2000);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
});


function GetHamburgerMenu(){

    var isMobile = window.matchMedia('(hover: none), (max-width: 800px)');
    var menu = document.getElementById('menu');
    var toggle = document.getElementById('menuToggle');
    var backdrop = document.getElementById('menuBackdrop');
     var topbar = document.querySelector('.topbar');
    var anchor = document.getElementById('topbarAnchor');
    var extras = document.getElementById('menuExtras');

    function openMenu() {
        menu.classList.add('open');
        backdrop.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // stop background scroll while menu is open
    }
    function closeMenu() {
        menu.classList.remove('open');
        backdrop.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // also collapse any open submenus so it resets clean next time
        menu.querySelectorAll('.open').forEach(function (el) {
            if (el !== menu) el.classList.remove('open');
        });
    }

    toggle.addEventListener('click', function () {
        menu.classList.contains('open') ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu.classList.contains('open')) {
            closeMenu();
            toggle.focus();
        }
    });

    // Nested submenu toggling (mobile only; desktop keeps :hover)
    menu.addEventListener('click', function (e) {
        if (!isMobile.matches) return;

        var link = e.target.closest('#menu > li > a, .has-submenu > a');
        if (!link) return;

        var submenu = link.nextElementSibling;
        if (submenu && submenu.tagName === 'UL') {
            e.preventDefault();
            submenu.classList.toggle('open');
        }
        // else: it's a real link (like Search) — let it navigate normally,
        // closeMenu() isn't strictly needed since the page is about to unload
    });

     function placeTopbar(mobile) {
        if (mobile) {
            extras.appendChild(topbar);
        } else {
            anchor.parentNode.insertBefore(topbar, anchor.nextSibling);
        }
    }

    placeTopbar(isMobile.matches); // set correct position on load
    isMobile.addEventListener('change', function (e) {
        if (!e.matches) closeMenu();
        placeTopbar(e.matches);
    });

    extras.addEventListener('click', function (e) {
        if (!isMobile.matches) return;

        var title = e.target.closest('.dropdown-title');
        if (!title) return;

        var content = title.nextElementSibling; // the .dropdown-content right after it
        if (content && content.classList.contains('dropdown-content')) {
            content.classList.toggle('open');
        }
    });

}


function requireAjax(file, callback) {
    jQuery.getScript(file, callback);
}

function setupSubsectionLists() {
    if (location.pathname.endsWith("/Search.html")) return;
    for (const list of document.querySelectorAll(".w3-bar:has(+ [id^='dataHolder'])")) {
        if (!list.id || !list.children.length || list.previousElementSibling?.classList.contains("subsection-toggle")) continue;

        const toggle = document.createElement("button");
        const russian = languageSelect.value === "RU";
        const label = russian ? "Подразделы" : "Subsections";
        toggle.type = "button";
        toggle.className = "subsection-toggle";
        toggle.setAttribute("aria-controls", list.id);
        list.parentElement.classList.add("subsection-layout");
        list.before(toggle);

        function update(open) {
            const selected = list.querySelector(".w3-red");
            toggle.textContent = selected?.getAttribute("aria-label") || selected?.textContent.trim() || label;
            toggle.setAttribute("aria-expanded", String(open));
        }

        update(!list.querySelector(".w3-red"));
        toggle.addEventListener("click", () => update(toggle.getAttribute("aria-expanded") !== "true"));
        list.addEventListener("subsectionchange", (event) => {
            if (event.detail.focusToggle && toggle.getClientRects().length) toggle.focus();
            update(false);
        });
        list.addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || !toggle.getClientRects().length) return;
            toggle.focus();
            update(false);
        });
    }
}


function setupBackToTop() {
    const button = document.createElement("button");
    const label = languageSelect.value === "RU" ? "В начало страницы" : "Back to top";
    button.type = "button";
    button.className = "back-to-top";
    button.textContent = "↑";
    button.setAttribute("aria-label", label);
    button.title = label;
    document.body.appendChild(button);

    function updateVisibility() {
        button.hidden = window.scrollY < window.innerHeight * 0.75;
    }

    button.addEventListener("click", () => window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    }));
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    updateVisibility();
}
