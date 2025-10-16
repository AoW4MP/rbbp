let searchParams = new URLSearchParams(window.location.search);
let searchKeyword = searchParams.get("u");
document.addEventListener("DOMContentLoaded", function () {
    // Load header
    fetch("/rbbp/HTML/header.html")
        .then((res) => res.text())
        .then((html) => {
            document.body.insertAdjacentHTML("afterbegin", html);

            requireAjax("/rbbp/Data/src/settings.js", function () {
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

function requireAjax(file, callback) {
    jQuery.getScript(file, callback);
}
