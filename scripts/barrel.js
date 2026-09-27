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
// MASTER BARREL SIZE
// ============================================================
//
// 150 = original size
// 300 = 2x larger
// 75  = 0.5x smaller
//
// Icons, labels, distances, curves and interaction
// areas scale automatically with this value.
// ============================================================

const RADIUS = 190;

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

const IMAGE_FOLDER = "mag_icons";
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
// ICONS
// ============================================================

const ICON_NORMAL_SIZE = 40;
const ICON_HIGHLIGHT_SIZE = 50;

const ICON_HOVER_RADIUS = 30;

// Distance from barrel point to icon.
const ICON_POINT_DISTANCE = 70;


// ============================================================
// LABELS
// ============================================================

const LABEL_FONT = "Archivo Black";

const LABEL_NORMAL_SIZE = 12;
const LABEL_HIGHLIGHT_SIZE = 16;

const LABEL_HEIGHT = 40;

// Distance between icon and label.
const LABEL_DISTANCE = 80;


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
// ============================================================
// CENTRE MESSAGE SETTINGS
// ============================================================
// ============================================================

const CENTRE_MESSAGE = "MAGAZINES\n IN STOCK";
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
//
// All original measurements were designed around:
//
// RADIUS = 150
//
// We use this as the reference so changing RADIUS
// scales everything proportionally.
// ============================================================

const BASE_RADIUS = 150;


// ============================================================
// MASTER SCALE
// ============================================================

function getBarrelScale() {

    return RADIUS / BASE_RADIUS;

}


// ============================================================
// SCALE VALUE
// ============================================================

function scale(value) {

    return value * getBarrelScale();

}


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


// ============================================================
// BARREL POSITION
// ============================================================

let barrelX =
    BARREL_OPEN_X();

let barrelTargetX =
    BARREL_OPEN_X();

let barrelCurrentY =
    BARREL_OPEN_Y();

let barrelTargetY =
    BARREL_OPEN_Y();


// ============================================================
// SELECTED
// ============================================================

let selected = false;

let selectedIndex = -1;


// ============================================================
// AUTOMATIC ROTATION
// ============================================================

let autoRotationActive =
    AUTO_ROTATION_ENABLED;


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
// BARREL POSITION
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

    barrelTargetX =
        BARREL_OPEN_X();

    barrelTargetY =
        BARREL_OPEN_Y();

}


function closeBarrel() {

    selected = true;

    barrelTargetX =
        BARREL_CLOSED_X;

    barrelTargetY =
        BARREL_SELECTED_Y();

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

function getMouseAngle(x, y) {

    return Math.atan2(
        y - barrelY(),
        x - getBarrelX()
    );

}


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

    const step =
        Math.PI * 2 /
        POINTS;


    const angle =
        -Math.PI / 2 +
        index * step;


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
// LABEL POSITION
// ============================================================

function getLabelPosition(
    item,
    width
) {

    const angle =
        item.angle;


    const distance =
        item.iconRadius +
        scale(LABEL_DISTANCE) +
        width / 2;


    return rotatePoint(

        Math.cos(angle) *
            distance,

        Math.sin(angle) *
            distance

    );

}


// ============================================================
// ROTATE SELECTED ITEM TO RIGHT MIDDLE
// ============================================================

function rotateItemToCentre(index) {

    const step =
        Math.PI * 2 /
        POINTS;


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


    for (
        let i = 0;
        i < POINTS;
        i++
    ) {

        const item =
            getItem(i);


        const icon =
            rotatePoint(
                item.iconX,
                item.iconY
            );


        // ----------------------------------------------------
        // ICON
        // ----------------------------------------------------

        const iconDistance =
            Math.hypot(
                mouseX - icon.x,
                mouseY - icon.y
            );


        if (
            iconDistance <=
            scale(ICON_HOVER_RADIUS)
        ) {

            return i;

        }


        // ----------------------------------------------------
        // LABEL
        // ----------------------------------------------------

        const label =
            LABELS[
                i % LABELS.length
            ];


        ctx.font =
            `${scale(LABEL_NORMAL_SIZE)}px "${LABEL_FONT}"`;


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
            scale(LABEL_HEIGHT) / 2 &&

            mouseY <=
            labelPosition.y +
            scale(LABEL_HEIGHT) / 2

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


    const spikeRadius =
        RADIUS * INSET;


    for (
        let i = 0;
        i < POINTS;
        i++
    ) {

        const angle =
            -Math.PI / 2 +
            rotation +
            i *
            (
                Math.PI * 2 /
                POINTS
            );


        points.push({

            x:
                Math.cos(angle) *
                spikeRadius,

            y:
                Math.sin(angle) *
                spikeRadius

        });

    }


    return points;

}


// ============================================================
// DRAW BARREL
// ============================================================

function drawBarrel() {

    const points =
        getBarrelPoints();


    ctx.save();


    ctx.translate(
        getBarrelX(),
        barrelY()
    );


    ctx.beginPath();


    for (
        let i = 0;
        i < POINTS;
        i++
    ) {

        const current =
            points[i];

        const next =
            points[
                (i + 1) % POINTS
            ];


        const dx =
            next.x -
            current.x;

        const dy =
            next.y -
            current.y;


        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const dirX =
            dx / length;

        const dirY =
            dy / length;


        const normalX =
            -dirY;

        const normalY =
            dirX;


        const controlDistance =
            length * 0.30;


        const control1 = {

            x:
                current.x +
                dirX *
                controlDistance,

            y:
                current.y +
                dirY *
                controlDistance

        };


        const control2 = {

            x:
                next.x -
                dirX *
                controlDistance,

            y:
                next.y -
                dirY *
                controlDistance

        };


        control1.x +=
            normalX *
            scale(EDGE_CURVE);

        control1.y +=
            normalY *
            scale(EDGE_CURVE);

        control2.x +=
            normalX *
            scale(EDGE_CURVE);

        control2.y +=
            normalY *
            scale(EDGE_CURVE);


        if (i === 0) {

            ctx.moveTo(
                current.x,
                current.y
            );

        }


        ctx.bezierCurveTo(

            control1.x,
            control1.y,

            control2.x,
            control2.y,

            next.x,
            next.y

        );

    }


    ctx.closePath();


    ctx.globalAlpha =
        BARREL_OPACITY;


    ctx.fillStyle =
        BARREL_FILL;


    ctx.strokeStyle =
        BARREL_STROKE;


    ctx.lineWidth =
        scale(BARREL_LINE_WIDTH);


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
// COLOUR INTERPOLATION
// ============================================================
//
// Converts colours such as:
//
// #ffffff
// #ff0000
//
// into a smooth colour transition.
//

function interpolateColour(
    colour1,
    colour2,
    amount
) {

    const c1 =
        colour1.replace("#", "");

    const c2 =
        colour2.replace("#", "");


    const r1 =
        parseInt(
            c1.substring(0, 2),
            16
        );

    const g1 =
        parseInt(
            c1.substring(2, 4),
            16
        );

    const b1 =
        parseInt(
            c1.substring(4, 6),
            16
        );


    const r2 =
        parseInt(
            c2.substring(0, 2),
            16
        );

    const g2 =
        parseInt(
            c2.substring(2, 4),
            16
        );

    const b2 =
        parseInt(
            c2.substring(4, 6),
            16
        );


    const r =
        Math.round(
            r1 +
            (r2 - r1) *
            amount
        );

    const g =
        Math.round(
            g1 +
            (g2 - g1) *
            amount
        );

    const b =
        Math.round(
            b1 +
            (b2 - b1) *
            amount
        );


    return `rgb(${r}, ${g}, ${b})`;

}


// ============================================================
// DRAW CENTRE MESSAGE
// ============================================================
//
// IMPORTANT:
//
// This text is NOT rotated with the barrel.
//
// The barrel rotates underneath it,
// but the text itself always remains upright.
//

function drawCentreMessage() {

    if (
        !CENTRE_MESSAGE ||
        CENTRE_MESSAGE.length === 0
    ) {

        return;

    }


    // --------------------------------------------------------
    // PULSE CALCULATION
    // --------------------------------------------------------

    let pulseScale = 1;

    let colour =
        CENTRE_MESSAGE_COLOR;


    if (
        CENTRE_MESSAGE_PULSE_ENABLED
    ) {

        // Creates a smooth 0 → 1 → 0 wave.

        const wave =
            (
                Math.sin(
                    centrePulseTime *
                    CENTRE_MESSAGE_PULSE_SPEED
                ) + 1
            ) / 2;


        // Grow and shrink.

        pulseScale =
            CENTRE_MESSAGE_MIN_SCALE +
            (
                CENTRE_MESSAGE_MAX_SCALE -
                CENTRE_MESSAGE_MIN_SCALE
            ) *
            wave;


        // Change colour.

        if (
            CENTRE_MESSAGE_COLOR_PULSE_ENABLED
        ) {

            colour =
                interpolateColour(
                    CENTRE_MESSAGE_COLOR,
                    CENTRE_MESSAGE_PULSE_COLOR,
                    wave
                );

        }

    }


    // --------------------------------------------------------
    // FINAL SIZE
    // --------------------------------------------------------

    const finalSize =
        scale(
            CENTRE_MESSAGE_SIZE
        ) *
        pulseScale;


    // --------------------------------------------------------
    // FINAL POSITION
    // --------------------------------------------------------

    const x =
        getBarrelX() +
        scale(
            CENTRE_MESSAGE_X
        );


    const y =
        barrelY() +
        scale(
            CENTRE_MESSAGE_Y
        );


    // --------------------------------------------------------
    // DRAW
    // --------------------------------------------------------

    ctx.setTransform(
        1, 0,
        0, 1,
        0, 0
    );


    ctx.save();


    ctx.globalAlpha =
        CENTRE_MESSAGE_OPACITY;


    ctx.fillStyle =
        colour;


    ctx.font =
        `${CENTRE_MESSAGE_WEIGHT} ${finalSize}px "${CENTRE_MESSAGE_FONT}"`;


    ctx.textAlign =
        CENTRE_MESSAGE_ALIGN;


    ctx.textBaseline =
        CENTRE_MESSAGE_BASELINE;


    // --------------------------------------------------------
    // LETTER SPACING
    // --------------------------------------------------------
    //
    // Canvas does not have universal letter-spacing
    // support, so draw the characters individually
    // when a value is supplied.
    //

    if (
        CENTRE_MESSAGE_LETTER_SPACING === 0
    ) {

        const lines = CENTRE_MESSAGE.split("\n");

        const lineHeight = finalSize * 1.2;

        lines.forEach((line, index) => {

            ctx.fillText(
                line,
                x,
                y +
                (
                    index -
                    (lines.length - 1) / 2
                ) *
                lineHeight
            );

        });

    }

    else {

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

function drawSpacedText(
    text,
    x,
    y,
    spacing
) {

    let totalWidth = 0;

    const widths = [];


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const width =
            ctx.measureText(
                text[i]
            ).width;


        widths.push(width);

        totalWidth += width;

    }


    totalWidth +=
        spacing *
        (text.length - 1);


    let currentX =
        x -
        totalWidth / 2;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        ctx.textAlign =
            "left";


        ctx.fillText(
            text[i],
            currentX,
            y
        );


        currentX +=
            widths[i] +
            spacing;

    }

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


        const icon =
            rotatePoint(
                item.iconX,
                item.iconY
            );


        // ----------------------------------------------------
        // AUTOMATIC HIGHLIGHT
        // ----------------------------------------------------

        const rightSide =
            icon.x >
            getBarrelX();


        const atCentre =
            Math.abs(
                icon.y -
                centreY
            ) <=
            scale(ICON_HOVER_RADIUS);


        const centreHighlighted =
            rightSide &&
            atCentre;


        // ----------------------------------------------------
        // HIGHLIGHT
        // ----------------------------------------------------

        const highlighted =
            i === hoveredIndex ||
            centreHighlighted;


        // ----------------------------------------------------
        // ICON SIZE
        // ----------------------------------------------------

        const targetSize =
            highlighted

                ? scale(
                    ICON_HIGHLIGHT_SIZE
                )

                : scale(
                    ICON_NORMAL_SIZE
                );


        if (
            highlightSizes[i] ===
            undefined
        ) {

            highlightSizes[i] =
                scale(
                    ICON_NORMAL_SIZE
                );

        }


        const difference =
            targetSize -
            highlightSizes[i];


        highlightSizes[i] +=
            difference *
            HIGHLIGHT_SPEED;


        if (
            Math.abs(
                difference
            ) < 0.05
        ) {

            highlightSizes[i] =
                targetSize;

        }


        const iconSize =
            highlightSizes[i];


        // ----------------------------------------------------
        // IMAGE
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // LABEL
        // ----------------------------------------------------

        const label =
            LABELS[
                i % LABELS.length
            ];


        ctx.font =
            highlighted

                ? `bold ${scale(LABEL_HIGHLIGHT_SIZE)}px "${LABEL_FONT}"`

                : `${scale(LABEL_NORMAL_SIZE)}px "${LABEL_FONT}"`;


        const labelWidth =
            ctx.measureText(
                label
            ).width;


        const labelPosition =
            getLabelPosition(
                item,
                labelWidth
            );


        // ----------------------------------------------------
        // LABEL SIZE
        // ----------------------------------------------------

        const normalIconSize =
            scale(
                ICON_NORMAL_SIZE
            );


        const highlightIconSize =
            scale(
                ICON_HIGHLIGHT_SIZE
            );


        const labelSize =
            scale(
                LABEL_NORMAL_SIZE
            )

            +

            (
                (
                    iconSize -
                    normalIconSize
                )

                /

                (
                    highlightIconSize -
                    normalIconSize
                )
            )

            *

            (
                scale(
                    LABEL_HIGHLIGHT_SIZE
                )

                -

                scale(
                    LABEL_NORMAL_SIZE
                )
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


    // --------------------------------------------------------
    // BARREL
    // --------------------------------------------------------

    drawBarrel();


    // --------------------------------------------------------
    // ICONS + LABELS
    // --------------------------------------------------------

    drawItems();


    // --------------------------------------------------------
    // CENTRE MESSAGE
    // --------------------------------------------------------
    //
    // Drawn last so it remains clearly visible
    // above the barrel and its contents.
    //

    drawCentreMessage();

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


        // ====================================================
        // CLICKING AN OPTION WHILE SELECTED
        // ====================================================

        if (selected) {

            const clickedIndex =
                getHoveredItem();


            if (clickedIndex !== -1) {

                dragging = false;

                dragMoved = false;

                return;

            }

        }


        // ====================================================
        // NORMAL DRAG
        // ====================================================

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


        manuallyControlled = true;

        autoRotationActive = false;


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

    }
);


// ============================================================
// CLICK
// ============================================================

canvas.addEventListener(
    "click",
    e => {

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


        // ====================================================
        // CLICKED ANY ICON / LABEL
        // ====================================================

        if (index !== -1) {

            selectedIndex =
                index;


            selected = true;


            barrelTargetX =
                BARREL_CLOSED_X;


            barrelTargetY =
                BARREL_SELECTED_Y();


            manuallyControlled = false;

            autoRotationActive = false;


            dragging = false;

            snapping = false;

            clickedSnap = false;

            velocity = 0;


            rotateItemToCentre(
                index
            );


            return;

        }


        // ====================================================
        // CLICKED OFF WHILE SELECTED
        // ====================================================

        if (selected) {

            selected = false;

            selectedIndex = -1;


            barrelTargetX =
                BARREL_OPEN_X();


            barrelTargetY =
                BARREL_OPEN_Y();


            snapping = false;

            clickedSnap = false;

            velocity = 0;


            manuallyControlled = false;

            autoRotationActive =
                AUTO_ROTATION_ENABLED;


            return;

        }


        // ====================================================
        // CLICKED OFF WHILE OPEN
        // ====================================================

        openBarrel();

    }
);


// ============================================================
// WHEEL
// ============================================================

canvas.addEventListener(
    "wheel",
    e => {

        e.preventDefault();


        manuallyControlled = true;

        autoRotationActive = false;


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


    // ========================================================
    // CENTRE MESSAGE PULSE
    // ========================================================

    if (
        CENTRE_MESSAGE_PULSE_ENABLED
    ) {

        centrePulseTime +=
            time -
            (
                time -
                (
                    deltaTime *
                    16.6667
                )
            );

    }


    // ========================================================
    // BARREL X MOVEMENT
    // ========================================================

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


    // ========================================================
    // BARREL Y MOVEMENT
    // ========================================================

    barrelCurrentY +=
        (
            barrelTargetY -
            barrelCurrentY
        ) *
        BARREL_MOVE_SPEED;


    // ========================================================
    // AUTOMATIC ROTATION
    // ========================================================

    if (
        !selected &&
        !dragging &&
        !snapping &&
        autoRotationActive &&
        AUTO_ROTATION_ENABLED
    ) {

        rotation +=
            AUTO_ROTATION_SPEED *
            deltaTime;

    }


    // ========================================================
    // MOMENTUM
    // ========================================================

    if (
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


        if (
            Math.abs(
                velocity
            ) <
            MIN_VELOCITY
        ) {

            velocity = 0;


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


    // ========================================================
    // SNAP
    // ========================================================

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


    // ========================================================
    // DRAW
    // ========================================================

    draw();


    requestAnimationFrame(
        animate
    );

}


requestAnimationFrame(
    animate
);