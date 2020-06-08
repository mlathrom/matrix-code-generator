import './styles.css';

const settings = {
  nullStreamDensity: 6,
  nullStreamLengthMin: 2,
  nullStreamLengthMax: 36,
  glyphTransitionRandom: true, // Controls whether glyphs change at random times and speeds (more glyph randomness)
  streamSpeedRandom: true, // Controls whether stream speed changes at random times (more speed randomness)
  streamSpeedMin: 5,
  streamSpeedMax: 30,
  highlightGlyphDensity: 1,
  glyphOpacityMin: 0.5,
  glyphOpacityMax: 1,
  colors: {
    default: 'rgba(63, 255, 106, 1)',
    highlight: 'rgba(200, 255, 215, 1)',
  },
  glyphs: 'qwertyuiopasdfghjklzxcvbnm.:"*<>|123457890-_=+QWERTYUIOP ',
  fontSize: 18,
  fontFace: 'matrix-code',
};

const terminalEl = document.querySelector('.terminal');
const terminal = terminalEl.getContext('2d');
terminalEl.height = window.innerHeight;
terminalEl.width = window.innerWidth;

const matrix = settings.glyphs.split('');

const codeFont = `${settings.fontSize}px ${settings.fontFace}`;

let time = 0;
let streamTime = 0;
let codeStreams = [];
let blackStreams = [];
let codeRows = Math.floor(terminalEl.height / settings.fontSize);
let codeColumns = Math.floor(terminalEl.width / settings.fontSize);

const glyphBufferEl = document.querySelector('.glyph-buffer');
const glyphBuffer = glyphBufferEl.getContext('2d');
glyphBufferEl.width = matrix.length * settings.fontSize;
glyphBufferEl.heigh = settings.fontSize * settings.colors.length;

function randomIntMinMax(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomDecMinMax(min, max) {
  return Math.random() * (max - min + 1) + min;
}
function getGlyph() {
  const glyph = randomIntMinMax(1, matrix.length);
  return glyph;
}
function renderGlyphs() {
  glyphBuffer.clearRect(0, 0, glyphBufferEl.width, glyphBufferEl.height);
  matrix.forEach((glyph, glyphIndex) => {
    Object.entries(settings.colors).forEach(([key, value], colorIndex) => {
      glyphBuffer.fillStyle = value;
      glyphBuffer.font = codeFont;
      glyphBuffer.textAlign = 'center';
      glyphBuffer.textBaseline = 'middle';
      glyphBuffer.fillText(
        glyph,
        settings.fontSize * (glyphIndex + 1),
        settings.fontSize * (colorIndex + 1)
      );
    });
  });
}
function drawGlyph(glyph, color, xPos, yPos) {
  const randomInt = glyph;
  const glyphXPos = randomInt * settings.fontSize;
  let glyphYPos;
  Object.entries(settings.colors).forEach(([key, value], colorIndex) => {
    if (color == key) {
      glyphYPos = settings.fontSize * colorIndex;
    }
  });
  terminal.drawImage(
    glyphBufferEl,
    glyphXPos + settings.fontSize / 2,
    glyphYPos + settings.fontSize / 2,
    settings.fontSize,
    settings.fontSize,
    xPos,
    yPos,
    settings.fontSize,
    settings.fontSize
  );
}

class Glyph {
  constructor(xPos, index) {
    this.glyph = getGlyph();
    this.xPos = xPos;
    this.index = index;
    this.opacity = randomDecMinMax(settings.glyphOpacityMin, settings.glyphOpacityMax);
    this.speed = randomIntMinMax(settings.streamSpeedMin, settings.streamSpeedMax);
  }
  draw() {
    if (settings.glyphTransitionRandom) {
      this.speed = randomIntMinMax(settings.streamSpeedMin, settings.streamSpeedMax);
    }
    const yPos = this.index * settings.fontSize;
    if (time % this.speed == 0) {
      this.glyph = getGlyph();
      this.opacity = randomDecMinMax(settings.glyphOpacityMin, settings.glyphOpacityMax);
    }
    terminal.save();
    terminal.globalAlpha = this.opacity;
    drawGlyph(this.glyph, 'default', this.xPos, yPos);
    terminal.restore();
    time = time + 1;
  }
}

class CodeStream {
  constructor(index) {
    this.glyphs = [];
    this.index = index;
    this.xPos = this.index * settings.fontSize;
    for (let i = 0; i < codeRows; i++) {
      const glyph = new Glyph(this.xPos, i);
      this.glyphs.push(glyph);
    }
    codeStreams.push(this);
  }
  draw() {
    this.glyphs.forEach((glyph, index) => {
      glyph.draw();
    });
  }
}

class BlackStream {
  constructor(index) {
    this.glyph = getGlyph();
    this.csLength;
    this.width;
    this.index = index;
    this.height = randomIntMinMax(settings.nullStreamLengthMin, settings.nullStreamLengthMax);
    this.glowChance = randomIntMinMax(1, 12);
    this.xPos = this.index * settings.fontSize;
    this.opacity = randomDecMinMax(0.75, 1);
    this.yPos = randomIntMinMax(-codeRows, codeRows) * settings.fontSize;
    for (let i = 0; i < codeRows; i++) {
      blackStreams.push(this);
    }
  }
  draw() {
    if (settings.streamSpeedRandom) {
      this.speed = randomIntMinMax(30, 300);
    }
    if (streamTime % this.speed == 0) {
      this.glyph = getGlyph();
      this.opacity = randomDecMinMax(0.5, 1);
      if (this.yPos > terminalEl.height) {
        this.yPos = randomIntMinMax(-codeRows, -this.height) * settings.fontSize;
      } else {
        this.yPos = this.yPos + settings.fontSize;
      }
    }
    terminal.clearRect(this.xPos, this.yPos, settings.fontSize, settings.fontSize * this.height);
    if (
      (this.glowChance * settings.highlightGlyphDensity) % 6 == 0 &&
      settings.highlightGlyphDensity !== 0
    ) {
      terminal.save();
      terminal.globalAlpha = this.opacity;
      drawGlyph(this.glyph, 'highlight', this.xPos, this.yPos);
      terminal.restore();
    }
    streamTime = streamTime + 1;
  }
}

function makeItRain() {
  for (let i = 0; i <= codeColumns; i++) {
    new CodeStream(i);
    for (let index = 0; index < settings.nullStreamDensity; index++) {
      new BlackStream(i);
    }
  }
  var rain = function () {
    terminal.clearRect(0, 0, terminalEl.width, terminalEl.height);
    renderGlyphs();
    codeStreams.forEach((stream) => {
      stream.draw();
    });
    blackStreams.forEach((clearStream) => {
      clearStream.draw();
    });
    requestAnimationFrame(rain);
  };
  requestAnimationFrame(rain);
}

makeItRain();
