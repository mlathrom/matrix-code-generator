import './styles.css';

const settings = {
  nullStreamDensity: 4,
  nullStreamLengthMin: 8,
  nullStreamLengthMax: 36,
  glyphTransitionRandom: true, // Controls whether glyphs change at random times and speeds (more glyph randomness)
  streamSpeedRandom: true, // Controls whether stream speed changes at random times (more speed randomness)
  streamSpeedMin: 1,
  streamSpeedMax: 20,
  glyphSpeedMin: 5,
  glyphSpeedMax: 30,
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

const matrix = settings.glyphs.split('');
const codeFont = `${settings.fontSize}px ${settings.fontFace}`;

const terminalEl = document.querySelector('.terminal');
terminalEl.height = window.innerHeight;
terminalEl.width = window.innerWidth;

const terminal = terminalEl.getContext('2d');
terminal.imageSmoothingEnabled = false;

let time = 0;
let glyphTime = 0;
let streamTime = 0;
let codeStreams = [];
let nullStreams = [];
let codeRows = Math.floor(terminalEl.height / settings.fontSize);
let codeColumns = Math.floor(terminalEl.width / settings.fontSize);
let firstDrawComplete = false;

const glyphBufferEl = document.querySelector('.glyph-buffer');
glyphBufferEl.width = matrix.length * settings.fontSize;
glyphBufferEl.heigh = settings.fontSize * settings.colors.length;

const glyphBuffer = glyphBufferEl.getContext('2d');
glyphBuffer.imageSmoothingEnabled = false;
glyphBuffer.font = codeFont;
glyphBuffer.textAlign = 'center';
glyphBuffer.textBaseline = 'middle';

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
  for (let glyphIndex = 0; glyphIndex < matrix.length; glyphIndex++) {
    const glyph = matrix[glyphIndex];
    const colors = Object.entries(settings.colors);
    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      const color = colors[colorIndex];
      glyphBuffer.fillStyle = color[1];
      glyphBuffer.fillText(
        glyph,
        settings.fontSize * (glyphIndex + 1),
        settings.fontSize * (colorIndex + 1)
      );
    }
  }
}
function drawGlyph(glyph, color, xPos, yPos) {
  const randomInt = glyph;
  const glyphXPos = randomInt * settings.fontSize;
  const colors = Object.entries(settings.colors);
  let glyphYPos;
  Object.entries(settings.colors).forEach(([key, value], colorIndex) => {
    if (color == value) {
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
    this.speed = randomIntMinMax(settings.glyphSpeedMin, settings.glyphSpeedMax);
  }
  draw() {
    if (settings.glyphTransitionRandom) {
      this.speed = randomIntMinMax(settings.glyphSpeedMin, settings.glyphSpeedMax);
    }
    const yPos = this.index * settings.fontSize;
    const oldGlyph = this.glyph;
    if (glyphTime % this.speed == 0) {
      this.glyph = getGlyph();
      this.opacity = randomDecMinMax(settings.glyphOpacityMin, settings.glyphOpacityMax);
    }
    // if (firstDrawComplete && this.glyph !== oldGlyph) {
    terminal.save();
    // terminal.clearRect(this.xPos, yPos, settings.fontSize, settings.fontSize);
    terminal.globalAlpha = this.opacity;
    drawGlyph(this.glyph, settings.colors.default, this.xPos, yPos);
    terminal.restore();
    // }
    if (streamTime > 1000) {
      glyphTime = 0;
    } else {
      glyphTime = glyphTime + 1;
    }
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
    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      glyph.draw();
    }
  }
}

class NullStream {
  constructor(index) {
    this.glyph = getGlyph();
    this.csLength;
    this.width;
    this.index = index;
    this.height = randomIntMinMax(settings.nullStreamLengthMin, settings.nullStreamLengthMax);
    this.glowChance = randomIntMinMax(1, 12);
    this.xPos = this.index * settings.fontSize;
    this.opacity = randomDecMinMax(0.75, 1);
    this.yPos = randomIntMinMax(-codeRows, codeRows);
    this.speed = randomIntMinMax(30, 300);
    nullStreams.push(this);
  }
  draw() {
    if (settings.streamSpeedRandom) {
      this.speed = randomIntMinMax(settings.streamSpeedMin, settings.streamSpeedMax);
    }
    if (streamTime % this.speed == 0) {
      this.glyph = getGlyph();
      this.opacity = randomDecMinMax(0.5, 1);
      if (this.yPos > terminalEl.height / settings.fontSize) {
        this.yPos = randomIntMinMax(-codeRows, -this.height);
      } else {
        this.yPos = this.yPos + 1;
      }
    }
    if (this.yPos + this.height > 0) {
      terminal.save();
      terminal.clearRect(
        this.xPos,
        this.yPos * settings.fontSize,
        settings.fontSize,
        this.height * settings.fontSize
      );
      if (
        (this.glowChance * settings.highlightGlyphDensity) % 6 == 0 &&
        settings.highlightGlyphDensity !== 0
      ) {
        terminal.globalAlpha = this.opacity;
        drawGlyph(this.glyph, settings.colors.highlight, this.xPos, this.yPos * settings.fontSize);
      }
      terminal.restore();
    }
    if (streamTime > 1000) {
      streamTime = 0;
    } else {
      streamTime = streamTime + 1;
    }
  }
}

function makeItRain() {
  for (let i = 0; i <= codeColumns; i++) {
    new CodeStream(i);
    for (let index = 0; index < settings.nullStreamDensity; index++) {
      new NullStream(i);
    }
  }
  var rain = function () {
    renderGlyphs();
    terminal.clearRect(0, 0, terminalEl.width, terminalEl.height);
    for (let i = 1; i < codeStreams.length; i++) {
      const stream = codeStreams[i];
      stream.draw();
    }
    for (let i = 1; i < nullStreams.length; i++) {
      const nullStream = nullStreams[i];
      nullStream.draw();
    }
    requestAnimationFrame(rain);
    time = time + 1;
    firstDrawComplete = true;
  };
  requestAnimationFrame(rain);
}

makeItRain();
