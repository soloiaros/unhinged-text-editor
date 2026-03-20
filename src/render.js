import canvasSketch from 'canvas-sketch';
import p5 from 'p5';
import random from 'canvas-sketch-util/random';
import GoogleSansFlex from './fonts/GoogleSansFlex.ttf';

const settings = {
  p5: { p5 },
  animate: true,
  dimensions: [1080, 1080],
};

let circles, elCanvas, circleX, circleY, font, bgData;

const sketch = async ({ p5, canvas, width, height }) => {

  elCanvas = canvas;
  setUpEventListeners();
  font = await new Promise((resolve, reject) => {
    p5.loadFont(GoogleSansFlex, resolve, reject);
  })

  const circleWidth = 20;
  const circleGap = 20;
  const circleNum = Math.floor(Math.sqrt(width * width + height * height) / (circleWidth + circleGap));
  const minSegmentLength = 10;
  const maxSegmentLength = 50;
  const segmentGap = 30;

  circles = [];
  for (let i = 0; i < circleNum; i++) {
    const radius = i * (circleWidth + circleGap) + circleWidth / 2;
    circles.push(new Circle({ radius, minSegmentLength, maxSegmentLength, segmentGap }));
  }

  circleX = width * 0.5;
  circleY = height * 0.5;

  let textCanvas = renderText({ p5, width, height, text: 'That Is Smth New' });
  textCanvas.loadPixels();
  bgData = textCanvas.pixels;
  
  return ({ p5, width, height }) => {
    p5.background(212);
    p5.fill(0);

    renderCircles({ p5, x: circleX, y: circleY, circleWidth });

    p5.image(textCanvas, 0, 0);
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
  constructor({ radius, minSegmentLength, maxSegmentLength, segmentGap }) {
    this.radius = radius;
    this.minSegmentLength = minSegmentLength;
    this.maxSegmentLength = maxSegmentLength;
    this.segmentLength = maxSegmentLength; // adjust later
    this.segmentGap = segmentGap;

    this.segmentTheta = this.segmentLength / radius;
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

function renderText({ p5, width, height, text }) {
  const canvas = p5.createGraphics(width, height);
  canvas.textFont(font);
  canvas.textAlign(p5.CENTER, p5.CENTER);
  canvas.textWrap('WORD');
  canvas.textSize(260);
  canvas.fill(0);
  canvas.text(text, 0, 0, width, height);
  return canvas;
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

