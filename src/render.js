import canvasSketch from 'canvas-sketch';
import p5 from 'p5';
import random from 'canvas-sketch-util/random';
import GoogleSansFlex from './fonts/GoogleSansFlex.ttf';
import './style.scss';

const settings = {
  p5: { p5 },
  animate: true,
  fps: 12,
};

let circles, elCanvas, circleX, circleY, font, bgData;
let params = {
  bgColor: '#f0f0f0',
  strokeColor: '#343231',
  circleWidth: 10,
  circleGap: 10,
  maxSegmentLength: 15,
  segmentGap: 10,
  text: "This Is Smth New",
};

const sketch = async ({ p5, canvas, width, height }) => {
  p5.pixelDensity(1);
  elCanvas = canvas;
  setUpEventListeners({ p5, width, height });
  
  font = await new Promise((resolve, reject) => {
    p5.loadFont(GoogleSansFlex, resolve, reject);
  })

  initCircles({ p5, width, height });

  circleX = width * 0.5;
  circleY = height * 0.5;

  let textCanvas = renderText({ p5, width, height });
  textCanvas.loadPixels();
  bgData = textCanvas.pixels;
  
  return ({ p5, width, height, frame }) => {
    p5.background(params.bgColor);

    renderCircles({ p5, x: circleX, y: circleY, circleWidth, canvasWidth: width, canvasHeight: height });

    //for debugging text uncomment
    // p5.image(textCanvas, 0, 0);
  };
}

function renderCircles({ p5, x, y, canvasWidth, canvasHeight }) {
  p5.noFill();
  p5.stroke(params.strokeColor);
  p5.strokeWeight(params.circleWidth);
  
  p5.push();
  p5.translate(x, y);
  
  circles.forEach(circle => {
    circle.draw({ p5, centerX: x, centerY: y, canvasWidth, canvasHeight });
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
  }

  draw({ p5, centerX, centerY, canvasWidth, canvasHeight }) {
    const segmentsNum = Math.ceil(Math.PI * 2 / (this.segmentTheta + this.gapTheta));
    let currAngle = this.initAngle;

    for (let j = 0; j < segmentsNum; j++) {
      if (currAngle > this.finalAngle) break;

      const currX = Math.floor(centerX + this.radius * Math.cos(currAngle));
      const currY = Math.floor(centerY + this.radius * Math.sin(currAngle));

      if (currX >= 0 && currX < canvasWidth && currY >= 0 && currY < canvasHeight) {
        const pixelIndex = (currY * canvasWidth + currX) * 4;
        if (bgData && bgData[pixelIndex] > 0) {
          const endAngle = currAngle + this.segmentTheta;
          p5.arc(0, 0, this.radius * 2, this.radius * 2, currAngle, endAngle);
        }
      }
      currAngle += this.segmentTheta + this.gapTheta;
    }
  }
}

function initCircles ({ p5, width, height }) {
  const circleNum = Math.floor(Math.sqrt(width * width + height * height) / (params.circleWidth + params.circleGap));
  circles = [];
  for (let i = 0; i < circleNum; i++) {
    const radius = i * (params.circleWidth + params.circleGap) + params.circleWidth / 2;
    circles.push(new Circle({ 
      radius, 
      maxSegmentLength: params.maxSegmentLength, 
      minSegmentLength: params.maxSegmentLength,
      segmentGap: params.segmentGap 
    }));
  }
}

function renderText({ p5, width, height }) {
  const canvas = p5.createGraphics(width, height);
  canvas.pixelDensity(1);
  canvas.textFont(font);
  canvas.textAlign(p5.CENTER, p5.CENTER);
  canvas.textSize(260);
  canvas.fill(255);
  canvas.text(params.text, 0, 0, width, height);
  return canvas;
}

const setUpEventListeners = ({ p5, width, height }) => {
  elCanvas.addEventListener('click', (e) => {
    const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
    const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;
    circleX = x;
    circleY = y;
  })

  const toggle = document.getElementById('controlsToggle');
  const controls = document.getElementById('controls');
  if (toggle && controls) {
    toggle.addEventListener('click', () => {
      controls.classList.toggle('collapsed');
    });
  }

  const animationToggle = document.getElementById('animationToggle');
  const animationSettings = document.getElementById('animationSettings');
  if (animationToggle && animationSettings) {
    animationToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        animationSettings.classList.remove('hidden');
      } else {
        animationSettings.classList.add('hidden');
      }
    });
  }

  const onMouseMove = (e) => {
      const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
      const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;
      circleX = x;
      circleY = y;
  }

  const interactionToggle = document.getElementById('interactionToggle');
  if (interactionToggle) {
    interactionToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        elCanvas.addEventListener('mousemove', onMouseMove);
      } else {
        elCanvas.removeEventListener('mousemove', onMouseMove);
      }
    })
  }

  const ids = ['bgColor', 'strokeColor', 'circleWidth', 'circleGap', 'maxSegmentLength', 'segmentGap'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        let val = e.target.value;
        if (e.target.type === 'range') val = parseFloat(val);
        params[id] = val;
        
        if (['circleWidth', 'circleGap', 'maxSegmentLength', 'segmentGap'].includes(id)) {
          initCircles({ p5, width, height });
        }
      });
    }
  });

  const textInput = document.getElementById('textInput');
  let textTimeout;
  if (textInput) {
    textInput.addEventListener('input', () => {
      params.text = textInput.value;
      clearTimeout(textTimeout);
      textTimeout = setTimeout(() => {
        const textCanvas = renderText({ p5, width, height });
        textCanvas.loadPixels();
        bgData = textCanvas.pixels;
        initCircles({ p5, width, height });
      }, 250);
    });
  }
}

const start = () => {
  canvasSketch(sketch, settings);
}

start();
