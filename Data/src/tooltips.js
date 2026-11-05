const tooltipTouchLayout = window.matchMedia("(max-width: 800px), (hover: none)");

function closeTooltips() {
    document.getElementById("hoverDiv").close();
    document.getElementById("hoverDiv2").close();
}

document.addEventListener("pointerdown", event => {
    if (tooltipTouchLayout.matches && !event.target.closest("dialog.tooltiptextnew")) closeTooltips();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeTooltips();
});

function positionTouchTooltip(dialog) {
    const viewport = window.visualViewport;
    if (!viewport) return;
    dialog.style.left = `${viewport.offsetLeft}px`;
    dialog.style.width = `${viewport.width}px`;
    dialog.style.maxHeight = `${viewport.height * 0.55}px`;
    dialog.style.top = `${viewport.offsetTop + viewport.height - dialog.offsetHeight}px`;
}

for (const event of ["resize", "scroll"]) {
    window.visualViewport?.addEventListener(event, () => {
        if (!tooltipTouchLayout.matches) return;
        document.querySelectorAll("dialog.tooltiptextnew[open]").forEach(positionTouchTooltip);
    });
}

function addTooltipListeners(tooltip, span, secondary) {
    let hoverDiv2 = document.getElementById("hoverDiv2");
    let hoverDiv = document.getElementById("hoverDiv");

    if (secondary != undefined) {
        tooltip.addEventListener("mouseenter", function (event) {
            TurnOnTooltip(span, secondary);
            //  FillToolTip(span, secondary);

            hoverDiv2.style.visibility = "hidden"; // make it invisible
            hoverDiv2.inert = true;
            hoverDiv2.show();
            hoverDiv2.inert = false;
            if (tooltip != hoverDiv2) {
                 try { updateHoverDivPosition(event, secondary); } catch(e) {}
                //updateHoverDivPosition(event, secondary);
            }
            hoverDiv2.close(); // close and reset visiblity
            hoverDiv2.style.visibility = "";
            hoverDiv2.inert = true;
            hoverDiv2.show();
            hoverDiv2.inert = false;
        });

        tooltip.addEventListener("mouseleave", function () {
            // if (altHeld == false) {
            // Only hide if ALT is NOT active
            TurnOffTooltip(secondary, tooltip);
            //}
        });
    } else {
        tooltip.addEventListener("mouseenter", function (event) {
            TurnOnTooltip(span, secondary);
            // hoverDiv.show();
            hoverDiv.style.visibility = "hidden";
            hoverDiv.inert = true;
            hoverDiv.show();
            hoverDiv.inert = false;
            if (tooltip != hoverDiv) {
                    try { updateHoverDivPosition(event, secondary); } catch(e) {}
              //  updateHoverDivPosition(event, secondary);
            }
            hoverDiv.close();
            hoverDiv.style.visibility = "";
            hoverDiv.inert = true;
            hoverDiv.show();
            hoverDiv.inert = false;
        });

        tooltip.addEventListener("mouseleave", function () {
            //  if (altHeld == false) {
            TurnOffTooltip(secondary);
            //  }
        });
    }
}

function removeToolTipListeners(tooltip) {
    tooltip.removeEventListener("mouseenter", tooltip);

    tooltip.removeEventListener("mouseleave", tooltip);
}

function TurnOnTooltip(spa, secondary) {
    // Configuration of the observer: observe changes to child nodes
    let hoverDiv2 = document.getElementById("hoverDiv2");
    let hoverDiv = document.getElementById("hoverDiv");
    if (secondary != undefined) {
        if (spa != null) {
            hoverDiv2.innerHTML = spa.innerHTML;
        }
    } else {
        if (spa != null) {
            hoverDiv.innerHTML = spa.innerHTML;
            HandleExtraTooltips(hoverDiv);
        }
    }
    if (spa && tooltipTouchLayout.matches) {
        const dialog = secondary != undefined ? hoverDiv2 : hoverDiv;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tooltip-close";
        button.setAttribute("aria-label", getUserSettings()?.language?.toLowerCase() === "ru" ? "Закрыть подсказку" : "Close tooltip");
        button.textContent = "×";
        button.addEventListener("click", closeTooltips);
        dialog.prepend(button);
    }
}


function TurnOffTooltip(secondary, origin) {
    let hoverDiv2 = document.getElementById("hoverDiv2");
    let hoverDiv = document.getElementById("hoverDiv");

    if (tooltipTouchLayout.matches) return;
    if (secondary != undefined) {
        if (checkboxTooltip.checked) {
            if (origin == hoverDiv2 && hoverDiv2.open) hoverDiv2.close();
        } else {
            if (hoverDiv2.open) hoverDiv2.close();
        }
    } else {
        // Close hoverDiv on its own terms — don't let hoverDiv2's state block this indefinitely.
        if (hoverDiv.open) hoverDiv.close();
    }
}
/*function TurnOffTooltip(secondary, origin) {
    hoverDiv2 = document.getElementById("hoverDiv2");
    hoverDiv = document.getElementById("hoverDiv");

    // console.log("dialog 2 is open? " + hoverDiv2.open);
    if (secondary != undefined) {
        if (checkboxTooltip.checked) {
            if (origin == hoverDiv2) {
                 hoverDiv2.innerHTML = "";
                hoverDiv2.close();
            }
        } else {
              hoverDiv2.innerHTML = "";
            hoverDiv2.close();
        }

        // console.log("closed dialog 2");
    } else {
        if (hoverDiv2.open) {
            //   console.log("dialog is open ");
        } else {
              hoverDiv.innerHTML = "";

            hoverDiv.close();

            //  console.log("closed dialog 1");
        }
    }
}*/

function getNormalizedPosition(event) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // event.clientX and event.clientY give the position of the mouse
    const xPosition = event.clientX;
    const yPosition = event.clientY;

    // Normalize to a range of 0 to 1
    const normalizedX = xPosition / screenWidth;
    const normalizedY = yPosition / screenHeight;

    return {
        x: normalizedX,
        y: normalizedY
    };
}
function updateHoverDivPosition(event, secondary) {
    const settings = getUserSettings();

    let hoverDiv = secondary != undefined
        ? document.getElementById("hoverDiv2")
        : document.getElementById("hoverDiv");

    if (settings.tooltipselectable) {
        hoverDiv.setAttribute("Style", "pointer-events: all;");
    } else {
        hoverDiv.setAttribute("Style", "pointer-events: none;");
    }

    if (tooltipTouchLayout.matches) {
        hoverDiv.style.pointerEvents = "auto";
        positionTouchTooltip(hoverDiv);
        return;
    }

    var selectionsHolder = document.querySelector("#selectionsHolder > .selections") ?? document.getElementById("selectionsHolder");
    if (selectionsHolder && event.target.closest && event.target.closest("#selectionsHolder")) {
        var holderRect = selectionsHolder.getBoundingClientRect();
        var dialogRect = hoverDiv.getBoundingClientRect();

        var desiredLeft = (holderRect.right + 20 + dialogRect.width < window.innerWidth)
            ? holderRect.right + 20
            : holderRect.left - dialogRect.width - 20;

        clampToViewport(hoverDiv, desiredLeft, event.clientY - 50 );
        return;
    }

    var offset = secondary != undefined ? -5 : (settings.tooltipselectable ? 2 : 10);
    clampToViewport(hoverDiv, event.clientX + offset, event.clientY + offset);
}
function getNormalizedHeight(element) {
    const elementWidth = element.getBoundingClientRect().height;
    const viewportWidth = window.innerHeight;
    return elementWidth / viewportWidth;
}

function getNormalizedWidth(element) {
    const elementWidth = element.getBoundingClientRect().width;
    const viewportWidth = window.innerWidth;
    return elementWidth / viewportWidth;
}

function clampToViewport(el, viewportLeft, viewportTop, margin = 8) {
    const rect = el.getBoundingClientRect(); // just need width/height
    const maxLeft = window.innerWidth - rect.width - margin;
    const maxTop = window.innerHeight - rect.height - margin;

    const clampedLeft = Math.min(Math.max(viewportLeft, margin), Math.max(maxLeft, margin));
    const clampedTop = Math.min(Math.max(viewportTop, margin), Math.max(maxTop, margin));

    el.style.left = (clampedLeft + window.pageXOffset) + "px";
    el.style.top = (clampedTop + window.pageYOffset) + "px";
}
