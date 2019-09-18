let bn_1 = 10;//box number
let bs_1 = 40;//box size
let bm_1 = 60;//box margin

function setup() {
    createCanvas(windowWidth, windowHeight,WEBGL);
}

function draw() {
  
  let size_w = round(windowWidth / 400) - 5;
  let size_h = round(windowWidth / 400) - 5;
   
  bm = bm_1 * size_w * 0.1;
  bs = bs_1 * size_w * 0.1;
  bn = bn_1 * size_w * 0.1;
  
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
           translate(x,0);
           translate(0,y);
           // translate(0,0,z);
       // translate((60 * i)-270,0);
          // translate(0,(60 * j)-270);
          translate(0,0,(bm * iz)-200);
           // box(bs);
          box(bs+10*cos(frameCount/25));
          pop();
        }
      }
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
