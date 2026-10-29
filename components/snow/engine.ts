// Snow that falls over the page and piles up on every [data-ledge] element, ported from Snowhush's
// web demo (https://github.com/mbezruchko/Snowhush, MIT, Copyright (c) 2026 Mykhailo Bezruchko). Kept: the drift model,
// the flakes, the loose grains and powder puffs, and the cursor ploughing through the snow. Dropped:
// the night scene, the gust, the settings menu. Changed: one fixed canvas over the viewport instead of
// one per section, so ledges are re-measured every frame and the snowfall moves with the scroll.
// Coordinates are viewport CSS pixels with y pointing down; heights are measured up from each layer's bed.

const COLUMN = 2;
const REPOSE = 0.8;
const ROUNDING = 0.15;
const GRAVITY = 2500;
const GRAIN_DRAG = 0.8;
const CURSOR_RADIUS = 10;
const CURSOR_OFFSET = [4, 8];
const GROUND_DEPTH = 40;
const LEDGE_DEPTH = 14;
const THAW_DEPTH = 8;
const LEDGE_THAW_DEPTH = 4;
const THAW_RATE = 0.02;
const THAW_TIME = 30;
const THAW_BALANCE = 184;
const THAW_EXPONENT = 0.74;
const BUILDUP = 1.5;
const DEPOSITION = 1.1 * BUILDUP;
const DENSITY = 380;
const MAX_GRAINS = 4000;
const MAX_MOTES = 800;
const PHASE_WRAP = 20 * Math.PI;
// How much of the scroll each flake follows: far flakes lag behind the page, near ones move with it.
const PARALLAX = [0.55, 1];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

type Point = { x: number; y: number };
type Flake = {
  x: number; y: number; vx: number; vy: number; fall: number; size: number; depth: number;
  alpha: number; soft: number; phase: number; swayRate: number; swayAmount: number; settles: boolean;
};
type Grain = { x: number; y: number; vx: number; vy: number; area: number; size: number };
type Mote = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; age: number; life: number };

// MARK: - Layers

class Layer {
  x = 0;
  y = 0;
  h = new Float32Array(0);
  bed = new Float32Array(0);
  cap = new Float32Array(0);
  held = new Uint8Array(0);
  data = new Float32Array(0);
  spill = [0, 0];
  parity = false;
  top = 0;
  bedDepth = 0;
  filled = false;
  radius = -1;
  phases = [rand(0, Math.PI * 2), rand(0, Math.PI * 2)];

  constructor(public depth: number, public open: boolean) {}

  get count() { return this.h.length; }
  get width() { return this.h.length * COLUMN; }

  place(x: number, y: number, width: number, radius = 0, exponent = 2.5) {
    const count = Math.max(4, Math.floor(width / COLUMN));
    const resized = count !== this.h.length;
    if (resized) {
      // Stretched, not cropped: a ledge that reflows wider keeps its whole cap instead of a bare stretch at one end.
      const old = this.h;
      this.h = Float32Array.from({ length: count }, (_, i) => {
        if (old.length === 0) return 0;
        const at = (i + 0.5) * old.length / count - 0.5;
        const a = Math.max(0, Math.min(old.length - 1, Math.floor(at)));
        const b = Math.min(old.length - 1, a + 1);
        return old[a] + (old[b] - old[a]) * Math.max(0, Math.min(1, at - a));
      });
      this.held = new Uint8Array(count);
      this.cap = Float32Array.from({ length: count }, (_, i) => {
        const px = i * COLUMN;
        return this.depth * (0.95 + 0.12 * Math.sin(px * 0.0105 + this.phases[0]) + 0.07 * Math.sin(px * 0.037 + this.phases[1]));
      });
      this.data = new Float32Array(count * 2);
    }
    this.x = x + (width - count * COLUMN) / 2;
    this.y = y;
    // Placed every frame as the page scrolls, so the bed is only reshaped when it changes.
    if (resized || radius !== this.radius) {
      this.radius = radius;
      const span = count * COLUMN;
      this.bed = Float32Array.from({ length: count }, (_, i) => {
        if (radius <= 0) return 0;
        const inset = Math.min((i + 0.5) * COLUMN, span - (i + 0.5) * COLUMN);
        if (inset >= radius) return 0;
        const u = 1 - inset / radius;
        return radius * (1 - Math.pow(Math.max(0, 1 - Math.pow(u, exponent)), 1 / exponent));
      });
      this.bedDepth = this.bed.reduce((a, b) => Math.max(a, b), 0);
    }
    if (!this.filled) {
      this.filled = true;
      for (let i = 0; i < count; i++) this.h[i] = this.cap[i] * (this.open ? 0.55 : 0.5);
      this.refreshTop();
      for (let k = 0; k < 30; k++) this.relax(REPOSE);
      this.spill = [0, 0];
    }
  }

  index(x: number) {
    const i = Math.floor((x - this.x) / COLUMN);
    return i >= 0 && i < this.h.length ? i : -1;
  }

  clamped(x: number) {
    return Math.min(Math.max(Math.floor((x - this.x) / COLUMN), 0), this.h.length - 1);
  }

  centerX(i: number) { return this.x + (i + 0.5) * COLUMN; }
  floorY(i: number) { return this.y + this.bed[i]; }
  surface(i: number) { return this.y + this.bed[i] - this.h[i]; }
  fill(i: number) { return Math.max(0, 1 - this.h[i] / this.cap[i]); }

  deposit(area: number, x: number) {
    if (area <= 0) return 0;
    const center = Math.floor((x - this.x) / COLUMN);
    const amount = area / COLUMN;
    let missed = 0;
    for (const [offset, weight] of [[-2, 0.0625], [-1, 0.25], [0, 0.375], [1, 0.25], [2, 0.0625]]) {
      const i = center + offset;
      if (i >= 0 && i < this.h.length) this.h[i] += amount * weight;
      else missed += area * weight;
    }
    return missed;
  }

  refreshTop() {
    let top = 0;
    for (let i = 0; i < this.h.length; i++) top = Math.max(top, this.h[i]);
    this.top = top;
  }

  // Slumps slopes steeper than the angle of repose and rounds crests, measured on the snow surface over the bed,
  // so snow slides off rounded corners. Open layers shed what slides past their ends into `spill`.
  relax(repose: number) {
    const n = this.h.length;
    if (n < 4 || this.top <= 0) return;
    const h = this.h, bed = this.bed, held = this.held;
    const limit = repose * COLUMN;
    const forwardFirst = this.parity;
    this.parity = !this.parity;
    for (let pass = 0; pass < 6; pass++) {
      const forward = (pass % 2 === 0) === forwardFirst;
      for (let k = 0; k < n - 1; k++) {
        const i = forward ? k : n - 2 - k;
        if (held[i] || held[i + 1]) continue;
        const difference = (h[i] - bed[i]) - (h[i + 1] - bed[i + 1]);
        if (difference > limit + 0.01) {
          const t = Math.min((difference - limit) * 0.5, h[i]);
          h[i] -= t;
          h[i + 1] += t;
        } else if (difference < -limit - 0.01) {
          const t = Math.min((-difference - limit) * 0.5, h[i + 1]);
          h[i] += t;
          h[i + 1] -= t;
        }
      }
      if (this.open) {
        if (!held[0] && h[0] > limit + 0.01) {
          const t = (h[0] - limit) * 0.5;
          h[0] -= t;
          this.spill[0] += t * COLUMN;
        }
        if (!held[n - 1] && h[n - 1] > limit + 0.01) {
          const t = (h[n - 1] - limit) * 0.5;
          h[n - 1] -= t;
          this.spill[1] += t * COLUMN;
        }
      }
    }
    // Pulls each slope toward its neighbours' average: rounds crests and notches, leaves even slopes alone.
    for (let i = 1; i < n - 2; i++) {
      if (held[i - 1] || held[i] || held[i + 1] || held[i + 2]) continue;
      const s0 = h[i - 1] - bed[i - 1], s1 = h[i] - bed[i], s2 = h[i + 1] - bed[i + 1], s3 = h[i + 2] - bed[i + 2];
      const kink = (s1 - s2) - 0.5 * ((s0 - s1) + (s2 - s3));
      if (Math.abs(kink) <= 0.02) continue;
      const t = kink > 0 ? Math.min(kink * ROUNDING, h[i]) : Math.max(kink * ROUNDING, -h[i + 1]);
      h[i] -= t;
      h[i + 1] += t;
    }
  }

  // Snow down to `floor` melts slowly; anything heaped above it settles back down over THAW_TIME seconds.
  thaw(dt: number, floor: number) {
    for (let i = 0; i < this.h.length; i++) {
      const height = this.h[i];
      if (height <= 0) continue;
      this.h[i] = height - Math.min(height, (THAW_RATE + Math.max(0, height - floor) / THAW_TIME) * dt);
    }
  }

  // Surface then bed, both measured up from the base, as the pile shader reads them.
  write() {
    const n = this.h.length, h = this.h, data = this.data;
    for (let i = 0; i < n; i++) {
      const left = h[Math.max(i - 1, 0)];
      const right = h[Math.min(i + 1, n - 1)];
      data[i] = -this.bed[i] + 0.25 * left + 0.5 * h[i] + 0.25 * right;
      data[n + i] = -this.bed[i];
    }
    return data;
  }
}

// MARK: - Shaders
// Recoloured from the original for a white page: snow keeps a cool grey rim so it reads against white.

const SPRITE_VERTEX = `#version 300 es
  in vec2 aPosition;
  in vec3 aLook;
  uniform vec2 uView;
  uniform float uScale;
  out float vAlpha;
  out float vSoft;
  void main() {
    float pixels = aLook.x * uScale;
    gl_Position = vec4(aPosition.x / uView.x * 2.0 - 1.0, 1.0 - aPosition.y / uView.y * 2.0, 0.0, 1.0);
    gl_PointSize = max(pixels, 2.0);
    vAlpha = aLook.y * min(pixels / 2.0, 1.0);
    vSoft = aLook.z;
  }
`;

const SPRITE_FRAGMENT = `#version 300 es
  precision highp float;
  in float vAlpha;
  in float vSoft;
  out vec4 outColor;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = (1.0 - smoothstep(mix(0.6, 0.0, vSoft), 1.0, d)) * vAlpha;
    vec3 color = mix(vec3(0.97, 0.98, 1.0), vec3(0.58, 0.64, 0.76), clamp(smoothstep(0.2, 1.0, d) * 0.9, 0.0, 1.0));
    if (a < 0.002) discard;
    outColor = vec4(color * a, a);
  }
`;

const PILE_VERTEX = `#version 300 es
  uniform vec4 uRect;
  uniform vec2 uView;
  out vec2 vPoint;
  void main() {
    vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
    vec2 p = mix(uRect.xy, uRect.zw, corner);
    vPoint = p;
    gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
  }
`;

const PILE_FRAGMENT = `#version 300 es
  precision highp float;
  precision highp int;
  in vec2 vPoint;
  uniform sampler2D uHeights;
  uniform int uCount;
  uniform vec2 uOrigin;
  uniform float uScale;
  uniform float uTime;
  out vec4 outColor;

  float heightAt(int row, float x) {
    float f = x / ${COLUMN.toFixed(1)} - 0.5;
    float base = floor(f);
    int i = clamp(int(base), 0, uCount - 1);
    int j = min(i + 1, uCount - 1);
    return mix(texelFetch(uHeights, ivec2(i, row), 0).r, texelFetch(uHeights, ivec2(j, row), 0).r, clamp(f - base, 0.0, 1.0));
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    float x = vPoint.x - uOrigin.x;
    float y = uOrigin.y - vPoint.y;
    float level = heightAt(0, x);
    float bed = heightAt(1, x);
    float depth = level - y;
    float coverage = clamp(depth * uScale + 0.5, 0.0, 1.0)
      * clamp((y - bed) * uScale + 0.5, 0.0, 1.0)
      * clamp((level - bed) / 0.75, 0.0, 1.0);
    if (coverage <= 0.0) discard;

    float slope = (heightAt(0, x + 2.0) - heightAt(0, x - 2.0)) * 0.25;
    float light = dot(normalize(vec2(-slope, 1.0)), normalize(vec2(-0.5, 1.0)));

    vec3 surface = vec3(0.955, 0.965, 0.985);
    vec3 shadow = vec3(0.72, 0.78, 0.88);
    float shade = (1.0 - exp(-depth / 30.0)) * 0.32 + (1.0 - light) * 0.6 * exp(-depth / 5.0);
    vec3 color = mix(surface, shadow, clamp(shade, 0.0, 1.0));
    // A thin cool rim along the top of the drift, where the original had a bright highlight.
    color = mix(color, vec3(0.66, 0.72, 0.84), exp(-depth * 1.4) * 0.75);
    color += (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.02;

    float seed = hash(floor(gl_FragCoord.xy * 0.5) + 31.7);
    if (seed > 0.992) {
      float twinkle = pow(clamp(sin(uTime * (0.6 + seed * 1.8) + seed * 90.0), 0.0, 1.0), 28.0) * exp(-depth / 7.0);
      color = mix(color, vec3(1.0), twinkle);
    }
    outColor = vec4(min(color, vec3(1.0)) * coverage, coverage);
  }
`;

function program(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
    return shader;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program');
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
    const name = gl.getActiveUniform(p, i)!.name;
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { program: p, uniforms };
}

// MARK: - Scene

class Scene {
  ground = new Layer(GROUND_DEPTH, false);
  ledges: { element: Element; layer: Layer }[];
  flakes: Flake[] = [];
  grains: Grain[] = [];
  motes: Mote[] = [];
  cursor: Point | null = null;
  cursorVelocity = [0, 0];
  time = rand(0, 100);
  width = 0;
  height = 0;
  dpr = 1;
  scrollY = window.scrollY;
  gl: WebGL2RenderingContext;
  sprite: ReturnType<typeof program>;
  pile: ReturnType<typeof program>;
  spriteBuffer: WebGLBuffer;
  spriteVAO: WebGLVertexArrayObject;
  pileVAO: WebGLVertexArrayObject;
  textures = new Map<Layer, WebGLTexture>();
  spriteData = new Float32Array(0);

  constructor(public root: HTMLElement, public canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.ledges = Array.from(root.querySelectorAll('[data-ledge]')).map(element => ({ element, layer: new Layer(LEDGE_DEPTH, true) }));
    this.gl = gl;
    this.sprite = program(gl, SPRITE_VERTEX, SPRITE_FRAGMENT);
    this.pile = program(gl, PILE_VERTEX, PILE_FRAGMENT);
    this.spriteBuffer = gl.createBuffer()!;
    this.spriteVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.spriteVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer);
    const position = gl.getAttribLocation(this.sprite.program, 'aPosition');
    const look = gl.getAttribLocation(this.sprite.program, 'aLook');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(look);
    gl.vertexAttribPointer(look, 3, gl.FLOAT, false, 20, 8);
    gl.bindVertexArray(null);
    this.pileVAO = gl.createVertexArray()!;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  }

  get layers() {
    return [this.ground, ...this.ledges.map(ledge => ledge.layer)];
  }

  resize() {
    const first = this.width === 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    if (first) {
      const target = this.target();
      while (this.flakes.length < target) this.flakes.push(this.makeFlake(rand(-20, this.height)));
    }
  }

  // Follows the page: ledges are measured where they are now, and everything in the air shifts with the scroll.
  track() {
    const scrolled = window.scrollY - this.scrollY;
    this.scrollY = window.scrollY;
    if (scrolled) {
      const span = this.height + 80;
      for (const f of this.flakes) {
        f.y -= scrolled * (PARALLAX[0] + (PARALLAX[1] - PARALLAX[0]) * f.depth);
        if (f.y < -40) f.y += span;
        else if (f.y > this.height + 40) f.y -= span;
      }
      for (const g of this.grains) g.y -= scrolled;
      for (const m of this.motes) m.y -= scrolled;
    }
    const root = this.root.getBoundingClientRect();
    // Sunk a little below the edge so no sliver of background shows under the drift after rounding.
    this.ground.place(root.left, root.bottom + 2, root.width);
    for (const { element, layer } of this.ledges) {
      const box = element.getBoundingClientRect();
      layer.place(box.left, box.top, box.width, Number((element as HTMLElement).dataset.ledge) || 0, 2.5);
    }
  }

  target() {
    return Math.round(DENSITY * this.width * this.height / 1e6);
  }

  wind() {
    const t = this.time;
    return 10 * Math.sin(t * 0.07) + 6 * Math.sin(t * 0.19 + 1.7) + 3 * Math.sin(t * 0.43 + 4.1);
  }

  makeFlake(y: number): Flake {
    const near = Math.random() < 0.02;
    const depth = near ? 1 : Math.pow(Math.random(), 1.6);
    const fall = near ? rand(75, 100) : 16 + depth * 50 + rand(0, 10);
    return {
      x: rand(-30, this.width + 30),
      y,
      vx: this.wind() * (0.35 + 0.65 * depth),
      vy: fall,
      fall,
      size: near ? rand(8, 13) : 1.4 + depth * 4.4 + rand(0, 1),
      depth,
      alpha: near ? 0.28 : 0.4 + depth * 0.5,
      soft: near ? 0.95 : 0.75 - depth * 0.45,
      phase: rand(0, PHASE_WRAP),
      swayRate: rand(0.5, 1.4),
      swayAmount: near ? rand(10, 20) : rand(4, 9) + depth * 10,
      settles: !near,
    };
  }

  // MARK: Simulation

  step(dt: number, pointer: Point | null) {
    this.time += dt;
    this.track();
    this.trackCursor(pointer, dt);
    this.advanceFlakes(dt);
    this.advanceGrains(dt);
    this.advanceMotes(dt);
    this.settle(dt);
    const target = this.target();
    while (this.flakes.length < target) this.flakes.push(this.makeFlake(-rand(0, this.height * 0.8)));
    for (const layer of this.layers) layer.refreshTop();
  }

  /// The highest snow surface crossed while falling from `from` to `to` at `x`.
  landing(x: number, from: number, to: number) {
    let hit: { layer: Layer; i: number } | null = null;
    let highest = Infinity;
    for (const { layer } of this.ledges) {
      const i = layer.index(x);
      if (i < 0) continue;
      const surface = layer.surface(i);
      if (from <= layer.floorY(i) && to >= surface && surface < highest) {
        hit = { layer, i };
        highest = surface;
      }
    }
    if (hit) return hit;
    const i = this.ground.clamped(x);
    return to >= this.ground.surface(i) ? { layer: this.ground, i } : null;
  }

  advanceFlakes(dt: number) {
    const wind = this.wind();
    const follow = Math.min(1, dt * 1.2);
    const settle = Math.min(1, dt * 1.6);
    const target = this.target();
    let wake: { x: number; y: number; vx: number; vy: number } | null = null;
    if (this.cursor) {
      let [wx, wy] = this.cursorVelocity;
      const speed = Math.hypot(wx, wy);
      if (speed > 500) {
        wx *= 500 / speed;
        wy *= 500 / speed;
      }
      if (speed > 20) wake = { x: this.cursor.x, y: this.cursor.y, vx: wx, vy: wy };
    }

    const flakes = this.flakes;
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      f.vx += (wind * (0.35 + 0.65 * f.depth) - f.vx) * follow;
      f.vy += (f.fall - f.vy) * settle;
      if (wake) {
        const dx = f.x - wake.x, dy = f.y - wake.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 80) {
          const falloff = 1 - distance / 80;
          const k = Math.min(1, falloff * falloff * 4 * dt);
          f.vx += (wake.vx - f.vx) * k;
          f.vy += (wake.vy - f.vy) * k;
        }
      }
      f.phase += f.swayRate * dt;
      if (f.phase > PHASE_WRAP) f.phase -= PHASE_WRAP;
      const sway = (Math.cos(f.phase) + 0.3 * Math.cos(f.phase * 2.3)) * f.swayAmount;
      const flutter = 1 + 0.12 * Math.sin(f.phase * 1.3);
      const from = f.y;
      f.x += (f.vx + sway) * dt;
      f.y += f.vy * flutter * dt;
      if (f.x < -30) f.x += this.width + 60;
      else if (f.x > this.width + 30) f.x -= this.width + 60;

      let gone = false;
      if (f.settles) {
        const hit = this.landing(f.x, from, f.y);
        if (hit) {
          const missed = hit.layer.deposit(f.size * f.size * DEPOSITION * hit.layer.fill(hit.i), f.x);
          this.dropPast(hit.layer, missed, f.x, 0);
          gone = true;
        }
      }
      // Off the bottom of the viewport: comes round again at the top (scrolling can bring it back too).
      if (!gone && f.y > this.height + f.size * 2 + 40) gone = true;
      if (!gone) continue;
      if (flakes.length <= target) {
        flakes[i] = this.makeFlake(-rand(4, 40));
      } else {
        flakes[i] = flakes[flakes.length - 1];
        flakes.pop();
      }
    }
  }

  advanceGrains(dt: number) {
    const damping = Math.exp(-GRAIN_DRAG * dt);
    const grains = this.grains;
    for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      const from = g.y;
      g.vy += GRAVITY * dt;
      g.vx *= damping;
      g.vy *= damping;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      let gone = g.x < -10 || g.x > this.width + 10 || g.y > this.height + 20;
      if (!gone && g.vy >= 0) {
        const hit = this.landing(g.x, from, g.y);
        if (hit) {
          const missed = hit.layer.deposit(g.area, g.x);
          this.dropPast(hit.layer, missed, g.x, g.vx * 0.5);
          gone = true;
        }
      }
      if (gone) {
        grains[i] = grains[grains.length - 1];
        grains.pop();
      }
    }
  }

  advanceMotes(dt: number) {
    const damping = Math.exp(-3.2 * dt);
    const drift = this.wind() * 0.4;
    const motes = this.motes;
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.age += dt;
      if (m.age >= m.life) {
        motes[i] = motes[motes.length - 1];
        motes.pop();
        continue;
      }
      m.vy += 35 * dt;
      m.vx *= damping;
      m.vy *= damping;
      m.x += (m.vx + drift) * dt;
      m.y += m.vy * dt;
    }
  }

  settle(dt: number) {
    // Melting nearly keeps pace with the snowfall, so the drifts level off instead of burying the page.
    const meltPace = BUILDUP * (DENSITY / THAW_BALANCE) ** THAW_EXPONENT;
    for (const layer of this.layers) {
      layer.thaw(dt * meltPace, layer === this.ground ? THAW_DEPTH : LEDGE_THAW_DEPTH);
      layer.relax(REPOSE);
      if (layer.spill[0] > 1.5) {
        this.release(layer.spill[0], this.edgePoint(layer, true), [-6, 15], [0.25, 1]);
        layer.spill[0] = 0;
      }
      if (layer.spill[1] > 1.5) {
        this.release(layer.spill[1], this.edgePoint(layer, false), [6, 15], [0.25, 1]);
        layer.spill[1] = 0;
      }
    }
  }

  release(area: number, [x, y]: number[], [vx, vy]: number[], [sx, sy] = [1, 1], scatter = 0) {
    if (area <= 0.02) return;
    const room = MAX_GRAINS - this.grains.length;
    if (room <= 0) {
      this.ground.deposit(area, x);
      return;
    }
    const count = Math.min(room, Math.max(1, Math.min(6, Math.floor(area / 3))));
    const share = area / count;
    for (let k = 0; k < count; k++) {
      const spread = 1 + rand(-scatter, scatter);
      this.grains.push({
        x: x + rand(-sx, sx),
        y: y - rand(0, sy),
        vx: vx * spread + rand(-12, 12) - 40 * scatter * rand(-1, 1),
        vy: vy * spread + rand(-8, 10),
        area: share,
        size: Math.min(5, Math.max(1.1, Math.sqrt(share) * 1.05)),
      });
    }
  }

  /// Snow that lands past the end of a ledge drops off that end instead.
  dropPast(layer: Layer, area: number, x: number, vx: number) {
    if (!layer.open || area <= 0.05) return;
    const left = x < layer.x + layer.width / 2;
    this.release(area, this.edgePoint(layer, left), [vx, 10], [0.25, 1]);
  }

  /// Just past the layer's end, at the height the snow reaches on the end column, which on a rounded corner lies down the curve.
  edgePoint(layer: Layer, left: boolean) {
    const end = left ? 0 : layer.count - 1;
    return [left ? layer.x - 0.75 : layer.x + layer.width + 0.75, layer.surface(end)];
  }

  // MARK: Cursor

  trackCursor(pointer: Point | null, dt: number) {
    for (const layer of this.layers) layer.held.fill(0);
    if (!pointer) {
      this.cursor = null;
      return;
    }
    const center = { x: pointer.x + CURSOR_OFFSET[0], y: pointer.y + CURSOR_OFFSET[1] };
    const previous = this.cursor;
    this.cursor = center;
    if (!previous) return;

    const dx = center.x - previous.x, dy = center.y - previous.y;
    const distance = Math.hypot(dx, dy);
    let vx = dx / Math.max(dt, 1 / 240), vy = dy / Math.max(dt, 1 / 240);
    const speed = Math.hypot(vx, vy);
    if (speed > 3000) {
      vx *= 3000 / speed;
      vy *= 3000 / speed;
    }
    this.cursorVelocity[0] += (vx - this.cursorVelocity[0]) * 0.5;
    this.cursorVelocity[1] += (vy - this.cursorVelocity[1]) * 0.5;

    const r = CURSOR_RADIUS;
    const top = Math.min(center.y, previous.y) - r, bottom = Math.max(center.y, previous.y) + r;
    const left = Math.min(center.x, previous.x) - r, right = Math.max(center.x, previous.x) + r;
    const touched = this.layers.filter(layer =>
      bottom >= layer.y - layer.top - 1 && top <= layer.y + layer.bedDepth
      && right >= layer.x && left <= layer.x + layer.width
      && (layer === this.ground || layer.top > 0.01));
    if (!touched.length) return;
    if (distance > 400) {
      for (const layer of touched) this.carve(layer, center, [0, 0], 0, true);
      return;
    }
    const steps = Math.floor(distance / (r * 0.5)) + 1;
    for (let s = 1; s <= steps; s++) {
      const p = { x: previous.x + dx * s / steps, y: previous.y + dy * s / steps };
      for (const layer of touched) this.carve(layer, p, [vx, vy], distance / steps, s === steps);
    }
  }

  carve(layer: Layer, center: Point, velocity: number[], travel: number, final: boolean) {
    const r = CURSOR_RADIUS;
    const lower = Math.max(0, Math.floor((center.x - r - layer.x) / COLUMN));
    const upper = Math.min(layer.count - 1, Math.floor((center.x + r - layer.x) / COLUMN));
    if (lower > upper) return;
    const local = layer.y - center.y;
    const speed = Math.hypot(velocity[0], velocity[1]);
    const sprayShare = smoothstep(60, 420, speed);
    let pushedLeft = 0, pushedRight = 0;

    for (let i = lower; i <= upper; i++) {
      const x = layer.centerX(i);
      const dx = x - center.x;
      const reach = r * r - dx * dx;
      if (reach <= 0) continue;
      const half = Math.sqrt(reach);
      const bedLevel = -layer.bed[i];
      const bottom = Math.max(0, local - half - bedLevel);
      const top = local + half - bedLevel;
      if (top <= bottom) continue;
      const h = layer.h[i];
      const buried = h > top;
      if (final && !buried && h >= bottom - 1) layer.held[i] = 1;
      if (h <= bottom + 0.01) continue;
      // A buried cursor only displaces the snow it sweeps through; the rest rests on top of it.
      const removed = buried ? (top - bottom) * Math.min(1, travel / (2 * r)) : h - bottom;
      if (removed <= 0.001) continue;
      layer.h[i] = Math.max(0, h - removed);
      const area = removed * COLUMN;
      const surface = layer.floorY(i) - (buried ? h - removed : h);
      const sprayed = sprayShare > 0 ? this.emit(area * sprayShare, [x, surface], center, velocity) : 0;
      const side = Math.abs(velocity[0]) > 40 ? velocity[0] : dx;
      if (side < 0) pushedLeft += area - sprayed;
      else pushedRight += area - sprayed;
    }
    for (const [area, x] of [[pushedLeft, center.x - r - COLUMN * 3], [pushedRight, center.x + r + COLUMN * 3]]) {
      if (area <= 0) continue;
      const missed = layer.deposit(area, x);
      this.dropPast(layer, missed, x, velocity[0] * 0.5);
    }
  }

  emit(area: number, [ox, oy]: number[], center: Point, [vx, vy]: number[]) {
    if (area <= 0.6 || this.grains.length >= MAX_GRAINS) return 0;
    const count = Math.min(4, Math.floor(area / 1.6) + 1);
    const share = area / count;
    const speed = Math.hypot(vx, vy);
    const offX = ox - center.x, offY = oy - center.y;
    const length = Math.hypot(offX, offY);
    const outX = length > 0.001 ? offX / length : 0;
    const outY = length > 0.001 ? offY / length : -1;
    for (let k = 0; k < count; k++) {
      const scale = rand(0.55, 1.25), push = speed * rand(0.05, 0.25);
      this.grains.push({
        x: ox + rand(-1, 1),
        y: oy - rand(0, 2),
        vx: vx * scale + outX * push + rand(-30, 30),
        vy: vy * scale + outY * push - speed * rand(0.02, 0.2) + rand(-40, 20),
        area: share,
        size: Math.min(4.2, Math.max(1.1, Math.sqrt(share) * 1.05)),
      });
    }
    return area;
  }

  // MARK: Drawing

  draw() {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.pile.program);
    gl.bindVertexArray(this.pileVAO);
    const u = this.pile.uniforms;
    gl.uniform2f(u.uView, this.width, this.height);
    gl.uniform1f(u.uScale, this.dpr);
    gl.uniform1f(u.uTime, this.time % 1000);
    gl.uniform1i(u.uHeights, 0);
    gl.activeTexture(gl.TEXTURE0);
    for (const layer of this.layers) {
      if (layer.top <= 0.05) continue;
      // Ledges scrolled out of view keep melting but aren't drawn.
      if (layer.y + layer.bedDepth < 0 || layer.y - layer.top - 2 > this.height) continue;
      let texture = this.textures.get(layer);
      if (!texture) {
        texture = gl.createTexture()!;
        this.textures.set(layer, texture);
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, layer.count, 2, 0, gl.RED, gl.FLOAT, layer.write());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.uniform1i(u.uCount, layer.count);
      gl.uniform2f(u.uOrigin, layer.x, layer.y);
      gl.uniform4f(u.uRect, layer.x, layer.y - layer.top - 2, layer.x + layer.width, layer.y + layer.bedDepth);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    const total = this.flakes.length + this.grains.length + this.motes.length;
    if (!total) return;
    if (this.spriteData.length < total * 5) this.spriteData = new Float32Array(Math.ceil(total * 1.5) * 5);
    const data = this.spriteData;
    let k = 0;
    for (const f of this.flakes) {
      data[k++] = f.x; data[k++] = f.y; data[k++] = f.size; data[k++] = f.alpha; data[k++] = f.soft;
    }
    for (const g of this.grains) {
      data[k++] = g.x; data[k++] = g.y; data[k++] = g.size; data[k++] = 0.95; data[k++] = 0.3;
    }
    for (const m of this.motes) {
      const t = m.age / m.life;
      data[k++] = m.x; data[k++] = m.y; data[k++] = m.size * (1 + t);
      data[k++] = m.alpha * Math.min(1, m.age / 0.06) * Math.pow(1 - t, 1.5); data[k++] = 1;
    }
    gl.useProgram(this.sprite.program);
    const s = this.sprite.uniforms;
    gl.uniform2f(s.uView, this.width, this.height);
    gl.uniform1f(s.uScale, this.dpr);
    gl.bindVertexArray(this.spriteVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, k), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, total);
    gl.bindVertexArray(null);
  }
}

// MARK: - Page

/// Starts snow over the viewport: it piles on `root`'s [data-ledge] elements and along `root`'s bottom.
/// Returns a function that stops it.
export function startSnow(root: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
  if (!gl) return () => {};
  let scene: Scene;
  try {
    scene = new Scene(root, canvas, gl);
  } catch (error) {
    console.warn('Snow disabled:', error);
    return () => {};
  }

  let pointer: Point | null = null;
  let last = 0;
  let raf = 0;
  const frame = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    scene.step(dt, pointer);
    scene.draw();
    raf = requestAnimationFrame(frame);
  };
  const onResize = () => scene.resize();
  const onMove = (event: PointerEvent) => { pointer = { x: event.clientX, y: event.clientY }; };
  const onLeave = () => { pointer = null; };
  // A hidden tab pauses requestAnimationFrame; restart the clock so the first frame back isn't one huge step.
  const onVisibility = () => { last = 0; };

  scene.resize();
  scene.track();
  raf = requestAnimationFrame(frame);
  addEventListener('resize', onResize);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('blur', onLeave);
  document.documentElement.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('resize', onResize);
    removeEventListener('pointermove', onMove);
    removeEventListener('blur', onLeave);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
