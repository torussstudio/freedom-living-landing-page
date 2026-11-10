import { useEffect, useRef } from "react";
import { prefersReducedMotion, useScrollFrame } from "../hooks/SmoothScroll.jsx";

/* The statement — edit the three lines here. The last line is drawn in gold. */
const LINES = [
  "A home of your own,",
  "with care just downstairs,",
  "and friends for evening tea.",
];
const GOLD_LINE = 2;

const FONT_FAMILY = '"Recife Display", Georgia, "Times New Roman", serif';
const CREAM = "#fff3dc";
const GOLD = "#f7d94c";
const CELL = 9; // dot-matrix cell size in px

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const hash = (i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Full-screen statement slide that is pinned while you scroll:
 * the text dissolves into a dot-matrix and drifts away, and comes back when you scroll up.
 * Falls back to a simple fade on small screens and to plain text for reduced-motion users.
 */
export default function DotStatement() {
  const secRef = useRef(null);
  const cvRef = useRef(null);
  const textRef = useRef(null);
  const st = useRef({}).current;

  useEffect(() => {
    const sec = secRef.current;
    const cv = cvRef.current;
    const text = textRef.current;
    let cells = null;
    let off = null;
    let dpr = 1;
    let w = 0;
    let h = 0;
    let lastP = -1;

    const progress = () => {
      const r = sec.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp(-r.top / span) : 0;
    };

    const draw = (p) => {
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const ta = 1 - smooth(0.14, 0.3, p);
      if (ta > 0.01) {
        ctx.globalAlpha = ta;
        ctx.drawImage(off, 0, 0, w, h);
      }
      const da = smooth(0.1, 0.26, p);
      if (da <= 0.01 || !cells) {
        ctx.globalAlpha = 1;
        return;
      }
      ctx.globalAlpha = da;
      const { x, y, cov, gold, hs, n } = cells;
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? GOLD : CREAM;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          if ((gold[i] ? 1 : 0) !== pass) continue;
          const delay = (x[i] / w) * 0.35 + hs[i] * 0.08;
          const q = clamp((p - 0.3 - delay) / 0.22);
          if (q >= 1) continue;
          const r = CELL * 0.5 * Math.sqrt(cov[i]) * (1 - q) * 0.92;
          if (r < 0.15) continue;
          const q2 = q * q;
          const px = x[i] + q2 * (hs[i] - 0.5) * CELL * 6;
          const py = y[i] - q2 * CELL * 4 * (0.4 + hs[i]);
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const update = () => {
      if (!st.ready) return;
      const p = progress();
      if (Math.abs(p - lastP) < 0.0004) return;
      lastP = p;
      if (st.mode === "canvas") draw(p);
      else if (st.mode === "fade") {
        text.style.opacity = String(1 - smooth(0.25, 0.7, p));
        text.style.transform = `translateY(${(-p * 36).toFixed(1)}px)`;
      }
    };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const mode = prefersReducedMotion()
        ? "static"
        : w >= 900 && h >= 480
        ? "canvas"
        : "fade";
      st.mode = mode;
      sec.dataset.mode = mode;
      text.style.opacity = "";
      text.style.transform = "";
      lastP = -1;
      if (mode === "canvas") {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);

        const m = document.createElement("canvas").getContext("2d");
        m.font = `300 100px ${FONT_FAMILY}`;
        const maxW = Math.max(...LINES.map((l) => m.measureText(l).width));
        const fs = Math.min((0.86 * w * 100) / maxW, 0.17 * h);
        const lh = fs * 1.14;
        const top = (h - lh * LINES.length) / 2;

        off = document.createElement("canvas");
        off.width = Math.round(w * dpr);
        off.height = Math.round(h * dpr);
        const o = off.getContext("2d");
        o.scale(dpr, dpr);
        o.font = `300 ${fs}px ${FONT_FAMILY}`;
        o.textAlign = "center";
        o.textBaseline = "middle";
        LINES.forEach((l, i) => {
          o.fillStyle = i === GOLD_LINE ? GOLD : CREAM;
          o.fillText(l, w / 2, top + lh * (i + 0.5));
        });

        // sample the text into a grid of cells (coverage + colour)
        const cols = Math.ceil(w / CELL);
        const rows = Math.ceil(h / CELL);
        const s = document.createElement("canvas");
        s.width = cols;
        s.height = rows;
        const sc = s.getContext("2d", { willReadFrequently: true });
        sc.drawImage(off, 0, 0, cols, rows);
        const d = sc.getImageData(0, 0, cols, rows).data;
        const gx = w / cols;
        const gy = h / rows;
        const cap = cols * rows;
        const x = new Float32Array(cap);
        const y = new Float32Array(cap);
        const cov = new Float32Array(cap);
        const hs = new Float32Array(cap);
        const gold = new Uint8Array(cap);
        let n = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const k = (r * cols + c) * 4;
            const a = d[k + 3] / 255;
            if (a < 0.08) continue;
            x[n] = (c + 0.5) * gx;
            y[n] = (r + 0.5) * gy;
            cov[n] = a;
            gold[n] = d[k + 2] < 150 ? 1 : 0;
            hs[n] = hash(n + 1);
            n++;
          }
        }
        cells = { x, y, cov, gold, hs, n };
      }
      st.ready = true;
      update();
    };

    st.update = update;
    build();

    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(build, 120);
    };
    window.addEventListener("resize", onResize);
    // rebuild once the display font is really available, so the dots match the final glyphs
    let alive = true;
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load(`300 100px ${FONT_FAMILY}`, LINES.join(" "))
        .then(() => alive && build())
        .catch(() => {});
    }
    return () => {
      alive = false;
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      st.ready = false;
    };
  }, [st]);

  useScrollFrame(() => st.update && st.update());

  return (
    <section className="dstate" ref={secRef} data-mode="canvas" aria-label="Our promise">
      <div className="dstate-pin">
        <canvas className="dstate-cv" ref={cvRef} aria-hidden="true" />
        <h2 className="dstate-text" ref={textRef}>
          {LINES.map((l, i) => (
            <span key={l} className={i === GOLD_LINE ? "g" : undefined}>
              {l}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
