import { useId, useState } from "react";
import { Dash, Kicker, Logo } from "./Brand.jsx";
import { AMENITIES, CARE, CONTACT, CREDS, DAY, FAQ } from "../data/content.js";
import mapImg from "../assets/img/map.webp";
import sketch from "../assets/img/sketch.webp";
import md from "../assets/img/md.webp";
import logoFull from "../assets/img/logo-full.webp";
import { useScrollTo } from "../hooks/SmoothScroll.jsx";

const pad = (n) => String(n).padStart(2, "0");

export function Care() {
  return (
    <section className="sec" id="care">
      <div className="wrap">
        <Kicker className="rv">Designed for senior living</Kicker>
        <h2 className="h2 rv">
          A home that considers <em>the years ahead.</em>
        </h2>
        <Dash />
        <div className="care-grid rv">
          {CARE.map(([h, p]) => (
            <div className="cg" key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
        {/* "Also built in" amenities: hidden for now. Uncomment to bring it back.
        <div className="amen">
          <h3 className="rv">Also built in</h3>
          <div className="chips rv">
            {AMENITIES.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </div>
        */}
      </div>
    </section>
  );
}

export function Day() {
  return (
    <section className="day sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Kicker className="rv">A day, your way</Kicker>
        <h2 className="h2 rv">
          Fill it. <em>Or don't.</em>
        </h2>
        <Dash />
        <div className="day-row">
          {DAY.map(([t, h, p, w], i) => (
            <div
              className="moment rv"
              style={{ "--d": `${i * 0.06}s` }}
              key={t}
            >
              <span className="dot">{t}</span>
              <h3>{h}</h3>
              <p>{p}</p>
              <span className="where">{w}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Tick = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
);

export function LocationProgress() {
  return (
    <section className="sec loc">
      <div className="wrap loc-grid">
        <div>
          <Kicker className="rv">Location & connectivity</Kicker>
          <p className="loc-big rv">
            Freedom Living keeps you conveniently connected to{" "}
            <em>
              Palakkad Town, healthcare facilities, transport links, and
              everyday essentials.{" "}
            </em>
          </p>
          <address className="rv">
            <b>Close to the city. Connected to everyday life.</b>
            <span>Mattumantha Junction, Malampuzha Road, Palakkad</span>
          </address>
          <div className="rv" style={{ marginTop: 28 }}>
            <a
              className="btn ghost"
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google Maps <span className="arr">↗</span>
            </a>
          </div>
        </div>
        <a
          className="map map-link wipe"
          href={CONTACT.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Freedom Living on Google Maps"
        >
          <img
            src={mapImg}
            alt="Map showing Freedom Living within 3 km of Palakkad town, railway station, KSRTC bus stand and Government Medical College Hospital"
          />
        </a>
      </div>

      <div className="wrap" style={{ marginTop: "clamp(40px,4.5vw,72px)" }}>
        <div className="prog-grid">
          <div>
            <Kicker className="rv">Construction update</Kicker>
            <h2 className="h2 rv">
              Already
              <br />
              <em style={{ whiteSpace: "nowrap" }}>taking Shape</em>
            </h2>
            <Dash />
            <p className="lead rv" style={{ marginTop: 30 }}>
              Construction is underway at Freedom Living, with the basement,
              ground floor, and first floor completed.
            </p>
          </div>
          <div className="prog-img wipe">
            <img
              src={sketch}
              alt="Sketch of the completed lower floors of the building"
              loading="lazy"
            />
          </div>
          <ul className="checks rv" aria-label="Construction status by level">
            <li className="todo">
              <span className="c" />
              Rooftop
            </li>
            <li className="todo">
              <span className="c" />
              Floors 2 to 4
            </li>
            <li className="done">
              <span className="c">
                <Tick />
              </span>
              First floor
            </li>
            <li className="done">
              <span className="c">
                <Tick />
              </span>
              Ground floor
            </li>
            <li className="done">
              <span className="c">
                <Tick />
              </span>
              Basement
            </li>
            <li className="eta">
              <span>
                <b>December 2027</b>Expected completion
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Vision() {
  return (
    <section className="vision sec">
      <div className="wrap vision-grid">
        <div className="vision-head">
          <Kicker className="rv">Led by experience and community trust</Kicker>
          <p className="vq rv">
            In a society where people enjoy very little freedom, and even that
            fades as we grow older, this is my attempt to create a place where
            elders feel free, cared for, connected, and completely at home.
          </p>
        </div>
        <div style={{ paddingBottom: "clamp(64px,8vw,120px)" }}>
          <div className="who rv">
            <b>Er. K. M. Rahamadulla</b>
            <span>
              Managing Director, Palghat Senior Living Ltd. · NIT Calicut
              alumnus, builder, chartered engineer and valuer
            </span>
          </div>
          <ul className="creds rv">
            {CREDS.map(([b, s], i) => (
              <li key={i}>
                <i>{pad(i + 1)}</i>
                <div>
                  <b>{b}</b>
                  <span>{s}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="md wipe">
          <img
            src={md}
            alt="Portrait of Er. K. M. Rahamadulla"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`faq-item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="faq-q"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {q}
        <span className="pm" aria-hidden="true" />
      </button>
      <div className="faq-panel" id={id} role="region" aria-hidden={!open}>
        <div className="faq-inner">
          <div className="ans">{a}</div>
        </div>
      </div>
    </div>
  );
}

export function FamiliesFaq() {
  return (
    <section className="sec" id="faq">
      <div className="wrap fam-grid">
        <div>
          <Kicker className="rv">For sons and daughters, near and far</Kicker>
          <h2 className="h2 rv">
            In Bengaluru, Dubai or Boston?{" "}
            <em>Your parents can still be home.</em>
          </h2>
          <Dash />
        </div>
        <div className="rv">
          {FAQ.map(([q, a]) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* footer icons */
const FIco = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const IcoPin = () => (
  <FIco>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </FIco>
);
const IcoPhone = () => (
  <FIco>
    <path d="M5.2 3.5h3l1.6 4.2-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4.2 1.6v3a2 2 0 0 1-2.2 2A17.3 17.3 0 0 1 3.2 5.7a2 2 0 0 1 2-2.2Z" />
  </FIco>
);
const IcoMail = () => (
  <FIco>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </FIco>
);
const IcoLayers = () => (
  <FIco>
    <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5Z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
  </FIco>
);

export function Footer() {
  const scrollTo = useScrollTo();
  const go = (e, h) => {
    e.preventDefault();
    scrollTo(h);
  };
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-top">
          <div className="ft-brand">
            <img
              className="ft-logo"
              src={logoFull}
              alt="Freedom Living"
              width="900"
              height="245"
              loading="lazy"
              decoding="async"
            />
            <p className="ft-tag">Live free. Age gracefully.</p>
          </div>

          <div className="ft-col">
            <h4>
              <span className="ft-badge">
                <IcoPin />
              </span>
              Visit
            </h4>
            <a
              className="ft-addr"
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mattumantha Junction
              <br />
              Malampuzha Road, Palakkad
            </a>
          </div>

          <div className="ft-col">
            <h4>
              <span className="ft-badge">
                <IcoPhone />
              </span>
              Talk to us
            </h4>
            <a
              className="ft-line"
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
            >
              <IcoPhone />
              <span>{CONTACT.phone}</span>
            </a>
            <a className="ft-line" href={`mailto:${CONTACT.email}`}>
              <IcoMail />
              <span>{CONTACT.email}</span>
            </a>
          </div>

          <div className="ft-col">
            <h4>
              <span className="ft-badge">
                <IcoLayers />
              </span>
              Explore
            </h4>
            <nav className="ft-links" aria-label="Footer">
              {[
                ["#plans", "Floor plans"],
                ["#building", "The building"],
                ["#care", "Care"],
                ["#visit", "Book a visit"],
              ].map(([h, l]) => (
                <a key={h} href={h} onClick={(e) => go(e, h)}>
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="ft-base">
          <span>
            © 2026 Palghat Senior Living Ltd. <span className="ft-dot">·</span>{" "}
            RERA No. <span className="pending">to be added</span>
          </span>
          <em>
            Renders, plans and areas are indicative and may change during
            construction.
          </em>
        </div>
      </div>
    </footer>
  );
}
