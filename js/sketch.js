let bn = 10;//box number
let bs = 40;//box size
let bm = 60;//box margin

function setup() {
    createCanvas(windowWidth, windowHeight,WEBGL);
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
}let bn = 10 ;//box number
let bs = 10;//box size
let bm = 10;//box margin

function setup() {
    createCanvas(windowWidth, windowHeight,WEBGL);
}

function draw() {
  // filter(ERODE);
  background(255);
  rotateX(radians(60));
  rotateZ(frameCount / 150);
  for(let i = 0; i < bn; i++){
    for(let j = 0; j < bn; j++){
      for(let k = 0; k < bn; k++){

          push();
          　translate((60 * i)-270,0);
          　translate(0,(60 * j)-270);
          　translate(0,0,(60 * k)-200)
          　box(40+10*cos(frameCount/25));
          pop();
        }
      }
    }
}



function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
