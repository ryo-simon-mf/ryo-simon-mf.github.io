let bn = 10; //box number
let bs = 40; //box size
let bm = 60; //box margin

// Eased mouse position (canvas-centered coordinates)
let emx = 0;
let emy = 0;
let reduceMotion = false;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function draw() {
    background(255);

    // Ease mouse toward current position for smooth reaction
    emx = lerp(emx, mouseX - width / 2, 0.06);
    emy = lerp(emy, mouseY - height / 2, 0.06);

    const t = reduceMotion ? 0 : frameCount;
    const rz = t / 150 + emx * 0.0003; // rotation subtly follows mouse
    rotateX(radians(60));
    rotateZ(rz);

    // Project mouse into the rotated grid plane (approximation):
    // un-rotate by -rz, stretch y to compensate the 60deg tilt
    const gx = emx * Math.cos(-rz) - emy * 2 * Math.sin(-rz);
    const gy = emx * Math.sin(-rz) + emy * 2 * Math.cos(-rz);

    for (var ix = 0; ix < bn; ix++) {
        let x = (ix - 0.5 * bn + 0.5) * bm;
        for (var iy = 0; iy < bn; iy++) {
            let y = (iy - 0.5 * bn + 0.5) * bm;

            // Cursor proximity: 0 (far) - 1 (under cursor)
            const d = dist(x, y, gx, gy);
            const influence = reduceMotion ? 0 : max(0, 1 - d / 220);

            for (var iz = 0; iz < bn; iz++) {
                push();
                translate(x, 0);
                translate(0, y);
                // Boxes near the cursor lift up out of the grid
                translate(0, 0, (bm * iz) - 200 + influence * 40);
                box(bs + 10 * cos(t / 25) + influence * 14);
                pop();
            }
        }
    }

    // Static single frame when the user prefers reduced motion
    if (reduceMotion) {
        noLoop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
