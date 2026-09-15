// ============================================================
// 108IGHT MUSIC PLAYER
// ============================================================


// ============================================================
// SETTINGS
// ============================================================

// --------------------
// Music
// --------------------

const MUSIC_FILE = "music/SUPXR-WHATS_UP!.mp3";
const MUSIC_NAME = "SUPXR-WHATS_UP!.mp3";


// --------------------
// Font
// --------------------

const PLAYER_FONT = "Mozilla Headline";


// --------------------
// Player size
// --------------------

const PLAYER_WIDTH = 420;
const PLAYER_HEIGHT = 40;


// --------------------
// Player position
// --------------------

const PLAYER_BOTTOM = "5%";


// --------------------
// Player appearance
// --------------------

const PLAYER_BACKGROUND = "0, 0, 0";
const PLAYER_BACKGROUND_OPACITY = 0.5;

const PLAYER_TEXT_COLOR = "white";

const PLAYER_BORDER_SIZE = 1;
const PLAYER_BORDER_COLOR = "white";


// --------------------
// Progress rectangle
// --------------------

// Opacity of the lighter progress area.
const PLAYER_PROGRESS_OPACITY = 0.15;

// Colour of the progress area.
const PLAYER_PROGRESS_COLOR = "255, 255, 255";


// --------------------
// Main text
// --------------------

const PLAYER_TEXT_SIZE = 13;
const PLAYER_TEXT_WEIGHT = 200;


// --------------------
// Time text
// --------------------

const PLAYER_TIME_SIZE = 13;
const PLAYER_TIME_WEIGHT = 200;


// --------------------
// Music note
// --------------------

const PLAYER_NOTE_SIZE = 21;


// --------------------
// Play button
// --------------------

const PLAY_BUTTON_HOVER_OPACITY = 0.08;


// --------------------
// Play icon
// --------------------

const PLAY_ICON_WIDTH = 12;
const PLAY_ICON_HEIGHT = 8;
const PLAY_ICON_COLOR = "white";


// --------------------
// Pause icon
// --------------------

const PAUSE_BAR_WIDTH = 3;
const PAUSE_BAR_HEIGHT = 16;
const PAUSE_ICON_WIDTH = 11;


// --------------------
// Text spacing
// --------------------

const TEXT_LEFT_PADDING = 8;
const TEXT_RIGHT_PADDING = 8;


// --------------------
// Time area
// --------------------

const TIME_MIN_WIDTH = 55;
const TIME_RIGHT_PADDING = 10;


// --------------------
// Seeking
// --------------------

// Mouse cursor while hovering over the player.
const SEEK_CURSOR = "ew-resize";


// ============================================================
// AUDIO
// ============================================================

const audio = new Audio(MUSIC_FILE);
audio.preload = "metadata";


// ============================================================
// CREATE PLAYER
// ============================================================

const player = document.createElement("div");
player.id = "music-player";

player.innerHTML = `
    <div id="music-play">
        <div id="music-play-icon"></div>
    </div>

    <div id="music-content">
        <span id="music-text">${MUSIC_NAME}</span>
    </div>

    <div id="music-right">
        <span id="music-time">♪</span>
    </div>
`;

document.body.appendChild(player);


// ============================================================
// STYLE
// ============================================================

const style = document.createElement("style");

style.textContent = `

/* -------------------- Player -------------------- */

#music-player {
    position: fixed;
    left: 50%;
    bottom: ${PLAYER_BOTTOM};
    transform: translateX(-50%);

    width: ${PLAYER_WIDTH}px;
    height: ${PLAYER_HEIGHT}px;

    display: flex;
    align-items: stretch;
    box-sizing: border-box;

    border: ${PLAYER_BORDER_SIZE}px solid ${PLAYER_BORDER_COLOR};

    background: rgba(
        ${PLAYER_BACKGROUND},
        ${PLAYER_BACKGROUND_OPACITY}
    );

    color: ${PLAYER_TEXT_COLOR};

    font-family: "${PLAYER_FONT}", sans-serif;

    overflow: hidden;
    user-select: none;
    z-index: 9999;

    cursor: ${SEEK_CURSOR};
}


/* -------------------- Progress -------------------- */

#music-player::before {
    content: "";

    position: absolute;
    left: ${PLAYER_HEIGHT}px;
    top: 0;

    width: var(--progress-width, 0px);
    height: 100%;

    background: rgba(
        ${PLAYER_PROGRESS_COLOR},
        ${PLAYER_PROGRESS_OPACITY}
    );

    pointer-events: none;
    z-index: 0;
}


/* -------------------- Play button -------------------- */

#music-play {
    position: relative;
    z-index: 1;

    width: ${PLAYER_HEIGHT}px;
    height: 100%;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-right:
        ${PLAYER_BORDER_SIZE}px solid
        ${PLAYER_BORDER_COLOR};

    box-sizing: border-box;
    cursor: pointer;

}

#music-play:hover {
    background: rgba(
        255,
        255,
        255,
        ${PLAY_BUTTON_HOVER_OPACITY}
    );
}


/* -------------------- Play triangle -------------------- */

#music-play-icon {
    width: 0;
    height: 0;

    border-top:
        ${PLAY_ICON_HEIGHT}px solid transparent;

    border-bottom:
        ${PLAY_ICON_HEIGHT}px solid transparent;

    border-left:
        ${PLAY_ICON_WIDTH}px solid ${PLAY_ICON_COLOR};

    margin-left: 3px;
}


/* -------------------- Pause icon -------------------- */

#music-play-icon.pause {
    width: ${PAUSE_ICON_WIDTH}px;
    height: ${PAUSE_BAR_HEIGHT}px;

    border: none;
    position: relative;
    margin-left: 0;
}

#music-play-icon.pause::before,
#music-play-icon.pause::after {
    content: "";

    position: absolute;
    top: 0;

    width: ${PAUSE_BAR_WIDTH}px;
    height: ${PAUSE_BAR_HEIGHT}px;

    background: ${PLAY_ICON_COLOR};
}

#music-play-icon.pause::before {
    left: 0;
}

#music-play-icon.pause::after {
    right: 0;
}


/* -------------------- Main content -------------------- */

#music-content {
    position: relative;
    z-index: 1;

    flex: 1;
    min-width: 0;
    height: 100%;

    display: flex;
    align-items: center;

    justify-content: flex-start;

    padding-left: ${TEXT_LEFT_PADDING}px;
    padding-right: ${TEXT_RIGHT_PADDING}px;

    box-sizing: border-box;
    overflow: hidden;
}


/* -------------------- Main text -------------------- */

#music-text {
    font-size: ${PLAYER_TEXT_SIZE}px;
    font-weight: ${PLAYER_TEXT_WEIGHT};

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}


/* -------------------- Right side -------------------- */

#music-right {
    position: relative;
    z-index: 1;

    height: 100%;
    min-width: ${TIME_MIN_WIDTH}px;

    padding-right: ${TIME_RIGHT_PADDING}px;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    box-sizing: border-box;
    pointer-events: none;
}


/* -------------------- Music note -------------------- */

#music-time {
    font-size: ${PLAYER_NOTE_SIZE}px;
    font-weight: ${PLAYER_TEXT_WEIGHT};

    line-height: 1;
    white-space: nowrap;
}


/* -------------------- Remaining time -------------------- */

#music-time.remaining {
    font-size: ${PLAYER_TIME_SIZE}px;
    font-weight: ${PLAYER_TIME_WEIGHT};
}

`;

document.head.appendChild(style);


// ============================================================
// ELEMENTS
// ============================================================

const playButton = document.getElementById("music-play");
const playIcon = document.getElementById("music-play-icon");
const musicText = document.getElementById("music-text");
const musicTime = document.getElementById("music-time");

let seeking = false;


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) return "0:00";

    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;

}


// ============================================================
// PLAY / PAUSE
// ============================================================

function toggleMusic() {

    audio.paused
        ? audio.play()
        : audio.pause();

}

playButton.addEventListener("click", e => {

    e.stopPropagation();
    toggleMusic();

});


// ============================================================
// PLAY / PAUSE ICON
// ============================================================

audio.addEventListener("play", () => {
    playIcon.classList.add("pause");
});

audio.addEventListener("pause", () => {
    playIcon.classList.remove("pause");
});


// ============================================================
// UPDATE PLAYER
// ============================================================

audio.addEventListener("timeupdate", () => {

    const current = audio.currentTime;
    const duration = audio.duration;

    if (!Number.isFinite(duration) || duration <= 0) return;


    // Progress rectangle width.
    const progressAreaWidth =
        player.clientWidth - PLAYER_HEIGHT;

    const progressWidth =
        progressAreaWidth *
        (current / duration);

    player.style.setProperty(
        "--progress-width",
        `${progressWidth}px`
    );


    // Elapsed time.
    if (!audio.paused) {

        musicText.textContent =
            formatTime(current);


        // Remaining time.
        musicTime.textContent =
            "-" + formatTime(
                Math.max(
                    0,
                    duration - current
                )
            );

        musicTime.classList.add("remaining");

    }

});


// ============================================================
// LOAD
// ============================================================

audio.addEventListener("loadedmetadata", () => {

    musicTime.textContent = "♪";
    musicTime.classList.remove("remaining");

});


// ============================================================
// SONG ENDED
// ============================================================

audio.addEventListener("ended", () => {

    playIcon.classList.remove("pause");

    musicText.textContent = MUSIC_NAME;

    musicTime.textContent = "♪";
    musicTime.classList.remove("remaining");

    player.style.setProperty(
        "--progress-width",
        "0px"
    );

    audio.currentTime = 0;

});


// ============================================================
// SEEK
// ============================================================

function seekFromMouse(e) {

    if (!Number.isFinite(audio.duration)) return;

    const rect = player.getBoundingClientRect();

    const x =
        e.clientX -
        rect.left -
        PLAYER_HEIGHT;

    const progressWidth =
        rect.width -
        PLAYER_HEIGHT;

    const percentage =
        Math.max(
            0,
            Math.min(
                1,
                x / progressWidth
            )
        );

    audio.currentTime =
        percentage *
        audio.duration;

}


// ============================================================
// CLICK TO SEEK
// ============================================================

player.addEventListener("click", e => {

    if (e.target.closest("#music-play")) return;

    seekFromMouse(e);

});


// ============================================================
// DRAG TO SEEK
// ============================================================

player.addEventListener("mousedown", e => {

    if (e.target.closest("#music-play")) return;

    seeking = true;
    seekFromMouse(e);

});

window.addEventListener("mousemove", e => {

    if (seeking) seekFromMouse(e);

});

window.addEventListener("mouseup", () => {

    seeking = false;

});