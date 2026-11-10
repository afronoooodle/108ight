
/* ============================================================
   108IGHT — AUTHENTICATION BARREL
============================================================ */

(function () {

    const canvas = document.getElementById("canvas1");
    const overlay = document.getElementById("auth-overlay");

    if (!canvas) return;


    // ========================================================
    // ADJUSTABLE AUTHENTICATION BARREL SETTINGS
    // ========================================================

    // 1.00 = original size
    // 1.20 = 20% larger
    // 1.30 = 30% larger
    const AUTH_BARREL_SCALE = 1.4;

    // 0.75 = original opacity
    // 0.85 = darker
    // 1.00 = completely opaque
    const AUTH_BARREL_OPACITY = 0.96;

    // Rotation speed during entrance
    const AUTH_ROTATION_SPEED = 0.025;

    // Entrance animation duration
    const AUTH_TRANSITION_DURATION = 550;


    // ========================================================
    // SHARE SUPABASE CLIENT
    // ========================================================

    window.__108IGHT_SUPABASE_CLIENT =
        typeof barrelSupabaseClient !== "undefined"
            ? barrelSupabaseClient
            : null;


    // ========================================================
    // BARREL STATE
    // ========================================================

    let authActive = false;
    let authAnimationStart = null;

    const originalDrawItems = drawItems;


    // Values used by barrel.js when drawing the barrel.
    window.__108IGHT_AUTH_ACTIVE = false;
    window.__108IGHT_AUTH_SCALE = AUTH_BARREL_SCALE;
    window.__108IGHT_AUTH_OPACITY = AUTH_BARREL_OPACITY;


    // ========================================================
    // ENTER / EXIT AUTHENTICATION
    // ========================================================

    function setAuthBarrel(active) {

        authActive = active;

        window.__108IGHT_AUTH_ACTIVE = active;

        if (active) {

            selected = false;
            selectedIndex = -1;

            dragging = false;
            snapping = false;
            manuallyControlled = false;
            clickedSnap = false;

            velocity = 0;

            autoRotationActive = false;

            barrelTargetX = BARREL_OPEN_X();
            barrelTargetY = BARREL_OPEN_Y();

            authAnimationStart = performance.now();

            // Hide icons and labels.
            drawItems = function () {};

            document.body.classList.add("auth-mode");

        } else {

            window.__108IGHT_AUTH_ACTIVE = false;

            drawItems = originalDrawItems;

            document.body.classList.remove("auth-mode");

            authAnimationStart = null;

            selected = false;
            selectedIndex = -1;

            dragging = false;
            snapping = false;
            manuallyControlled = false;
            clickedSnap = false;

            velocity = 0;

            autoRotationActive = AUTO_ROTATION_ENABLED;

        }

    }


    window.set108ightAuthBarrel = setAuthBarrel;


    // ========================================================
    // ENTRANCE ROTATION
    // ========================================================

    function animateAuthBarrel(time) {

        if (authActive) {

            if (authAnimationStart !== null) {

                const progress = Math.min(
                    (time - authAnimationStart) /
                    AUTH_TRANSITION_DURATION,
                    1
                );

                const eased =
                    progress * progress * (3 - 2 * progress);

                const speed =
                    AUTH_ROTATION_SPEED * (1 - eased) +
                    AUTO_ROTATION_SPEED * eased;

                rotation += speed;

                if (progress >= 1) {
                    authAnimationStart = null;
                }

            } else {

                rotation += AUTO_ROTATION_SPEED;

            }

        }

        requestAnimationFrame(animateAuthBarrel);

    }

    requestAnimationFrame(animateAuthBarrel);


    // ========================================================
    // INTERCEPT LOGIN / ACCOUNT CLICK
    // ========================================================

    canvas.addEventListener("click", function (event) {

        const rect = canvas.getBoundingClientRect();

        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;

        mouseInside = true;

        const index = getHoveredItem();

        if (index !== 6) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const destination =
            barrelUserIsLoggedIn
                ? "/account"
                : "/login";

        window.navigate108ight(destination);

    }, true);


    // ========================================================
    // CLICK OUTSIDE AUTHENTICATION BARREL
    // ========================================================

    overlay.addEventListener("click", function (event) {

        // Only close when the actual background is clicked.
        if (event.target === overlay) {

            window.navigate108ight("/");

        }

    });


})();
