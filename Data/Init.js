let searchParams = new URLSearchParams(window.location.search);
let searchKeyword = searchParams.get("u");
document.addEventListener("DOMContentLoaded", function () {
    // Load header
    fetch("/evolved/HTML/header.html")
        .then((res) => res.text())
        .then((html) => {
            document.body.insertAdjacentHTML("afterbegin", html);

            requireAjax("/evolved/Data/src/settings.js", function () {
                requireAjax("/evolved/Data/src/dataloader.js", function () {
                    requireAjax("/evolved/Data/src/tooltips.js", function () {
                        requireAjax("/evolved/Data/src/lookuputils.js", function () {
                            requireAjax("/evolved/Data/Search.js", function () {
                                requireAjax("/evolved/Data/Faction.js", function () {
                                    requireAjax("/evolved/Data/Builder.js", function () {
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

function requireAjax(file, callback) {
    jQuery.getScript(file, callback);
}
