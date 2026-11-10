import { useEffect, useRef, useState } from "react";
import { postLead } from "../lib/postLead.js";

/* Small shared pieces for the lead / investor / visit forms. */

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const digits10 = (s) => s.replace(/\D/g, "").slice(0, 10);

export const Svg = ({ children, size = 20, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    {children}
  </svg>
);
export const IcoClose = (p) => (
  <Svg strokeWidth="2" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IcoChevron = (p) => (
  <Svg strokeWidth="2.2" {...p}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Svg>
);
export const IcoCheck = (p) => (
  <Svg strokeWidth="2.4" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const Req = () => (
  <span className="req" aria-hidden="true">
    *
  </span>
);

/** Submit state for a form that posts a lead: `send(lead, honeypot)`, then read `sent` / `sendErr`. */
export function useLeadSubmit() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [sendErr, setSendErr] = useState("");
  const send = async (lead, honeypot = "") => {
    if (sending) return;
    setSending(true);
    setSendErr("");
    const r = await postLead(lead, honeypot);
    setSending(false);
    if (r.ok) setSent(lead);
    else setSendErr(r.message);
  };
  const reset = () => {
    setSent(null);
    setSendErr("");
  };
  return { sending, sent, sendErr, send, reset };
}

/** Form values + errors + the setters every form repeats. */
export function useFormState(initial) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const setPhone = (e) => setF((v) => ({ ...v, phone: digits10(e.target.value) }));
  /** for custom dropdowns: store the value and clear that field's error */
  const pick = (k) => (v) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };
  return { f, setF, errors, setErrors, set, setPhone, pick };
}

/**
 * Dropdown that reuses the site's .fpick / .ctl / .pop menu styling.
 * `Icon` adds a leading icon; `shownClass` / `popClass` tweak the label and menu.
 */
export function Select({
  id,
  value,
  options,
  placeholder,
  label,
  Icon,
  onChange,
  invalid,
  shownClass = "",
  popClass = "",
}) {
  const wrap = useRef(null);
  const btn = useRef(null);
  const list = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const close = (refocus) => {
    setOpen(false);
    if (refocus === true) btn.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);
  useEffect(() => {
    if (open) list.current?.children[active]?.focus({ preventScroll: true });
  }, [open, active]);

  const toggle = () => {
    if (!open) setActive(Math.max(0, options.indexOf(value)));
    setOpen((o) => !o);
  };
  const pickOption = (v) => {
    onChange(v);
    close(true);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pickOption(options[active]);
    } else if (e.key === "Tab") close();
  };
  const onBtnKey = (e) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="fpick" ref={wrap}>
      <button
        ref={btn}
        id={id}
        type="button"
        className={`ctl${Icon ? " ico" : ""}${value ? "" : " empty"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={toggle}
        onKeyDown={onBtnKey}
      >
        {Icon && <Icon size={22} className="lead-ico" />}
        <span className={`shown${shownClass ? ` ${shownClass}` : ""}`}>
          {value || placeholder}
        </span>
        <IcoChevron className="chev" />
      </button>
      {open && (
        <ul
          className={`pop menu${popClass ? ` ${popClass}` : ""}`}
          role="listbox"
          aria-label={label}
          ref={list}
          onKeyDown={onKey}
        >
          {options.map((v, i) => (
            <li
              key={v}
              role="option"
              tabIndex={-1}
              aria-selected={v === value}
              className={i === active ? "on" : ""}
              onMouseEnter={() => setActive(i)}
              onClick={() => pickOption(v)}
            >
              <span>{v}</span>{" "}
              {v === value && <IcoCheck size={18} className="tick" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
