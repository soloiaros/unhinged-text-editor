import canvasSketch from 'canvas-sketch';
import p5 from 'p5';
import random from 'canvas-sketch-util/random';

const settings = {
  p5: { p5 },
  animate: true,
  dimensions: [1080, 1080],
};

let circles, elCanvas, circleX, circleY;

const sketch = ({ canvas, width, height }) => {

  elCanvas = canvas;
  setUpEventListeners();

  const circleWidth = 20;
  const circleGap = 20;
  const circleNum = Math.floor(Math.sqrt(width * width + height * height) / (circleWidth + circleGap));
  console.log(circleNum)
  const segmentLength = 50;
  const segmentGap = 30;

  circles = [];
  for (let i = 0; i < circleNum; i++) {
    const radius = i * (circleWidth + circleGap) + circleWidth / 2;
    circles.push(new Circle({ radius, segmentLength, segmentGap }));
  }

  circleX = width * 0.5;
  circleY = height * 0.5;
  
  return ({ p5, width, height }) => {
    p5.background(212);
    p5.fill(0);

    renderCircles({ p5, x: circleX, y: circleY, circleWidth });
  };
}

function renderCircles({ p5, x, y, circleWidth }) {
  p5.noFill();
  p5.stroke(0);
  p5.strokeWeight(circleWidth);
  
  p5.push();
  p5.translate(x, y);
  
  circles.forEach(circle => {
    if (circle === circles[0]) p5.circle(0, 0, circleWidth);
    else circle.draw(p5);
  })

  p5.pop();
}

class Circle {
  constructor({ radius, segmentLength, segmentGap }) {
    this.radius = radius;
    this.segmentLength = segmentLength;
    this.segmentGap = segmentGap;

    this.segmentTheta = segmentLength / radius;
    this.gapTheta = segmentGap / radius;

    this.initAngle = random.value(0, Math.PI * 2);
    this.finalAngle = this.initAngle + Math.PI * 2 - this.gapTheta;
  }

  draw(p5) {
    const segmentsNum = Math.ceil(Math.PI * 2 / (this.segmentTheta + this.gapTheta));
    let currAngle = this.initAngle;
    for (let j = 0; j < segmentsNum; j++) {
      if (currAngle > this.finalAngle) break;
      const endAngle = currAngle + this.segmentTheta > this.finalAngle ? this.finalAngle : currAngle + this.segmentTheta;
      p5.arc(0, 0, this.radius * 2, this.radius * 2, currAngle, endAngle);
      currAngle += this.segmentTheta + this.gapTheta;
    }
  }
}

const setUpEventListeners = () => {
  elCanvas.addEventListener('click', (event) => {
    const x = (event.offsetX / elCanvas.offsetWidth) * elCanvas.width;
    const y = (event.offsetY / elCanvas.offsetHeight) * elCanvas.height;
    circleX = x;
    circleY = y;
  })
}

const start = () => {
  canvasSketch(sketch, settings);
}

start();

