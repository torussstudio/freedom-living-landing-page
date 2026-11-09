import { useCallback, useEffect, useRef, useState } from "react";
import {
  prefersReducedMotion,
  useScrollFrame,
} from "../hooks/SmoothScroll.jsx";
import { SLIDES } from "../data/content.js";

/** Pinned horizontal gallery: vertical scroll drives the track sideways (desktop only). */
export default function Gallery() {
  const section = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const pinned = useRef(false);
  const [idx, setIdx] = useState(0); // centred card in the swipe strip (phones / small tablets)
  const total = SLIDES.length;

  /* Swipe strip: work out which card is nearest the middle of the screen. */
  const track_ = useCallback(() => {
    const t = track.current;
    if (!t || pinned.current) return;
    const tr = t.getBoundingClientRect();
    const mid = tr.left + tr.width / 2;
    let best = 0,
      dist = Infinity;
    [...t.children].forEach((el, i) => {
      if (!el.classList.contains("slide")) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setIdx(best);
  }, []);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(track_);
    };
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [track_]);

  const go = (i) => {
    const t = track.current;
    const el = t?.querySelectorAll(".slide")[Math.min(total - 1, Math.max(0, i))];
    if (!t || !el) return;
    const tr = t.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    t.scrollTo({
      left: t.scrollLeft + (r.left + r.width / 2) - (tr.left + tr.width / 2),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  /* Fit the whole pinned frame (header + renders + captions + progress bar) inside the
     viewport: measure what the header etc. take, give every render the height that is left,
     then size the scroll distance from the resulting track width. */
  const size = useCallback(() => {
    const s = section.current,
      t = track.current;
    if (!s || !t) return;
    const sticky = s.firstElementChild;
    // keep the 900 / 480 in step with the media query in global.css (.hgal strip fallback)
    pinned.current =
      window.innerWidth >= 900 &&
      window.innerHeight >= 480 &&
      !prefersReducedMotion();
    if (pinned.current) {
      const cs = getComputedStyle(sticky);
      const stickyH = sticky.clientHeight;
      const head = sticky.querySelector(".hgal-head").offsetHeight;
      const prog = sticky.querySelector(".hgal-progress").offsetHeight;
      const gap = parseFloat(cs.rowGap) || 0;
      // the tallest caption wins (some wrap to 2 lines when the slides get narrow), so measure
      // them all, and do it twice: shrinking --ph narrows the slides, which can wrap more captions
      const capMax = () =>
        [...t.querySelectorAll("figcaption")].reduce(
          (m, c) =>
            Math.max(
              m,
              c.offsetHeight + parseFloat(getComputedStyle(c).marginTop),
            ),
          40,
        );
      const fit = () =>
        Math.round(
          Math.min(
            720,
            Math.max(
              180,
              stickyH -
                parseFloat(cs.paddingTop) -
                parseFloat(cs.paddingBottom) -
                head -
                prog -
                gap * 2 -
                capMax(),
            ),
          ),
        );
      // shrinking --ph can only make captions taller, so this settles in a pass or two
      let ph = fit();
      for (let i = 0; i < 6; i++) {
        s.style.setProperty("--ph", `${ph}px`);
        const next = fit();
        if (next >= ph) break;
        ph = next;
      }
      s.style.setProperty("--ph", `${ph}px`);
      const extra = t.scrollWidth - window.innerWidth;
      s.style.height = `${stickyH + Math.max(0, extra)}px`;
    } else {
      s.style.height = "";
      s.style.removeProperty("--ph");
      t.style.transform = "";
    }
  }, []);

  useEffect(() => {
    size();
    window.addEventListener("resize", size);
    window.addEventListener("load", size);
    document.fonts?.ready.then(size); // header height changes once the web fonts land
    return () => {
      window.removeEventListener("resize", size);
      window.removeEventListener("load", size);
    };
  }, [size]);

  useScrollFrame(() => {
    if (!pinned.current) return;
    const s = section.current,
      t = track.current;
    const r = s.getBoundingClientRect();
    const total = s.offsetHeight - s.firstElementChild.clientHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    t.style.transform = `translate3d(${-p * (t.scrollWidth - window.innerWidth)}px,0,0)`;
    bar.current.style.width = `${p * 100}%`;
  });

  return (
    <section className="hgal" ref={section} aria-label="Architectural renders">
      <div className="hgal-sticky">
        <div className="wrap hgal-head">
          <div>
            <div className="kicker">
              <span>SPACES & AMENTIES</span>
            </div>
            <h2 className="h2">
              Spaces to live,<em> connect, and enjoy</em>
            </h2>
          </div>
          <p>
            A thoughtfully designed living environment where you can follow your
            own routines, spend time with others, and enjoy spaces for comfort,
            recreation, and companionship.
          </p>
        </div>
        <div className="track" ref={track}>
          {SLIDES.map((s, i) => (
            <figure
              className={`slide${s.tall ? " tall" : ""}${i === idx ? " is-active" : ""}`}
              key={`${s.title}-${i}`}
            >
              <div className="ph">
                <img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  style={s.pos ? { objectPosition: s.pos } : undefined}
                  onLoad={size}
                />
              </div>
              <figcaption>
                <b>{s.title}</b>
                <span>{s.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="wrap">
          <div className="hgal-progress">
            <i ref={bar} />
          </div>
          {/* phones / small tablets only (shown by CSS): counter, progress line, prev / next */}
          <div className="hgal-ctl">
            <span className="hgal-count" aria-live="polite">
              {String(idx + 1).padStart(2, "0")}
              <small>/ {String(total).padStart(2, "0")}</small>
            </span>
            <div className="hgal-line" aria-hidden="true">
              <i style={{ width: `${((idx + 1) / total) * 100}%` }} />
            </div>
            <div className="hgal-nav">
              <button
                type="button"
                aria-label="Previous image"
                disabled={idx === 0}
                onClick={() => go(idx - 1)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next image"
                disabled={idx === total - 1}
                onClick={() => go(idx + 1)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
