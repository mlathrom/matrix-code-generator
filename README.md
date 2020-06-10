# The Matrix Code Generator
![Matrix Code](https://repository-images.githubusercontent.com/270471929/8a997c00-a96f-11ea-9cdd-407d1f36615a)

This is a screen-accurate Matrix Code generator built with HTML canvas.

I'm a big fan of The Matrix and have always wanted a code generator that truly matched the films. So I watched the opening sequence about 100 times, and with screen shots and video reference, built this over a weekend.

Feel free to copy, adapt, use in fan films, whatever you want. If you happen to be a VFX artist or set decorator who uses this on the new film, you'd make my dreams come true by giving me a credit.

**Demo:** [matrix-code.mlathrom.com](https://matrix-code.mlathrom.com)

## Requirements
- Node.js
- NPM

## Installation
To get it running quick, run the following.
```console
npm install
npm run serve
```
## Details
### Glyphs
The glyphs were built in Adobe Illustrator using screenshots from the first film as reference. I took particular care to make sure the glyphs maintained consistent thickness, proportion, and style.

### Streams
The streaming effect actually works in reverse. You're not seeing streams of code over empty space, it's streams of empty space over code. This turned out to be the simplest implementation.

### Glowing
Canvas filters completely kill performance, so the glow is generated by applying a CSS drop-shadow filter to the canvas.

### Pixelation
There is a pixelation overlay to give the code texture. This just a low-opacity linear-gradient that creates a small checkered pattern.

### Performance
These settings will negatively impact performance:
- Increased highlighted glyphs
- Increased null streams (I know, less code is actually slower...)
- Decreased font size

### Musings
Some of the screen accuracy was incidental. Turns out the way HTML canvas draws lends itself to the little details of randomness. For example, the short trails on highlighted glyphs and the way bits of code pop in and out of existence are the result of null streams moving past each other at random speeds.

## Settings
This is pretty configurable. You can change the color, font, glyphs used. The defaults are set to look as Matrixy as possible.
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **`nullStreamDensity`** | `{Number}` | `3` | Controls the amount of null streams. |
| **`nullStreamLengthMin`** | `{Number}` | `1` | Minimum block length of null streams. |
| **`nullStreamLengthMax`** | `{Number}`  | `48` | Minimum block length of null streams. |
| **`streamSpeedMin`** | `{Number}`  | `3` | Minimum speed of streams. |
| **`streamSpeedMax`** | `{Number}`  | `10` | Maximum speed of streams. |
| **`streamSpeedRandom`** | `{Boolean}`  | `true` | Ranomizes the speed at which streams move. Streams can change speed during life. |
| **`streamSpeedRandomHalf`** | `{Boolean}`  | `true` | Give half of the streams random changing speed, and the other half consistent. |
| **`streamSpeedBoost`** | `{Number}`  | `0` | Increases the "blocks per frame" speed of streams. |
| **`streamJumperMin`** | `{Number}`  | `0` | Minimum number of highlighted glyphs that make quick jumps. |
| **`streamJumperMax`** | `{Number}`  | `0` | Miximum number of highlighted glyphs that make quick jumps. |
| **`glyphSpeedMin`** | `{Number}`  | `5` | Minimum transition speed of glyphs. |
| **`glyphSpeedMax`** | `{Number}`  | `100` | Maximum transition speed of glyphs. |
| **`glyphTransitionRandom`** | `{Boolean}`  | `true` | Ranomizes the time and speed at which glyphs change. |
| **`highlightGlyphDensity`** | `{Number}`  | `2` | Controls the density of highlighted glyphs |
| **`glyphOpacityMin`** | `{Number}`  | `0.5` | Maximum opacity of glyphs. |
| **`glyphOpacityMax`** | `{Number}`  | `1` | Maximum opacity of glyphs. |
| **`colors.default`** | `{String}`  | `'rgba(63, 255, 106, 1)'` | Color of default glyphs. |
| **`colors.highlight`** | `{String}`  | `'rgba(200, 255, 215, 1)'` | Color of highlight glyphs. |
| **`glyphs`** | `{String}`  | `'qwertyuiopasdfghjklzxcvbnm.:"*<>\|123457890-_=+QWERTYUIOP '` | String of glyphs to use. |
| **`fontSize`** | `{Number}`  | `18` | Font size of glyphs. |
| **`fontFace`** | `{String}`  | `'matrix-code'` | Font face of glyphs. |

## Future Development
I'll probably tinker with this some more, but I have no specific plans. Here's a list of features I'd like to add if I get the time:
- [x] Improve performance.
- [ ] Change direction of stream.
- [ ] Adapt to screen resize.
- [ ] Brighter highlighted glyphs. (tough to do because of the stream clearing)
- [ ] Add frame rate counter.
- [ ] Add controls for code settings.
