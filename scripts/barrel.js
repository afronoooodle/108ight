
// ============================================================
// SETTINGS — CHANGE THESE
// ============================================================

// ============================================================
// BARREL
// ============================================================

const BARREL_OPEN_X = () => canvas.width / 2;
const BARREL_CLOSED_X = 0;

const BARREL_OPEN_Y = () => canvas.height / 2;
const BARREL_SELECTED_Y = () => canvas.height / 2;

// ============================================================
// GALLERY PAGE TRANSITION
// ============================================================

const GALLERY_TRANSITION_DURATION = 1300;
const GALLERY_ROTATION_SPEED = 0.025;

function openGalleryPage() {
    if (document.body.classList.contains("gallery-opening")) return;

    window.location.href = "/108ight/gallery";
}

// ============================================================
// MASTER BARREL SIZE
// ============================================================

let RADIUS = 190;
const INSET = 1.3;
const POINTS = 9;

// ============================================================
// BARREL APPEARANCE
// ============================================================

const BARREL_OPACITY = 0.75;

const BARREL_FILL = "#222222";
const BARREL_STROKE = "#ffffff";

const BARREL_LINE_WIDTH = 3;

const BARREL_MOVE_SPEED = 0.15;

// ============================================================
// CURVED SHAPE
// ============================================================

const EDGE_CURVE = 50;

// ============================================================
// AUTOMATIC ROTATION
// ============================================================

const AUTO_ROTATION_ENABLED = true;
const AUTO_ROTATION_SPEED = 0.0015;

// ============================================================
// IMAGES
// ============================================================

const IMAGE_FOLDER = "assets/icons";
const IMAGE_PREFIX = "icon";
const IMAGE_EXTENSION = ".webp";

// ============================================================
// LABELS
// ============================================================

const LABELS = [
    "GALLERY",
    "E-SHOP",
    "PLAYLISTS",
    "ABOUT US",
    "SETTINGS",
    "INTERVIEW POLL",
    "LOGIN",
    "ZHERO",
    "LATEST MAGAZINE"
];

// ============================================================
// SUPABASE ACCOUNT STATUS
// ============================================================

const SUPABASE_URL =
    "https://zbgiyrqzrxqgasfkxdwr.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_hTPbRPuHXSc57Qpe5iU5tw_1bobphFu";

let barrelSupabaseClient = null;
let barrelUserIsLoggedIn = false;

function updateAccountLabel(session) {

    const user = session && session.user;

    barrelUserIsLoggedIn = Boolean(user);

    if (!user) {
        LABELS[6] = "LOGIN";
        return;
    }

    const username =
        user.user_metadata?.username ||
        user.user_metadata?.user_name ||
        user.user_metadata?.preferred_username;

    LABELS[6] = username || "MY ACCOUNT";
}

if (window.supabase && typeof window.supabase.createClient === "function") {

    barrelSupabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    barrelSupabaseClient.auth.onAuthStateChange(
        (_event, session) => {
            updateAccountLabel(session);
        }
    );

    barrelSupabaseClient.auth.getSession()
        .then(({ data, error }) => {

            if (error) {
                console.error("Could not check account status:", error);
                updateAccountLabel(null);
                return;
            }

            updateAccountLabel(data.session);

        })
        .catch(error => {
            console.error("Could not check account status:", error);
            updateAccountLabel(null);
        });

} else {

    console.error(
        "Supabase library was not loaded. The barrel will show LOGIN."
    );

    updateAccountLabel(null);
}

// ============================================================
// ICONS
// ============================================================

const ICON_NORMAL_SIZE = 40;
const ICON_HIGHLIGHT_SIZE = 50;

const ICON_HOVER_RADIUS = 30;

const ICON_POINT_DISTANCE = 70;

// ============================================================
// LABEL SETTINGS
// ============================================================

const LABEL_FONT = "Archivo Black";

const LABEL_NORMAL_SIZE = 12;
const LABEL_HIGHLIGHT_SIZE = 16;

const LABEL_HEIGHT = 40;

const LABEL_DISTANCE = 80;

// ============================================================
// COMPACT LABEL SETTINGS
// ============================================================

const COMPACT_LABEL_GAP = 12;

// ============================================================
// HIGHLIGHT
// ============================================================

const HIGHLIGHT_SPEED = 0.12;

// ============================================================
// DRAG
// ============================================================

const DRAG_THRESHOLD = 0.001;

// ============================================================
// MOMENTUM
// ============================================================

const FRICTION = 0.96;
const MIN_VELOCITY = 0.001;

// ============================================================
// SNAP
// ============================================================

const SNAP_SPEED = 0.15;
const SNAP_THRESHOLD = 0.0001;

// ============================================================
// WHEEL
// ============================================================

const WHEEL_SPEED = 0.001;

// ============================================================
// CENTRE MESSAGE SETTINGS
// ============================================================

const CENTRE_MESSAGE = "";
const CENTRE_MESSAGE_X = 0;
const CENTRE_MESSAGE_Y = 0;
const CENTRE_MESSAGE_FONT = "Archivo Black";
const CENTRE_MESSAGE_SIZE = 20;
const CENTRE_MESSAGE_WEIGHT = "normal";
const CENTRE_MESSAGE_LETTER_SPACING = 0;
const CENTRE_MESSAGE_COLOR = "#ffffff";
const CENTRE_MESSAGE_PULSE_ENABLED = true;
const CENTRE_MESSAGE_PULSE_COLOR = "#ff0000";
const CENTRE_MESSAGE_COLOR_PULSE_ENABLED = true;
const CENTRE_MESSAGE_PULSE_SPEED = 0.004;
const CENTRE_MESSAGE_MIN_SCALE = 0.85;
const CENTRE_MESSAGE_MAX_SCALE = 1.15;
const CENTRE_MESSAGE_OPACITY = 1;
const CENTRE_MESSAGE_ALIGN = "center";
const CENTRE_MESSAGE_BASELINE = "middle";

// ============================================================
// ORIGINAL DESIGN SIZE
// ============================================================

const BASE_RADIUS = 150;

// ============================================================
// MASTER SCALE
// ============================================================

function getBarrelScale() {
    return RADIUS / BASE_RADIUS;
}

function scale(value) {
    return value * getBarrelScale();
}

// ============================================================
// CANVAS
// ============================================================

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", () => {

    resizeCanvas();
    draw();

});

// ============================================================
// STATE
// ============================================================

let rotation = 0;
let velocity = 0;

let galleryRotationStart = null;

// ============================================================
// BARREL POSITION
// ============================================================

let barrelX = BARREL_OPEN_X();
let barrelTargetX = BARREL_OPEN_X();

let barrelCurrentY = BARREL_OPEN_Y();
let barrelTargetY = BARREL_OPEN_Y();

// ============================================================
// SELECTED
// ============================================================

let selected = false;
let selectedIndex = -1;

// ============================================================
// AUTOMATIC ROTATION STATE
// ============================================================

let autoRotationActive = AUTO_ROTATION_ENABLED;
let wasGalleryOpening = false;

// ============================================================
// MANUAL INTERACTION
// ============================================================

let manuallyControlled = false;

// ============================================================
// DRAG
// ============================================================

let dragging = false;
let dragMoved = false;
let lastMouseAngle = 0;

// ============================================================
// SNAP
// ============================================================

let snapping = false;
let snapTarget = 0;
let clickedSnap = false;

// ============================================================
// MOUSE
// ============================================================

let mouseX = 0;
let mouseY = 0;
let mouseInside = false;

// ============================================================
// HIGHLIGHT
// ============================================================

const highlightSizes = [];

// ============================================================
// CENTRE MESSAGE PULSE STATE
// ============================================================

let centrePulseTime = 0;

// ============================================================
// BARREL POSITION HELPERS
// ============================================================

function getBarrelX() {
    return barrelX;
}

function barrelY() {
    return barrelCurrentY;
}

// ============================================================
// OPEN / CLOSE
// ============================================================

function openBarrel() {

    selected = false;
    selectedIndex = -1;

    barrelTargetX = BARREL_OPEN_X();
    barrelTargetY = BARREL_OPEN_Y();

}

function closeBarrel() {

    selected = true;

    barrelTargetX = BARREL_CLOSED_X;
    barrelTargetY = BARREL_SELECTED_Y();

}

// ============================================================
// IMAGES
// ============================================================

const images = [];

let imageNumber = 1;

function loadImages() {

    const image = new Image();

    image.src =
        `${IMAGE_FOLDER}/${IMAGE_PREFIX}${imageNumber}${IMAGE_EXTENSION}`;

    image.onload = () => {

        images.push(image);

        imageNumber++;

        loadImages();

    };

    image.onerror = () => {

        console.log(`Loaded ${images.length} icons`);

        draw();

    };

}

loadImages();

// ============================================================
// HELPERS
// ============================================================

function getMouseAngle(x, y) {

    return Math.atan2(
        y - barrelY(),
        x - getBarrelX()
    );

}

function rotatePoint(x, y) {

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return {

        x:
            getBarrelX() +
            x * cos -
            y * sin,

        y:
            barrelY() +
            x * sin +
            y * cos

    };

}

function normalizeAngle(angle) {

    while (angle > Math.PI) {
        angle -= Math.PI * 2;
    }

    while (angle < -Math.PI) {
        angle += Math.PI * 2;
    }

    return angle;

}

// ============================================================
// GET ITEM GEOMETRY
// ============================================================

function getItem(index) {

    const step = Math.PI * 2 / POINTS;

    const angle = -Math.PI / 2 + index * step;

    const iconRadius =
        (
            BASE_RADIUS * INSET -
            ICON_POINT_DISTANCE
        ) *
        getBarrelScale();

    return {

        angle,

        iconX:
            Math.cos(angle) *
            iconRadius,

        iconY:
            Math.sin(angle) *
            iconRadius,

        iconRadius

    };

}

// ============================================================
// NORMAL LABEL POSITION — OUTSIDE BARREL
// ============================================================

function getLabelPosition(item, width) {

    const angle = item.angle;

    const distance =
        item.iconRadius +
        scale(LABEL_DISTANCE) +
        width / 2;

    return rotatePoint(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance
    );

}

// ============================================================
// COMPACT LABEL POSITION — LEFT OF ICON
// ============================================================

function getCompactLabelPosition(icon, width) {

    const gap = scale(COMPACT_LABEL_GAP);

    return {

        x:
            icon.x -
            scale(ICON_HIGHLIGHT_SIZE) / 2 -
            gap -
            width / 2,

        y: icon.y

    };

}

// ============================================================
// INWARD LABEL POSITION — INSIDE BARREL
// ============================================================

function getInsideBarrelLabelPosition(item, width) {

    const angle = item.angle;

    const distance =
        item.iconRadius -
        scale(ICON_HIGHLIGHT_SIZE) / 2 -
        scale(COMPACT_LABEL_GAP) -
        width / 2;

    return rotatePoint(
        Math.cos(angle) * Math.max(0, distance),
        Math.sin(angle) * Math.max(0, distance)
    );

}

// ============================================================
// CHECK WHETHER ALL NORMAL LABELS FIT ON SCREEN
// ============================================================

function shouldHideUnselectedLabels() {

    for (let i = 0; i < POINTS; i++) {

        const item = getItem(i);
        const label = LABELS[i % LABELS.length];

        ctx.font =
            `${scale(LABEL_NORMAL_SIZE)}px "${LABEL_FONT}"`;

        const width = ctx.measureText(label).width;

        const position =
            getLabelPosition(item, width);

        const fits =
            position.x - width / 2 >= 0 &&
            position.x + width / 2 <= canvas.width &&
            position.y - scale(LABEL_HEIGHT) / 2 >= 0 &&
            position.y + scale(LABEL_HEIGHT) / 2 <= canvas.height;

        if (!fits) {
            return true;
        }

    }

    return false;

}

// ============================================================
// ROTATE SELECTED ITEM TO RIGHT MIDDLE
// ============================================================

function rotateItemToCentre(index) {

    const step = Math.PI * 2 / POINTS;

    const itemAngle =
        -Math.PI / 2 +
        index * step;

    const targetAngle = 0;

    const requiredRotation =
        targetAngle -
        itemAngle;

    const difference =
        normalizeAngle(
            requiredRotation -
            rotation
        );

    snapTarget =
        rotation +
        difference;

    snapping = true;
    clickedSnap = true;
    velocity = 0;

}

// ============================================================
// FIND HOVERED ITEM
// ============================================================

function getHoveredItem() {

    if (!mouseInside) {
        return -1;
    }

    const compactLabels =
        !selected &&
        shouldHideUnselectedLabels();

    for (let i = 0; i < POINTS; i++) {

        const item = getItem(i);

        const icon = rotatePoint(
            item.iconX,
            item.iconY
        );

        const iconDistance = Math.hypot(
            mouseX - icon.x,
            mouseY - icon.y
        );

        if (iconDistance <= scale(ICON_HOVER_RADIUS)) {
            return i;
        }

        if (compactLabels) {
            continue;
        }

        const label = LABELS[i % LABELS.length];

        ctx.font =
            `${scale(LABEL_NORMAL_SIZE)}px "${LABEL_FONT}"`;

        const labelWidth =
            ctx.measureText(label).width;

        const labelPosition =
            getLabelPosition(item, labelWidth);

        if (

            mouseX >= labelPosition.x - labelWidth / 2 &&
            mouseX <= labelPosition.x + labelWidth / 2 &&
            mouseY >= labelPosition.y - scale(LABEL_HEIGHT) / 2 &&
            mouseY <= labelPosition.y + scale(LABEL_HEIGHT) / 2

        ) {

            return i;

        }

    }

    return -1;

}

// ============================================================
// GET BARREL SPIKES
// ============================================================

function getBarrelPoints() {

    const points = [];

    const spikeRadius = RADIUS * INSET;

    for (let i = 0; i < POINTS; i++) {

        const angle =
            -Math.PI / 2 +
            rotation +
            i * (Math.PI * 2 / POINTS);

        points.push({

            x: Math.cos(angle) * spikeRadius,
            y: Math.sin(angle) * spikeRadius

        });

    }

    return points;

}

// ============================================================
// DRAW BARREL — UNIFORM AUTHENTICATION SCALING
// ============================================================

function drawBarrel() {

    const points = getBarrelPoints();

    // Always use one uniform scale value.
    // This keeps the barrel's proportions intact.

    const authScale =
        window.__108IGHT_AUTH_ACTIVE &&
        Number.isFinite(Number(window.__108IGHT_AUTH_SCALE))
            ? Math.max(0.01, Number(window.__108IGHT_AUTH_SCALE))
            : 1;

    const centreX = getBarrelX();
    const centreY = barrelY();

    ctx.save();

    ctx.translate(
        centreX,
        centreY
    );

    // Apply the authentication enlargement directly
    // to every coordinate, rather than distorting
    // the canvas drawing context.

    ctx.beginPath();

    for (let i = 0; i < POINTS; i++) {

        const current = points[i];
        const next = points[(i + 1) % POINTS];

        const dx = next.x - current.x;
        const dy = next.y - current.y;

        const length = Math.sqrt(dx * dx + dy * dy);

        const dirX = dx / length;
        const dirY = dy / length;

        const normalX = -dirY;
        const normalY = dirX;

        const controlDistance = length * 0.30;

        const control1 = {

            x: current.x + dirX * controlDistance,
            y: current.y + dirY * controlDistance

        };

        const control2 = {

            x: next.x - dirX * controlDistance,
            y: next.y - dirY * controlDistance

        };

        control1.x += normalX * scale(EDGE_CURVE);
        control1.y += normalY * scale(EDGE_CURVE);

        control2.x += normalX * scale(EDGE_CURVE);
        control2.y += normalY * scale(EDGE_CURVE);

        // Uniformly scale all points and control points.

        const currentX = current.x * authScale;
        const currentY = current.y * authScale;

        const control1X = control1.x * authScale;
        const control1Y = control1.y * authScale;

        const control2X = control2.x * authScale;
        const control2Y = control2.y * authScale;

        const nextX = next.x * authScale;
        const nextY = next.y * authScale;

        if (i === 0) {
            ctx.moveTo(currentX, currentY);
        }

        ctx.bezierCurveTo(
            control1X,
            control1Y,
            control2X,
            control2Y,
            nextX,
            nextY
        );

    }

    ctx.closePath();

    ctx.globalAlpha = window.__108IGHT_AUTH_ACTIVE
        ? window.__108IGHT_AUTH_OPACITY
        : BARREL_OPACITY;

    ctx.fillStyle = BARREL_FILL;
    ctx.strokeStyle = BARREL_STROKE;

    ctx.lineWidth =
        scale(BARREL_LINE_WIDTH) * authScale;

    ctx.fill();
    ctx.stroke();

    ctx.restore();

}

// ============================================================
// DRAW ICON
// ============================================================

function drawIcon(image, x, y, size) {

    if (!image) {
        return;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.save();

    ctx.translate(x, y);

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        size / 2,
        0,
        Math.PI * 2
    );

    ctx.clip();

    ctx.drawImage(
        image,
        -size / 2,
        -size / 2,
        size,
        size
    );

    ctx.restore();

}

// ============================================================
// DRAW LABEL
// ============================================================

function drawLabel(text, x, y, size, highlighted) {

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.save();

    ctx.fillStyle = "white";

    ctx.font =
        highlighted
            ? `bold ${size}px "${LABEL_FONT}"`
            : `${size}px "${LABEL_FONT}"`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, x, y);

    ctx.restore();

}

// ============================================================
// COLOUR INTERPOLATION
// ============================================================

function interpolateColour(colour1, colour2, amount) {

    const c1 = colour1.replace("#", "");
    const c2 = colour2.replace("#", "");

    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);

    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * amount);
    const g = Math.round(g1 + (g2 - g1) * amount);
    const b = Math.round(b1 + (b2 - b1) * amount);

    return `rgb(${r}, ${g}, ${b})`;

}

// ============================================================
// DRAW CENTRE MESSAGE
// ============================================================

function drawCentreMessage() {

    if (!CENTRE_MESSAGE || CENTRE_MESSAGE.length === 0) {
        return;
    }

    let pulseScale = 1;
    let colour = CENTRE_MESSAGE_COLOR;

    if (CENTRE_MESSAGE_PULSE_ENABLED) {

        const wave =
            (
                Math.sin(
                    centrePulseTime *
                    CENTRE_MESSAGE_PULSE_SPEED
                ) + 1
            ) / 2;

        pulseScale =
            CENTRE_MESSAGE_MIN_SCALE +
            (
                CENTRE_MESSAGE_MAX_SCALE -
                CENTRE_MESSAGE_MIN_SCALE
            ) *
            wave;

        if (CENTRE_MESSAGE_COLOR_PULSE_ENABLED) {

            colour = interpolateColour(
                CENTRE_MESSAGE_COLOR,
                CENTRE_MESSAGE_PULSE_COLOR,
                wave
            );

        }

    }

    const finalSize =
        scale(CENTRE_MESSAGE_SIZE) *
        pulseScale;

    const x =
        getBarrelX() +
        scale(CENTRE_MESSAGE_X);

    const y =
        barrelY() +
        scale(CENTRE_MESSAGE_Y);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.save();

    ctx.globalAlpha = CENTRE_MESSAGE_OPACITY;
    ctx.fillStyle = colour;

    ctx.font =
        `${CENTRE_MESSAGE_WEIGHT} ${finalSize}px "${CENTRE_MESSAGE_FONT}"`;

    ctx.textAlign = CENTRE_MESSAGE_ALIGN;
    ctx.textBaseline = CENTRE_MESSAGE_BASELINE;

    if (CENTRE_MESSAGE_LETTER_SPACING === 0) {

        const lines = CENTRE_MESSAGE.split("\n");
        const lineHeight = finalSize * 1.2;

        lines.forEach((line, index) => {

            ctx.fillText(
                line,
                x,
                y + (
                    index -
                    (lines.length - 1) / 2
                ) * lineHeight
            );

        });

    } else {

        drawSpacedText(
            CENTRE_MESSAGE,
            x,
            y,
            CENTRE_MESSAGE_LETTER_SPACING *
            getBarrelScale()
        );

    }

    ctx.restore();

}

// ============================================================
// DRAW SPACED TEXT
// ============================================================

function drawSpacedText(text, x, y, spacing) {

    let totalWidth = 0;
    const widths = [];

    for (let i = 0; i < text.length; i++) {

        const width = ctx.measureText(text[i]).width;

        widths.push(width);
        totalWidth += width;

    }

    totalWidth += spacing * (text.length - 1);

    let currentX = x - totalWidth / 2;

    for (let i = 0; i < text.length; i++) {

        ctx.textAlign = "left";

        ctx.fillText(
            text[i],
            currentX,
            y
        );

        currentX += widths[i] + spacing;

    }

}

// ============================================================
// DRAW ICONS + LABELS
// ============================================================

function drawItems() {

    const hoveredIndex = getHoveredItem();
    const centreY = barrelY();

    const compactLabels =
        !selected &&
        shouldHideUnselectedLabels();

    for (let i = 0; i < POINTS; i++) {

        const item = getItem(i);

        const icon = rotatePoint(
            item.iconX,
            item.iconY
        );

        const rightSide =
            icon.x > getBarrelX();

        const atCentre =
            Math.abs(icon.y - centreY) <=
            scale(ICON_HOVER_RADIUS);

        const centreHighlighted =
            rightSide && atCentre;

        const highlighted =
            i === hoveredIndex ||
            centreHighlighted;

        // ====================================================
        // ICON SIZE ANIMATION
        // ====================================================

        const targetSize =
            highlighted
                ? scale(ICON_HIGHLIGHT_SIZE)
                : scale(ICON_NORMAL_SIZE);

        if (highlightSizes[i] === undefined) {

            highlightSizes[i] =
                scale(ICON_NORMAL_SIZE);

        }

        const difference =
            targetSize - highlightSizes[i];

        highlightSizes[i] +=
            difference * HIGHLIGHT_SPEED;

        if (Math.abs(difference) < 0.05) {
            highlightSizes[i] = targetSize;
        }

        const iconSize = highlightSizes[i];

        // ====================================================
        // DRAW ICON
        // ====================================================

        const image =
            images.length
                ? images[i % images.length]
                : null;

        drawIcon(
            image,
            icon.x,
            icon.y,
            iconSize
        );

        // ====================================================
        // LABEL VISIBILITY
        // ====================================================

        if (compactLabels && !highlighted) {
            continue;
        }

        // ====================================================
        // LABEL SIZE
        // ====================================================

        const label = LABELS[i % LABELS.length];

        const normalIconSize =
            scale(ICON_NORMAL_SIZE);

        const highlightIconSize =
            scale(ICON_HIGHLIGHT_SIZE);

        const labelSize =
            scale(LABEL_NORMAL_SIZE) +
            (
                (
                    iconSize - normalIconSize
                ) /
                (
                    highlightIconSize - normalIconSize
                )
            ) *
            (
                scale(LABEL_HIGHLIGHT_SIZE) -
                scale(LABEL_NORMAL_SIZE)
            );

        ctx.font =
            highlighted
                ? `bold ${labelSize}px "${LABEL_FONT}"`
                : `${labelSize}px "${LABEL_FONT}"`;

        const labelWidth =
            ctx.measureText(label).width;

        // ====================================================
        // CHOOSE LABEL POSITION
        // ====================================================

        let labelPosition;

        if (compactLabels) {

            if (i === hoveredIndex && !centreHighlighted) {

                labelPosition =
                    getInsideBarrelLabelPosition(
                        item,
                        labelWidth
                    );

            } else {

                labelPosition =
                    getCompactLabelPosition(
                        icon,
                        labelWidth
                    );

            }

        } else {

            labelPosition =
                getLabelPosition(
                    item,
                    labelWidth
                );

        }

        // ====================================================
        // CHECK LABEL FITS INSIDE WINDOW
        // ====================================================

        const fitsInsideWindow =
            labelPosition.x - labelWidth / 2 >= 0 &&
            labelPosition.x + labelWidth / 2 <= canvas.width &&
            labelPosition.y - labelSize / 2 >= 0 &&
            labelPosition.y + labelSize / 2 <= canvas.height;

        if (!fitsInsideWindow) {
            continue;
        }

        // ====================================================
        // DRAW LABEL
        // ====================================================

        drawLabel(
            label,
            labelPosition.x,
            labelPosition.y,
            labelSize,
            highlighted
        );

    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

}

// ============================================================
// DRAW EVERYTHING
// ============================================================

function draw() {

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBarrel();
    drawItems();
    drawCentreMessage();

}

// ============================================================
// MOUSE DOWN
// ============================================================

canvas.addEventListener("mousedown", e => {

    const rect = canvas.getBoundingClientRect();

    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    mouseInside = true;

    if (selected) {

        const clickedIndex = getHoveredItem();

        if (clickedIndex !== -1) {

            dragging = false;
            dragMoved = false;

            return;

        }

    }

    const distance = Math.hypot(
        mouseX - getBarrelX(),
        mouseY - barrelY()
    );

    if (distance > RADIUS * INSET) {
        return;
    }

    manuallyControlled = true;
    autoRotationActive = false;

    dragging = true;
    dragMoved = false;

    snapping = false;
    clickedSnap = false;
    velocity = 0;

    lastMouseAngle =
        getMouseAngle(mouseX, mouseY);

});

// ============================================================
// MOUSE MOVE
// ============================================================

canvas.addEventListener("mousemove", e => {

    const rect = canvas.getBoundingClientRect();

    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    mouseInside = true;

    if (!dragging) {
        return;
    }

    const currentAngle =
        getMouseAngle(mouseX, mouseY);

    const difference =
        normalizeAngle(
            currentAngle - lastMouseAngle
        );

    rotation += difference;
    velocity = difference;

    lastMouseAngle = currentAngle;

    if (Math.abs(difference) > DRAG_THRESHOLD) {
        dragMoved = true;
    }

});

// ============================================================
// MOUSE UP
// ============================================================

function stopDragging() {
    dragging = false;
}

canvas.addEventListener("mouseup", stopDragging);
window.addEventListener("mouseup", stopDragging);

// ============================================================
// MOUSE LEAVE
// ============================================================

canvas.addEventListener("mouseleave", () => {
    mouseInside = false;
});

// ============================================================
// CLICK
// ============================================================

canvas.addEventListener("click", e => {

    if (dragMoved) {

        dragMoved = false;
        return;

    }

    const rect = canvas.getBoundingClientRect();

    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    mouseInside = true;

    const index = getHoveredItem();

    if (index !== -1) {

        // ====================================================
        // GALLERY
        // ====================================================

        if (LABELS[index] === "GALLERY") {

            openGalleryPage();
            return;

        }

        // ====================================================
        // NORMAL BARREL SELECTION
        // ====================================================

        selectedIndex = index;
        selected = true;

        barrelTargetX = BARREL_CLOSED_X;
        barrelTargetY = BARREL_SELECTED_Y();

        manuallyControlled = false;
        autoRotationActive = false;

        dragging = false;
        snapping = false;
        clickedSnap = false;
        velocity = 0;

        rotateItemToCentre(index);

        // ====================================================
        // ACCOUNT
        // ====================================================

        if (index === 6) {

            window.location.href =
                barrelUserIsLoggedIn
                    ? "account.html"
                    : "login.html";

            return;

        }

        return;

    }

    // ========================================================
    // CLICKED OFF WHILE SELECTED
    // ========================================================

    if (selected) {

        selected = false;
        selectedIndex = -1;

        barrelTargetX = BARREL_OPEN_X();
        barrelTargetY = BARREL_OPEN_Y();

        snapping = false;
        clickedSnap = false;
        velocity = 0;

        manuallyControlled = false;
        autoRotationActive = AUTO_ROTATION_ENABLED;

        return;

    }

    // ========================================================
    // CLICKED OFF WHILE OPEN
    // ========================================================

    openBarrel();

});

// ============================================================
// WHEEL
// ============================================================

canvas.addEventListener("wheel", e => {

    e.preventDefault();

    manuallyControlled = true;
    autoRotationActive = false;

    snapping = false;
    clickedSnap = false;
    velocity = 0;

    rotation -=
        e.deltaY * WHEEL_SPEED;

}, {
    passive: false
});

// ============================================================
// ANIMATION
// ============================================================

let lastTime = performance.now();

function animate(time) {

    const deltaTime =
        (time - lastTime) / 16.6667;

    lastTime = time;

    // ========================================================
    // CENTRE MESSAGE PULSE
    // ========================================================

    if (CENTRE_MESSAGE_PULSE_ENABLED) {

        centrePulseTime +=
            deltaTime * 16.6667;

    }

    // ========================================================
    // GALLERY OPENING CHECK
    // ========================================================

    const galleryOpening =
        document.body.classList.contains("gallery-opening");

    const galleryReturning =
        document.body.classList.contains("gallery-returning");

    // ========================================================
    // RESTORE NORMAL ROTATION WHEN RETURNING HOME
    // ========================================================

    if (
        galleryReturning ||
        (wasGalleryOpening && !galleryOpening)
    ) {
        selected = false;
        selectedIndex = -1;

        dragging = false;
        snapping = false;
        manuallyControlled = false;
        clickedSnap = false;

        velocity = 0;

        autoRotationActive = AUTO_ROTATION_ENABLED;
    }

    wasGalleryOpening = galleryOpening;

    // ========================================================
    // BARREL X MOVEMENT
    // ========================================================

    const targetX =
        barrelTargetX === BARREL_CLOSED_X
            ? BARREL_CLOSED_X
            : BARREL_OPEN_X();

    barrelX +=
        (targetX - barrelX) *
        BARREL_MOVE_SPEED;

    // ========================================================
    // BARREL Y MOVEMENT
    // ========================================================

    barrelCurrentY +=
        (barrelTargetY - barrelCurrentY) *
        BARREL_MOVE_SPEED;

    // ========================================================
    // AUTOMATIC ROTATION
    // ========================================================

    if (galleryOpening) {

        selected = false;
        dragging = false;
        snapping = false;
        manuallyControlled = false;
        clickedSnap = false;
        velocity = 0;

        if (galleryRotationStart === null) {
            galleryRotationStart = time;
        }

        const progress = Math.min(
            (time - galleryRotationStart) / 450,
            1
        );

        const easedProgress =
            progress * progress * (3 - 2 * progress);

        const currentSpeed =
            AUTO_ROTATION_SPEED +
            (GALLERY_ROTATION_SPEED - AUTO_ROTATION_SPEED) *
            easedProgress;

        rotation += currentSpeed * deltaTime;

    } else if (
        !selected &&
        !dragging &&
        !snapping &&
        autoRotationActive &&
        AUTO_ROTATION_ENABLED
    ) {
        galleryRotationStart = null;

        rotation +=
            AUTO_ROTATION_SPEED *
            deltaTime;

    }

    // ========================================================
    // MOMENTUM
    // ========================================================

    if (
        !galleryOpening &&
        manuallyControlled &&
        !dragging &&
        !snapping
    ) {

        rotation +=
            velocity *
            deltaTime;

        velocity *=
            Math.pow(
                FRICTION,
                deltaTime
            );

        if (Math.abs(velocity) < MIN_VELOCITY) {

            velocity = 0;

            if (!clickedSnap) {

                const step =
                    Math.PI * 2 / POINTS;

                let nearestIndex = 0;
                let smallestDifference = Infinity;

                for (let i = 0; i < POINTS; i++) {

                    const itemAngle =
                        -Math.PI / 2 +
                        i * step;

                    const requiredRotation =
                        -itemAngle;

                    const difference =
                        Math.abs(
                            normalizeAngle(
                                requiredRotation -
                                rotation
                            )
                        );

                    if (difference < smallestDifference) {

                        smallestDifference = difference;
                        nearestIndex = i;

                    }

                }

                const nearestItemAngle =
                    -Math.PI / 2 +
                    nearestIndex * step;

                snapTarget = -nearestItemAngle;

                snapping = true;

            }

        }

    }

    // ========================================================
    // SNAP
    // ========================================================

    if (
        !galleryOpening &&
        !dragging &&
        snapping
    ) {

        const difference =
            normalizeAngle(
                snapTarget - rotation
            );

        rotation +=
            difference * SNAP_SPEED;

        if (Math.abs(difference) < SNAP_THRESHOLD) {

            rotation = snapTarget;
            snapping = false;

        }

    }

    // ========================================================
    // DRAW
    // ========================================================

    draw();

    requestAnimationFrame(animate);

}

// Start the barrel animation.
requestAnimationFrame(animate);
