import canvasSketch from 'canvas-sketch';
import p5 from 'p5';
import random from 'canvas-sketch-util/random';

const settings = {
  p5: { p5 },
  animate: true,
  dimensions: [1080, 1080],
};

let circles;

const sketch = ({ width, height }) => {

  const circleWidth = 20;
  const circleGap = 20;
  const circleNum = Math.floor(Math.max(width / (circleWidth + circleGap), height / (circleWidth + circleGap)));
  const segmentLength = 50;
  const segmentGap = 30;

  circles = [];
  for (let i = 0; i < circleNum; i++) {
    const radius = i * (circleWidth + circleGap) + circleWidth / 2;
    circles.push(new Circle({ radius, segmentLength, segmentGap }));
  }
  
  return ({ p5, width, height }) => {
    p5.background(212);
    p5.fill(0);

    renderCircles({ p5, x: width * 0.5, y: height * 0.5, circleWidth });
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
  }

  draw(p5) {
    const segmentsNum = Math.floor(Math.PI * 2 / (this.segmentTheta + this.gapTheta));
    let currAngle = this.initAngle;
    for (let j = 0; j < segmentsNum; j++) {
      p5.arc(0, 0, this.radius * 2, this.radius * 2, currAngle, currAngle + this.segmentTheta);
      currAngle += this.segmentTheta + this.gapTheta;
    }
  }
}

canvasSketch(sketch, settings);
