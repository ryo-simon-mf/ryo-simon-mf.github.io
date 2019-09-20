let bn = 10; //box number
let bs = 1; //box size
let bm = 11.5; //box margin

function setup() {
    createCanvas(windowWidth / 5 - 100, 1100, WEBGL);
    // canvas.parent('canvas');
}

function draw() {
    background(255);
    rotateX(radians(60));
    rotateZ(frameCount / 150);
    for (var ix = 0; ix < bn; ix++) {
        let x = (ix - 0.5 * bn + 0.5) * bm;
        for (var iy = 0; iy < bn; iy++) {
            let y = (iy - 0.5 * bn + 0.5) * bm;
            for (var iz = 0; iz < bn; iz++) {
                let z = (ix - 0.5 * bn + 0.5) * bm;

                push();
                translate(x, 0);
                translate(0, y);
                // translate(0,0,z);
                　 // translate((60 * i)-270,0);
                　 // translate(0,(60 * j)-270);
                　
                translate(0, 0, (bm * iz) - 30);
                // box(bs);
                　
                box(bs + 10 * abs(cos(frameCount / 50)));
                pop();
            }
        }
    }
}