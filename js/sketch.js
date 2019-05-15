function setup() {
    createCanvas(windowWidth, windowHeight,WEBGL);
}

function draw() {
  background(255);
  rotateX(radians(60));
  rotateZ(frameCount / 150);
  for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
      for(let k = 0; k < 10; k++){

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
