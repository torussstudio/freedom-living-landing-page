import { useState } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../hooks/useModal.js";
import {
  IcoClose,
  isEmail,
  Req,
  Select,
  useFormState,
  useLeadSubmit,
} from "./formKit.jsx";

const CATEGORIES = [
  "Individual investor",
  "Business / Corporate investor",
  "NRI investor",
  "Other",
];
const EMPTY = { name: "", phone: "", email: "", category: "", message: "" };

const IcoLock = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path
      d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="4.5" y="10" width="15" height="11" rx="2.5" fill="currentColor" />
    <circle cx="12" cy="15" r="1.6" fill="var(--cream)" />
    <path
      d="M12 15.8v2.2"
      stroke="var(--cream)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
/**
 * Investor enquiry modal. It closes ONLY with the X button
 * (no backdrop click, no Escape key). A valid submit posts an "investor" lead to /api/lead
 * (Google Sheet + email) and shows a thank-you.
 */
export default function InvestorModal({ open, onClose }) {
  const { f, setF, errors, setErrors, set, setPhone, pick } = useFormState(EMPTY);
  const [hp, setHp] = useState("");
  const { panel, closeBtn, trap } = useModal(open);
  const { sending, sent, sendErr, send, reset } = useLeadSubmit();

  if (!open) return null;

  // closing starts the next visit with a fresh form
  const close = () => {
    setF(EMPTY);
    setErrors({});
    setHp("");
    reset();
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (sending) return;
    const err = {};
    if (!f.name.trim()) err.name = "Please tell us your name.";
    if (f.phone.length !== 10) err.phone = "Enter your 10-digit mobile number.";
    if (!isEmail(f.email.trim())) err.email = "Enter a valid email address.";
    if (!f.category) err.category = "Please choose an investor category.";
    setErrors(err);
    const first = ["name", "phone", "email", "category"].find((k) => err[k]);
    if (first) {
      document.getElementById(`inv-${first}`)?.focus();
      return;
    }
    send(
      {
        type: "investor",
        name: f.name.trim(),
        phone: `+91 ${f.phone}`,
        email: f.email.trim(),
        category: f.category,
        message: f.message.trim(),
        at: new Date().toISOString(),
      },
      hp,
    );
  };

  const heading = (
    <>
      <span className="kicker">Palghat Senior Living Limited</span>
      <h3 id="inv-title">Explore investment opportunities.</h3>
      <p className="inv-intro">
        Share your details and our team will contact you to discuss potential
        investment and shareholding opportunities.
      </p>
    </>
  );

  return createPortal(
    <div className="imodal" data-lenis-prevent>
      <div
        className="imodal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inv-title"
        ref={panel}
        onKeyDown={trap}
      >
        <button
          ref={closeBtn}
          type="button"
          className="imodal-x"
          aria-label="Close"
          onClick={close}
        >
          <IcoClose size={22} />
        </button>
        {sent ? (
          <div className="imodal-done" role="status">
            <span className="kicker">Received</span>
            <h3 id="inv-title">Thank you, {sent.name.split(" ")[0]}.</h3>
            <p>
              Our team will contact you on {sent.phone} to discuss investment
              and shareholding opportunities.
            </p>
            <button className="btn ghost" type="button" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <>
        <div className="imodal-head">{heading}</div>

          <form className="imodal-form" noValidate onSubmit={submit}>
            <input className="![position:absolute] ![left:-9999px] ![width:1px] ![height:1px] ![opacity:0]"
              type="text"
              name="company"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"

            />
            <div className="fr two">
              <div className="fld">
                <label htmlFor="inv-name">
                  Full name <Req />
                </label>
                <div className="ctl">
                  <input
                    id="inv-name"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={f.name}
                    onChange={set("name")}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <span className="err">{errors.name}</span>}
              </div>
              <div className="fld">
                <label htmlFor="inv-phone">
                  Phone / WhatsApp <Req />
                </label>
                <div className="ctl phone">
                  <span className="pre" aria-hidden="true">
                    +91
                  </span>
                  <input
                    id="inv-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Mobile number"
                    value={f.phone}
                    onChange={setPhone}
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && <span className="err">{errors.phone}</span>}
              </div>
            </div>

            <div className="fld">
              <label htmlFor="inv-email">
                Email address <Req />
              </label>
              <div className="ctl">
                <input
                  id="inv-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={set("email")}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <span className="err">{errors.email}</span>}
            </div>

            <div className="fld">
              <label htmlFor="inv-category">
                Investor category <Req />
              </label>
              <Select
                id="inv-category"
                label="Investor category"
                options={CATEGORIES}
                value={f.category}
                placeholder="Select investor category"
                shownClass="![padding-left:0]"
                popClass="![right:0]"
                invalid={!!errors.category}
                onChange={pick("category")}
              />
              {errors.category && (
                <span className="err">{errors.category}</span>
              )}
            </div>

            <div className="fld">
              <label htmlFor="inv-msg">
                Anything you&apos;d like to add? (optional)
              </label>
              <textarea
                id="inv-msg"
                placeholder="Your interest, ticket size, or any question"
                value={f.message}
                onChange={set("message")}
              />
            </div>

            <div className="go">
              <p className="fine">
                <IcoLock />{" "}
                <span>
                  We&apos;ll only use your details to contact you about
                  investment opportunities.
                </span>
              </p>
              <button
                className="btn"
                type="submit"
                disabled={sending}
                aria-busy={sending}
              >
                {sending ? "Sending…" : "Submit enquiry"}{" "}
                {!sending && <span className="arr">→</span>}
              </button>
            </div>
            {sendErr && (
              <p className="err imodal-err" role="alert">
                {sendErr}
              </p>
            )}
          </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
