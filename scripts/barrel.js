// ============================================================
// SETTINGS — CHANGE THESE
// ============================================================

// ---------- Barrel ----------
const BARREL_OPEN_X = () => canvas.width / 2;
const BARREL_CLOSED_X = 0;
const BARREL_Y = () => canvas.height / 2;

const RADIUS = 200;
const INSET = 1.3;
const POINTS = 9;

const BARREL_FILL = "#222222";
const BARREL_STROKE = "#ffffff";
const BARREL_LINE_WIDTH = 15;

const BARREL_MOVE_SPEED = 0.15;


// ---------- Images ----------
const IMAGE_FOLDER = "mag_icons";
const IMAGE_PREFIX = "icon";
const IMAGE_EXTENSION = ".webp";


// ---------- Labels ----------
const LABELS = [
    "Gallery",
    "E-Shop",
    "Playlists",
    "About Us",
    "Settings"
];


// ---------- Icons ----------
const ICON_NORMAL_SIZE = 50;
const ICON_HIGHLIGHT_SIZE = 70;
const ICON_HOVER_RADIUS = 50;


// ---------- Labels ----------
const LABEL_FONT = "Mozilla Headline";
const LABEL_NORMAL_SIZE = 16;
const LABEL_HIGHLIGHT_SIZE = 32;
const LABEL_HEIGHT = 40;
const LABEL_DISTANCE = 80;


// ---------- Highlight ----------
const HIGHLIGHT_SPEED = 0.18;


// ---------- Drag ----------
const DRAG_THRESHOLD = 0.001;


// ---------- Momentum ----------
const FRICTION = 0.96;
const MIN_VELOCITY = 0.001;


// ---------- Snap ----------
const SNAP_SPEED = 0.15;
const SNAP_THRESHOLD = 0.0001;


// ---------- Wheel ----------
const WHEEL_SPEED = 0.001;


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("canvas1");

const ctx =
    canvas.getContext("2d");


function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}


resizeCanvas();


window.addEventListener(
    "resize",
    () => {
        resizeCanvas();
        draw();
    }
);


// ============================================================
// STATE
// ============================================================

let rotation = 0;
let velocity = 0;


// ---------- Barrel position ----------

let barrelX =
    BARREL_OPEN_X();

let barrelTargetX =
    BARREL_OPEN_X();


// ---------- Drag ----------

let dragging = false;
let dragMoved = false;
let lastMouseAngle = 0;


// ---------- Snap ----------

let snapping = false;
let snapTarget = 0;
let clickedSnap = false;


// ---------- Mouse ----------

let mouseX = 0;
let mouseY = 0;
let mouseInside = false;


// ---------- Highlight ----------

const highlightSizes = [];


// ============================================================
// BARREL POSITION
// ============================================================

function getBarrelX() {
    return barrelX;
}


function barrelY() {
    return BARREL_Y();
}


// ============================================================
// OPEN / CLOSE BARREL
// ============================================================

function openBarrel() {

    barrelTargetX =
        BARREL_OPEN_X();
}


function closeBarrel() {

    barrelTargetX =
        BARREL_CLOSED_X;
}


// ============================================================
// IMAGES
// ============================================================

const images = [];
let imageNumber = 1;


function loadImages() {

    const image =
        new Image();

    image.src =
        `${IMAGE_FOLDER}/${IMAGE_PREFIX}${imageNumber}${IMAGE_EXTENSION}`;


    image.onload = () => {

        images.push(image);

        imageNumber++;

        loadImages();
    };


    image.onerror = () => {

        console.log(
            `Loaded ${images.length} icons`
        );

        draw();
    };
}


loadImages();


// ============================================================
// HELPERS
// ============================================================

// Get the angle of the mouse around the barrel

function getMouseAngle(x, y) {

    return Math.atan2(
        y - barrelY(),
        x - getBarrelX()
    );
}


// Rotate a point around the barrel

function rotatePoint(x, y) {

    const cos =
        Math.cos(rotation);

    const sin =
        Math.sin(rotation);

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


// Keep an angle difference between -PI and PI

function normalizeAngle(angle) {

    if (angle > Math.PI) {
        angle -= Math.PI * 2;
    }

    if (angle < -Math.PI) {
        angle += Math.PI * 2;
    }

    return angle;
}


// ============================================================
// GET ITEM GEOMETRY
// ============================================================

function getItem(index) {

    const step =
        Math.PI * 2 / POINTS;


    const angle1 =
        -Math.PI / 2 +
        index * step;


    const angle2 =
        angle1 + step;


    const x1 =
        Math.cos(angle1) *
        RADIUS;

    const y1 =
        Math.sin(angle1) *
        RADIUS;


    const x2 =
        Math.cos(angle2) *
        RADIUS;

    const y2 =
        Math.sin(angle2) *
        RADIUS;


    return {

        angle1,
        angle2,

        iconX:
            (x1 + x2) / 2,

        iconY:
            (y1 + y2) / 2
    };
}


// ============================================================
// LABEL POSITION
// ============================================================

function getLabelPosition(
    item,
    width
) {

    const angle =
        (item.angle1 +
         item.angle2) / 2;


    const distance =
        RADIUS +
        LABEL_DISTANCE +
        width / 2;


    return rotatePoint(

        Math.cos(angle) *
        distance,

        Math.sin(angle) *
        distance
    );
}


// ============================================================
// CLICK ITEM → CENTRE
// ============================================================

function rotateItemToCentre(index) {

    const step =
        Math.PI * 2 / POINTS;


    const itemAngle =
        -Math.PI / 2 +
        index * step +
        step / 2;


    snapTarget =
        -itemAngle;


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


    for (
        let i = 0;
        i < POINTS;
        i++
    ) {

        const item =
            getItem(i);


        // -------------------------
        // ICON
        // -------------------------

        const icon =
            rotatePoint(
                item.iconX,
                item.iconY
            );


        const iconDistance =
            Math.hypot(
                mouseX - icon.x,
                mouseY - icon.y
            );


        if (
            iconDistance <=
            ICON_HOVER_RADIUS
        ) {
            return i;
        }


        // -------------------------
        // LABEL
        // -------------------------

        const label =
            LABELS[
                i % LABELS.length
            ];


        ctx.font =
            `${LABEL_NORMAL_SIZE}px "${LABEL_FONT}"`;


        const labelWidth =
            ctx.measureText(
                label
            ).width;


        const labelPosition =
            getLabelPosition(
                item,
                labelWidth
            );


        if (

            mouseX >=
                labelPosition.x -
                labelWidth / 2 &&

            mouseX <=
                labelPosition.x +
                labelWidth / 2 &&

            mouseY >=
                labelPosition.y -
                LABEL_HEIGHT / 2 &&

            mouseY <=
                labelPosition.y +
                LABEL_HEIGHT / 2

        ) {

            return i;
        }
    }


    return -1;
}


// ============================================================
// DRAW BARREL
// ============================================================

function drawBarrel() {

    const y =
        barrelY();


    ctx.save();


    ctx.translate(
        getBarrelX(),
        y
    );


    ctx.rotate(rotation);


    ctx.beginPath();


    ctx.moveTo(
        0,
        -RADIUS
    );


    for (
        let i = 0;
        i < POINTS;
        i++
    ) {

        ctx.rotate(
            Math.PI / POINTS
        );


        ctx.lineTo(
            0,
            -(RADIUS * INSET)
        );


        ctx.rotate(
            Math.PI / POINTS
        );


        ctx.lineTo(
            0,
            -RADIUS
        );
    }


    ctx.closePath();


    ctx.fillStyle =
        BARREL_FILL;

    ctx.strokeStyle =
        BARREL_STROKE;

    ctx.lineWidth =
        BARREL_LINE_WIDTH;


    ctx.fill();

    ctx.stroke();


    ctx.restore();
}


// ============================================================
// DRAW ICON
// ============================================================

function drawIcon(
    image,
    x,
    y,
    size
) {

    if (!image) {
        return;
    }


    ctx.setTransform(
        1, 0,
        0, 1,
        0, 0
    );


    ctx.save();


    ctx.translate(
        x,
        y
    );


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

function drawLabel(
    text,
    x,
    y,
    size,
    highlighted
) {

    ctx.setTransform(
        1, 0,
        0, 1,
        0, 0
    );


    ctx.save();


    ctx.fillStyle =
        "white";


    ctx.font =
        highlighted
            ? `bold ${size}px "${LABEL_FONT}"`
            : `${size}px "${LABEL_FONT}"`;


    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        text,
        x,
        y
    );


    ctx.restore();
}


// ============================================================
// DRAW ICONS + LABELS
// ============================================================

function drawItems() {

    const hoveredIndex =
        getHoveredItem();


    const centreY =
        barrelY();


    for (
        let i = 0;
        i < POINTS;
        i++
    ) {

        const item =
            getItem(i);


        // -------------------------
        // POSITION
        // -------------------------

        const icon =
            rotatePoint(
                item.iconX,
                item.iconY
            );


        // -------------------------
        // HIGHLIGHT
        // -------------------------

        const atCentre =
            Math.abs(
                icon.y -
                centreY
            ) <=
            ICON_HOVER_RADIUS;


        const highlighted =
            i === hoveredIndex ||
            (
                hoveredIndex === -1 &&
                atCentre
            );


        const targetSize =
            highlighted
                ? ICON_HIGHLIGHT_SIZE
                : ICON_NORMAL_SIZE;


        if (
            highlightSizes[i] ===
            undefined
        ) {

            highlightSizes[i] =
                ICON_NORMAL_SIZE;
        }


        highlightSizes[i] +=
            (
                targetSize -
                highlightSizes[i]
            ) *
            HIGHLIGHT_SPEED;


        const iconSize =
            highlightSizes[i];


        // -------------------------
        // ICON
        // -------------------------

        const image =
            images.length
                ? images[
                    i % images.length
                ]
                : null;


        drawIcon(
            image,
            icon.x,
            icon.y,
            iconSize
        );


        // -------------------------
        // LABEL
        // -------------------------

        const label =
            LABELS[
                i % LABELS.length
            ];


        ctx.font =
            highlighted
                ? `bold ${LABEL_HIGHLIGHT_SIZE}px "${LABEL_FONT}"`
                : `${LABEL_NORMAL_SIZE}px "${LABEL_FONT}"`;


        const labelWidth =
            ctx.measureText(
                label
            ).width;


        const labelPosition =
            getLabelPosition(
                item,
                labelWidth
            );


        // Smooth label size

        const labelSize =
            LABEL_NORMAL_SIZE +

            (
                (
                    iconSize -
                    ICON_NORMAL_SIZE
                ) /
                (
                    ICON_HIGHLIGHT_SIZE -
                    ICON_NORMAL_SIZE
                )
            ) *

            (
                LABEL_HIGHLIGHT_SIZE -
                LABEL_NORMAL_SIZE
            );


        drawLabel(
            label,
            labelPosition.x,
            labelPosition.y,
            labelSize,
            highlighted
        );
    }


    ctx.setTransform(
        1, 0,
        0, 1,
        0, 0
    );
}


// ============================================================
// DRAW EVERYTHING
// ============================================================

function draw() {

    ctx.setTransform(
        1, 0,
        0, 1,
        0, 0
    );


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawBarrel();

    drawItems();
}


// ============================================================
// MOUSE DOWN
// ============================================================

canvas.addEventListener(
    "mousedown",
    e => {

        const rect =
            canvas.getBoundingClientRect();


        mouseX =
            e.clientX -
            rect.left;


        mouseY =
            e.clientY -
            rect.top;


        mouseInside = true;


        // Only allow rotation when
        // the mouse is within the
        // barrel's outer radius.

        const distance =
            Math.hypot(
                mouseX -
                getBarrelX(),

                mouseY -
                barrelY()
            );


        if (
            distance >
            RADIUS * INSET
        ) {
            return;
        }


        dragging = true;

        dragMoved = false;


        snapping = false;

        clickedSnap = false;

        velocity = 0;


        lastMouseAngle =
            getMouseAngle(
                mouseX,
                mouseY
            );
    }
);


// ============================================================
// MOUSE MOVE
// ============================================================

canvas.addEventListener(
    "mousemove",
    e => {

        const rect =
            canvas.getBoundingClientRect();


        mouseX =
            e.clientX -
            rect.left;


        mouseY =
            e.clientY -
            rect.top;


        mouseInside = true;


        if (!dragging) {
            return;
        }


        const currentAngle =
            getMouseAngle(
                mouseX,
                mouseY
            );


        const difference =
            normalizeAngle(
                currentAngle -
                lastMouseAngle
            );


        rotation +=
            difference;


        velocity =
            difference;


        lastMouseAngle =
            currentAngle;


        if (
            Math.abs(
                difference
            ) >
            DRAG_THRESHOLD
        ) {

            dragMoved = true;
        }
    }
);


// ============================================================
// MOUSE UP
// ============================================================

function stopDragging() {

    dragging = false;
}


canvas.addEventListener(
    "mouseup",
    stopDragging
);


window.addEventListener(
    "mouseup",
    stopDragging
);


// ============================================================
// MOUSE LEAVE
// ============================================================

canvas.addEventListener(
    "mouseleave",
    () => {

        mouseInside = false;

        // Don't stop dragging here.
        // The window-level mouseup
        // handles it.
    }
);


// ============================================================
// CLICK
// ============================================================

canvas.addEventListener(
    "click",
    e => {

        // A drag should never
        // count as a click.

        if (dragMoved) {

            dragMoved = false;

            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        mouseX =
            e.clientX -
            rect.left;


        mouseY =
            e.clientY -
            rect.top;


        mouseInside = true;


        const index =
            getHoveredItem();


        if (index !== -1) {

            // Move barrel to x = 0
            closeBarrel();

            // Rotate clicked item
            // to the centre.

            rotateItemToCentre(
                index
            );

        } else {

            // Clicking away from
            // an item opens barrel.

            openBarrel();
        }
    }
);


// ============================================================
// WHEEL
// ============================================================

canvas.addEventListener(
    "wheel",
    e => {

        e.preventDefault();


        snapping = false;

        clickedSnap = false;

        velocity = 0;


        rotation +=
            e.deltaY *
            WHEEL_SPEED;

    },
    {
        passive: false
    }
);


// ============================================================
// ANIMATION
// ============================================================

let lastTime =
    performance.now();


function animate(time) {

    const deltaTime =
        (time - lastTime) /
        16.6667;


    lastTime =
        time;


    // -------------------------
    // BARREL MOVEMENT
    // -------------------------

    const targetX =
        barrelTargetX ===
        BARREL_CLOSED_X

            ? BARREL_CLOSED_X

            : BARREL_OPEN_X();


    barrelX +=
        (
            targetX -
            barrelX
        ) *
        BARREL_MOVE_SPEED;


    // -------------------------
    // MOMENTUM
    // -------------------------

    if (
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


        if (
            Math.abs(
                velocity
            ) <
            MIN_VELOCITY
        ) {

            velocity = 0;


            // Automatically snap
            // to the nearest vertex.

            if (!clickedSnap) {

                const step =
                    Math.PI * 2 /
                    POINTS;


                const vertexStart =
                    -Math.PI / 2;


                const nearest =
                    Math.round(
                        (
                            rotation -
                            vertexStart
                        ) /
                        step
                    );


                snapTarget =
                    vertexStart +
                    nearest *
                    step;


                snapping = true;
            }
        }
    }


    // -------------------------
    // SNAP
    // -------------------------

    if (
        !dragging &&
        snapping
    ) {

        const difference =
            normalizeAngle(
                snapTarget -
                rotation
            );


        rotation +=
            difference *
            SNAP_SPEED;


        if (
            Math.abs(
                difference
            ) <
            SNAP_THRESHOLD
        ) {

            rotation =
                snapTarget;


            snapping = false;
        }
    }


    draw();


    requestAnimationFrame(
        animate
    );
}


requestAnimationFrame(
    animate
);