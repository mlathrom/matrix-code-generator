import './styles.css';

const construct = window.localStorage;

const settings = {
  nullStreamDensity: 4,
  nullStreamLengthMin: 1,
  nullStreamLengthMax: 42,
  streamSpeedMin: 1,
  streamSpeedMax: 20,
  streamSpeedRandom: true,
  streamSpeedRandomHalf: false,
  streamSpeedBoost: 0,
  streamJumpersMin: 0,
  streamJumpersMax: 0,
  glyphSpeedMin: 5,
  glyphSpeedMax: 50,
  glyphTransitionRandom: true,
  highlightGlyphDensity: 5,
  glyphOpacityMin: 0.5,
  glyphOpacityMax: 0,
  reduceFramerate: 2,
  tileGlyphsX: 1,
  tileGlyphsY: 1,
  colors: {
    default: 'rgba(63, 255, 106, 1)',
    highlight: 'rgba(200, 255, 215, 1)',
  },
  glyphs: 'qwertyuiopasdfghjklzxcvbnm.:"*<>|123457890-_=+QWERTYUIOP ',
  fontSize: 14,
  fontFace: 'matrix-code',
};

const matrix = settings.glyphs.split('');
const codeFont = `${settings.fontSize}px ${settings.fontFace}`;
const colorEntries = Object.entries(settings.colors);

const terminalEl = document.querySelector('.terminal');
terminalEl.height = window.innerHeight;
terminalEl.width = window.innerWidth;

const terminal = terminalEl.getContext('2d');

let time = 0;
let glyphTime = 0;
let streamTime = 0;
let nullStreams = [];
let codeRows = Math.floor(terminalEl.height / settings.fontSize);
let codeColumns = Math.floor(terminalEl.width / settings.fontSize);

function randomIntMinMax(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomDecMinMax(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function getGlyph() {
  let glyph = 0;
  if (matrix.length > 1) {
    glyph = randomIntMinMax(0, matrix.length - 1);
  }
  return glyph;
}

class GlyphBuffer {
  constructor() {
    this.canvas;
    this.ctx;
  }
  create(el, width, height, position) {
    const canvas = document.createElement('canvas');
    const body = document.getElementsByTagName('body')[0];
    canvas.className = 'glyph-buffer';
    canvas.width = matrix.length * settings.fontSize;
    canvas.height = colorEntries.length * settings.fontSize;
    canvas.style.top = '-1px';
    canvas.style.position = 'fixed';
    canvas.style.width = '0';
    canvas.style.height = '0';
    body.append(canvas);
    this.canvas = document.querySelector('.glyph-buffer');

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.font = codeFont;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'ideographic';
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let glyphIndex = 0; glyphIndex < matrix.length; glyphIndex++) {
      const glyph = matrix[glyphIndex];
      const colors = Object.entries(settings.colors);
      for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
        const color = colors[colorIndex];
        this.ctx.fillStyle = color[1];
        this.ctx.fillText(
          glyph,
          settings.fontSize * (glyphIndex + 1),
          settings.fontSize * (colorIndex + 1),
        );
      }
    }
  }
  get theCanvas() {
    return this.canvas;
  }
  get theCtx() {
    return this.ctx;
  }
}
const glyphBuffer = new GlyphBuffer();
glyphBuffer.create();

function drawGlyph(glyph, color, xPos, yPos) {
  const glyphXPos = glyph * settings.fontSize;
  let glyphYPos;
  colorEntries.forEach(([key, value], colorIndex) => {
    if (color == value) {
      glyphYPos = settings.fontSize * colorIndex;
    }
  });
  terminal.drawImage(
    glyphBuffer.theCanvas,
    glyphXPos,
    glyphYPos,
    settings.fontSize,
    settings.fontSize,
    xPos,
    yPos,
    settings.fontSize,
    settings.fontSize,
  );
}

class Glyph {
  constructor(xPos, yPos) {
    this.glyph = getGlyph();
    this.xPos = xPos;
    this.yPos = yPos;
    this.opacity = randomDecMinMax(
      settings.glyphOpacityMin,
      settings.glyphOpacityMax,
    );
    this.speed = randomIntMinMax(
      settings.glyphSpeedMin,
      settings.glyphSpeedMax,
    );
  }
  draw() {
    if (settings.glyphTransitionRandom) {
      this.speed = randomIntMinMax(
        settings.glyphSpeedMin,
        settings.glyphSpeedMax,
      );
    }
    if (glyphTime % this.speed == 0) {
      this.glyph = getGlyph();
      this.opacity = randomDecMinMax(
        settings.glyphOpacityMin,
        settings.glyphOpacityMax,
      );
    }
    terminal.save();
    terminal.globalAlpha = this.opacity;
    drawGlyph(this.glyph, settings.colors.default, this.xPos, this.yPos);
    terminal.restore();
    if (glyphTime > 1000) {
      glyphTime = 0;
    } else {
      glyphTime = glyphTime + 1;
    }
  }
}

class CodeMatrix {
  constructor() {
    this.glyphs = [];
    this.codeRows = codeRows;
    this.codeColumns = codeColumns;
    this.tileGlyphsX = settings.tileGlyphsX + 1;
    this.tileGlyphsY = settings.tileGlyphsY + 1;
    if (settings.tileGlyphsX > 0) {
      this.codeRows = Math.ceil(codeRows / this.tileGlyphsX);
    }
    if (settings.tileGlyphsY > 0) {
      this.codeColumns = Math.ceil(codeColumns / this.tileGlyphsY);
    }
    this.tileWidth = this.codeColumns * settings.fontSize;
    this.tileHeight = this.codeRows * settings.fontSize;
    for (let i = 0; i < this.codeColumns * this.codeRows; i++) {
      const xPos = (i % this.codeColumns) * settings.fontSize;
      const yPos = Math.floor(i / this.codeColumns) * settings.fontSize;
      const glyph = new Glyph(xPos, yPos);
      this.glyphs.push(glyph);
    }
  }
  draw() {
    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      glyph.draw();
    }
    if (this.tileGlyphsX + this.tileGlyphsY > 0) {
      for (let i = 1; i < this.tileGlyphsX * this.tileGlyphsY; i++) {
        const xPos = (i % this.tileGlyphsX) * this.tileWidth;
        const yPos = Math.floor(i / this.tileGlyphsY) * this.tileHeight;
        terminal.drawImage(
          terminalEl,
          0,
          0,
          this.tileWidth,
          this.tileHeight,
          xPos,
          yPos,
          this.tileWidth,
          this.tileHeight,
        );
      }
    }
  }
}

class NullStream {
  constructor(index) {
    this.glyph = getGlyph();
    this.width;
    this.index = index;
    this.height = randomIntMinMax(
      settings.nullStreamLengthMin,
      settings.nullStreamLengthMax,
    );
    this.glowChance = randomIntMinMax(1, 12);
    this.xPos = this.index * settings.fontSize;
    this.opacity = randomDecMinMax(
      settings.glyphOpacityMin,
      settings.glyphOpacityMin,
    );
    this.yPos = randomIntMinMax(-codeRows, codeRows);
    this.speed = randomIntMinMax(
      settings.streamSpeedMin,
      settings.streamSpeedMax,
    );
    this.speedConstantChance = randomIntMinMax(0, 1);
    this.nullAmount = 1;
    nullStreams.push(this);
  }
  draw() {
    let glowGlyph = false;
    if (
      (this.glowChance * settings.highlightGlyphDensity) % 6 == 0 &&
      settings.highlightGlyphDensity !== 0
    ) {
      glowGlyph = true;
      this.nullAmount = randomIntMinMax(
        settings.streamJumpersMin + 1,
        settings.streamJumpersMax + 1,
      );
    }
    if (settings.streamSpeedRandom) {
      if (this.speedConstantChance && settings.streamSpeedRandomHalf) {
        this.speed = randomIntMinMax(
          settings.streamSpeedMin,
          settings.streamSpeedMax,
        );
      }
    }
    for (let i = 0; i < this.nullAmount + settings.streamSpeedBoost * 2; i++) {
      if (streamTime % this.speed == 0) {
        this.glyph = getGlyph();
        this.opacity = randomDecMinMax(
          settings.glyphOpacityMin,
          settings.glyphOpacityMax,
        );
        if (this.yPos > terminalEl.height / settings.fontSize) {
          this.yPos = randomIntMinMax(-codeRows, -this.height);
        } else {
          this.yPos = this.yPos + 1 + Math.floor(settings.streamSpeedBoost);
        }
      }
      if (this.yPos + this.height > 0) {
        terminal.save();
        terminal.clearRect(
          this.xPos,
          this.yPos * settings.fontSize,
          settings.fontSize,
          this.height * settings.fontSize,
        );
        if (glowGlyph) {
          terminal.globalAlpha = this.opacity;
          drawGlyph(
            this.glyph,
            settings.colors.highlight,
            this.xPos,
            this.yPos * settings.fontSize,
          );
        }
        terminal.restore();
      }
    }
    if (streamTime > 1000) {
      streamTime = 0;
    } else {
      streamTime = streamTime + 1;
    }
  }
}

class FrameRate {
  constructor() {
    this.frameRate;
    this.frameRateEl = document.querySelector('.framerate');
    this.frameRateResultEl = document.querySelector('.framerate__result');
  }
  start() {
    time = 0;
    this.frameRate = setInterval(() => {
      let frameRate;
      const newFrameRate = Math.floor(time / 5);
      if (newFrameRate !== frameRate) {
        if (!this.frameRateEl.classList.contains('show')) {
          this.frameRateEl.classList.add('show');
        }
        this.frameRateResultEl.textContent = newFrameRate;
        frameRate = newFrameRate;
      }
      time = 0;
    }, 5000);
  }
  stop() {
    this.frameRateEl.classList.remove('show');
    clearInterval(this.frameRate);
  }
}
const frameRate = new FrameRate();

class Hud {
  constructor() {
    this.hudEl = document.querySelector('.hud');
    this.showHud = false;
    if (construct.hasOwnProperty('showHud')) {
      this.showHud = construct.showHud;
    }
    if (construct.showHud === 'true') {
      this.showHud = construct.showHud;
      this.hudEl.style.display = 'block';
      frameRate.start();
    }
  }
  toggle() {
    this.showHud = !this.showHud;
    construct.showHud = this.showHud;
    if (this.showHud) {
      this.hudEl.style.display = 'block';
      frameRate.start();
    } else {
      this.hudEl.style.display = 'none';
      frameRate.stop();
    }
  }
}
const hud = new Hud();

function makeItRain() {
  const codeMatrix = new CodeMatrix();
  for (let column = 0; column <= codeColumns; column++) {
    for (let stream = 0; stream < settings.nullStreamDensity; stream++) {
      new NullStream(column);
    }
  }
  var rain = function () {
    glyphBuffer.render();
    if (time % (settings.reduceFramerate + 1) == 0) {
      terminal.clearRect(0, 0, terminalEl.width, terminalEl.height);
      codeMatrix.draw();
      for (let i = 1; i < nullStreams.length; i++) {
        nullStreams[i].draw();
      }
    }
    requestAnimationFrame(rain);
    time = time + 1;
  };
  requestAnimationFrame(rain);
}

makeItRain();

window.addEventListener('keydown', (e) => {
  if (e.keyCode === 67) {
    hud.toggle();
  }
});
