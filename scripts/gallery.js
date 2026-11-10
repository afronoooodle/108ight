
/* ============================================================
   108IGHT — SINGLE-PAGE GALLERY
   Homepage: /
   Gallery:  /gallery
============================================================ */

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");

const ENTRANCE_DURATION = 850;
const EXIT_DURATION = 750;
const ROW_DELAY = 90;
const LIGHTBOX_DURATION = 450;
const BARREL_TRANSITION_DURATION = 1300;

let activeItem = null;
let activeContent = null;
let isAnimating = false;
let galleryIsLeaving = false;
let galleryTransitionStarted = false;

/* ============================================================
   PRELOAD GALLERY DATA
============================================================ */

const galleryDataPromise = fetch("gallery/gallery.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not load gallery.json");
        }

        return response.json();
    });

/* ============================================================
   CREATE GALLERY
============================================================ */

function createGalleryItems(mediaFiles) {

    gallery.innerHTML = "";

    mediaFiles.forEach(file => {

        const item = document.createElement("div");
        item.className = "gallery-item";

        let media;

        if (file.type === "video") {

            media = document.createElement("video");

            media.src = file.src;
            media.muted = true;
            media.defaultMuted = true;
            media.loop = true;
            media.autoplay = true;
            media.playsInline = true;
            media.controls = false;
            media.preload = "metadata";

            media.disablePictureInPicture = true;
            media.disableRemotePlayback = true;

            media.play().catch(() => {});

        } else {

            media = document.createElement("img");

            media.src = file.src;
            media.alt = "";
            media.loading = "lazy";

        }

        item.appendChild(media);

        item.addEventListener("click", () => {
            openLightbox(media, item);
        });

        gallery.appendChild(item);

    });

}

/* ============================================================
   GET ROWS
============================================================ */

function getGalleryRows() {

    const items = Array.from(
        gallery.querySelectorAll(".gallery-item")
    );

    const rows = [];

    items.forEach(item => {

        const top = Math.round(
            item.getBoundingClientRect().top
        );

        let row = rows.find(existing => existing.top === top);

        if (!row) {

            row = {
                top,
                items: []
            };

            rows.push(row);

        }

        row.items.push(item);

    });

    rows.sort((a, b) => a.top - b.top);

    return rows;

}

/* ============================================================
   HOMEPAGE GALLERY TRANSITION
============================================================ */

async function startHomepageGallery(urlAlreadyChanged = false) {

    if (galleryTransitionStarted || galleryIsLeaving) return;

    galleryTransitionStarted = true;

    try {

        document.body.classList.add("gallery-opening");

        const mediaFiles = await galleryDataPromise;

        createGalleryItems(mediaFiles);

        document.body.classList.add("gallery-preparing");

        const rows = getGalleryRows();

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                document.body.classList.add("gallery-enter-animation");

                rows.forEach((row, rowIndex) => {

                    row.items.forEach(item => {
                        item.style.transitionDelay =
                            `${rowIndex * ROW_DELAY}ms`;
                    });

                });

                document.body.classList.remove("gallery-preparing");

            });

        });

        const galleryDuration =
            ENTRANCE_DURATION +
            Math.max(0, rows.length - 1) * ROW_DELAY;

        const totalDuration = Math.max(
            BARREL_TRANSITION_DURATION,
            galleryDuration
        );

        setTimeout(() => {

            // Only add a history entry when the user clicked
            // GALLERY. Browser Forward has already changed it.
            if (!urlAlreadyChanged) {

                window.history.pushState(
                    { galleryPage: true },
                    "",
                    "/gallery"
                );

            }

            document.body.classList.add("gallery-active");
            galleryTransitionStarted = false;

        }, totalDuration + 150);

    } catch (error) {

        console.error("Gallery transition failed:", error);

        galleryTransitionStarted = false;

        document.body.classList.remove(
            "gallery-opening",
            "gallery-preparing",
            "gallery-enter-animation",
            "gallery-active"
        );

    }

}

// Replace the original function from barrel.js.
// This script is loaded after barrel.js.
window.openGalleryPage = startHomepageGallery;

/* ============================================================
   GALLERY INITIALISATION
============================================================ */

async function initialiseGallery() {

    // If the visitor directly opens /gallery,
    // build the gallery immediately.
    if (document.body.dataset.page !== "gallery") return;

    try {

        const mediaFiles = await galleryDataPromise;

        createGalleryItems(mediaFiles);

    } catch (error) {

        console.error("Could not initialise gallery:", error);

    }

}

/* ============================================================
   LIGHTBOX DIMENSIONS
============================================================ */

function getExpandedDimensions(aspectRatio) {

    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {

        height = maxHeight;
        width = height * aspectRatio;

    }

    return {
        width,
        height,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2
    };

}

function getMediaAspectRatio(media) {

    if (
        media.tagName === "VIDEO" &&
        media.videoWidth > 0 &&
        media.videoHeight > 0
    ) {
        return media.videoWidth / media.videoHeight;
    }

    if (
        media.tagName === "IMG" &&
        media.naturalWidth > 0 &&
        media.naturalHeight > 0
    ) {
        return media.naturalWidth / media.naturalHeight;
    }

    return 9 / 16;

}

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${String(remaining).padStart(2, "0")}`;

}

/* ============================================================
   VIDEO CONTROLS
============================================================ */

function createVideoControls(video) {

    const controls = document.createElement("div");
    controls.className = "video-controls";

    const playButton = document.createElement("button");
    playButton.className = "video-play-button";
    playButton.type = "button";
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "Pause video");

    const timeline = document.createElement("input");
    timeline.className = "video-timeline";
    timeline.type = "range";
    timeline.min = "0";
    timeline.max = "1000";
    timeline.step = "1";
    timeline.value = "0";

    const timeDisplay = document.createElement("span");
    timeDisplay.className = "video-time";
    timeDisplay.textContent = "0:00 / 0:00";

    function updatePlayButton() {

        if (video.paused) {
            playButton.textContent = "▶";
            playButton.setAttribute("aria-label", "Play video");
        } else {
            playButton.textContent = "Ⅱ";
            playButton.setAttribute("aria-label", "Pause video");
        }

    }

    playButton.addEventListener("click", event => {

        event.stopPropagation();

        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }

        updatePlayButton();

    });

    video.addEventListener("play", updatePlayButton);
    video.addEventListener("pause", updatePlayButton);

    function updateTimeline() {

        const duration = video.duration;

        if (!Number.isFinite(duration) || duration <= 0) return;

        if (!timeline.matches(":active")) {

            timeline.value = String(
                video.currentTime / duration * 1000
            );

        }

        timeDisplay.textContent =
            `${formatTime(video.currentTime)} / ${formatTime(duration)}`;

    }

    video.addEventListener("timeupdate", updateTimeline);
    video.addEventListener("loadedmetadata", updateTimeline);
    video.addEventListener("durationchange", updateTimeline);

    timeline.addEventListener("input", event => {

        event.stopPropagation();

        if (Number.isFinite(video.duration) && video.duration > 0) {

            video.currentTime =
                Number(timeline.value) / 1000 * video.duration;

        }

        updateTimeline();

    });

    controls.addEventListener("click", event => {
        event.stopPropagation();
    });

    controls.appendChild(playButton);
    controls.appendChild(timeline);
    controls.appendChild(timeDisplay);

    return controls;

}

/* ============================================================
   LIGHTBOX ANIMATION
============================================================ */

function animateTo(element, dimensions, duration, callback) {

    element.style.transition = "none";

    element.getBoundingClientRect();

    element.style.transition =
        `left ${duration}ms cubic-bezier(0.22, 1, 0.36, 1),
         top ${duration}ms cubic-bezier(0.22, 1, 0.36, 1),
         width ${duration}ms cubic-bezier(0.22, 1, 0.36, 1),
         height ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;

    requestAnimationFrame(() => {

        element.style.left = `${dimensions.left}px`;
        element.style.top = `${dimensions.top}px`;
        element.style.width = `${dimensions.width}px`;
        element.style.height = `${dimensions.height}px`;

    });

    setTimeout(() => {

        if (callback) callback();

    }, duration);

}

/* ============================================================
   OPEN IMAGE
============================================================ */

function openImage(media, item) {

    const rect = item.getBoundingClientRect();

    const content = document.createElement("div");
    content.className = "lightbox-content";

    content.style.left = `${rect.left}px`;
    content.style.top = `${rect.top}px`;
    content.style.width = `${rect.width}px`;
    content.style.height = `${rect.height}px`;

    const image = document.createElement("img");
    image.src = media.src;
    image.alt = "";

    content.appendChild(image);
    lightbox.appendChild(content);

    activeContent = content;
    activeItem = item;

    const dimensions = getExpandedDimensions(
        getMediaAspectRatio(media)
    );

    animateTo(
        content,
        dimensions,
        LIGHTBOX_DURATION,
        () => {
            isAnimating = false;
        }
    );

}

/* ============================================================
   OPEN VIDEO
============================================================ */

function openVideo(media, item) {

    const rect = item.getBoundingClientRect();

    const content = document.createElement("div");
    content.className = "video-content";

    const video = document.createElement("video");

    video.src = media.currentSrc || media.src;
    video.muted = false;
    video.defaultMuted = false;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = "auto";

    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;

    content.appendChild(video);
    content.appendChild(createVideoControls(video));

    content.style.left = `${rect.left}px`;
    content.style.top = `${rect.top}px`;
    content.style.width = `${rect.width}px`;
    content.style.height = `${rect.height}px`;

    lightbox.appendChild(content);

    activeContent = content;
    activeItem = item;

    video.play().catch(() => {});

    const dimensions = getExpandedDimensions(
        getMediaAspectRatio(media)
    );

    requestAnimationFrame(() => {

        animateTo(
            content,
            dimensions,
            LIGHTBOX_DURATION,
            () => {

                content.classList.add("controls-visible");
                isAnimating = false;

            }
        );

    });

    video.addEventListener("loadedmetadata", () => {

        if (activeContent !== content) return;

        const actualDimensions = getExpandedDimensions(
            getMediaAspectRatio(video)
        );

        content.style.transition = "none";
        content.style.width = `${actualDimensions.width}px`;
        content.style.height = `${actualDimensions.height}px`;
        content.style.left = `${actualDimensions.left}px`;
        content.style.top = `${actualDimensions.top}px`;

    });

}

/* ============================================================
   OPEN LIGHTBOX
============================================================ */

function openLightbox(media, item) {

    if (
        isAnimating ||
        activeContent ||
        galleryIsLeaving ||
        galleryTransitionStarted
    ) return;

    isAnimating = true;

    lightbox.innerHTML = "";
    lightbox.classList.add("active");

    if (media.tagName === "VIDEO") {
        openVideo(media, item);
    } else {
        openImage(media, item);
    }

}

/* ============================================================
   CLOSE LIGHTBOX
============================================================ */

function closeLightbox() {

    if (!activeContent || isAnimating) return;

    isAnimating = true;

    const content = activeContent;
    const video = content.querySelector("video");

    const rect = activeItem.getBoundingClientRect();

    if (video) {

        content.classList.remove("controls-visible");
        video.pause();

        animateTo(
            content,
            {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            },
            LIGHTBOX_DURATION,
            finishClosing
        );

    } else {

        animateTo(
            content,
            {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            },
            350,
            finishClosing
        );

    }

}

function finishClosing() {

    lightbox.classList.remove("active");
    lightbox.innerHTML = "";

    activeItem = null;
    activeContent = null;
    isAnimating = false;

}

/* ============================================================
   EXIT GALLERY
============================================================ */


/* ============================================================
   EXIT GALLERY
============================================================ */

function exitGallery(fromBrowserBack = false) {

    if (galleryIsLeaving) return;

    if (activeContent) {
        closeLightbox();
        return;
    }

    galleryIsLeaving = true;

    const wasHomepageGallery =
        document.body.classList.contains("gallery-active");

    const rows = getGalleryRows();

    document.body.classList.add("gallery-leaving");

    rows.forEach((row, rowIndex) => {

        const reverseIndex = rows.length - 1 - rowIndex;

        row.items.forEach(item => {

            item.style.transitionDelay =
                `${reverseIndex * ROW_DELAY}ms`;

        });

    });

    const totalDuration =
        EXIT_DURATION +
        Math.max(0, rows.length - 1) * ROW_DELAY;

    setTimeout(() => {

        gallery.querySelectorAll("video").forEach(video => {
            video.pause();
        });

        gallery.innerHTML = "";

        document.body.classList.remove(
            "gallery-opening",
            "gallery-preparing",
            "gallery-enter-animation",
            "gallery-leaving",
            "gallery-active"
        );

        document.body.dataset.page = "home";

        galleryTransitionStarted = false;
        galleryIsLeaving = false;

        // Returning from the homepage gallery.
        if (wasHomepageGallery) {

            document.body.classList.add("gallery-returning");

            const canvas = document.getElementById("canvas1");

            if (canvas) {
                void canvas.offsetHeight;
            }

            if (!fromBrowserBack) {
                window.history.back();
            }

            // Keep the entrance animation active until it finishes.
            setTimeout(() => {
                document.body.classList.remove("gallery-returning");
            }, 950);

        } else {

            // Returning from the standalone gallery URL.
            // The homepage activates its entrance animation
            // using the returning=gallery query parameter.
            window.location.href = "/108ight/?returning=gallery";

        }

    }, totalDuration + 100);

}


/* ============================================================
   LIGHTBOX CLICK OUTSIDE
============================================================ */

lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {
        closeLightbox();
    }

});

/* ============================================================
   RESIZE
============================================================ */

window.addEventListener("resize", () => {

    if (!activeContent || isAnimating) return;

    const media = activeContent.querySelector("video, img");

    if (!media) return;

    const dimensions = getExpandedDimensions(
        getMediaAspectRatio(media)
    );

    activeContent.style.transition = "none";

    activeContent.style.width = `${dimensions.width}px`;
    activeContent.style.height = `${dimensions.height}px`;
    activeContent.style.left = `${dimensions.left}px`;
    activeContent.style.top = `${dimensions.top}px`;

});

/* ============================================================
   ESCAPE
============================================================ */

document.addEventListener("keydown", event => {

    if (event.key !== "Escape") return;

    if (activeContent) {

        closeLightbox();

    } else if (
        document.body.dataset.page === "gallery" ||
        document.body.classList.contains("gallery-active")
    ) {

        exitGallery();

    }

});

/* ============================================================
   BROWSER BACK AND FORWARD
============================================================ */

window.addEventListener("popstate", () => {

    if (galleryIsLeaving) return;

    const currentPath =
        window.location.pathname.replace(/\/+$/, "") || "/";

    if (currentPath === "/gallery") {

        // Browser Forward has returned to /gallery.
        if (
            document.body.dataset.page === "home" &&
            !document.body.classList.contains("gallery-active")
        ) {
            startHomepageGallery(true);
        }

    } else if (
        currentPath === "/" &&
        document.body.classList.contains("gallery-active")
    ) {

        // Browser Back has returned to the homepage.
        exitGallery(true);

    }

});

/* ============================================================
   START
============================================================ */

initialiseGallery();
