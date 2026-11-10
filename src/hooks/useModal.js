import { useEffect, useRef } from "react";

const FOCUSABLE =
  'button:not([disabled]), input:not([tabindex="-1"]), textarea, [tabindex="0"]';

/**
 * Behaviour shared by the modal dialogs: lock page scroll while open, move focus to the close
 * button and give it back afterwards, and keep Tab inside the panel.
 *
 * Returns refs for the panel and close button plus a `trap` keydown handler for the panel.
 */
export function useModal(open) {
  const panel = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const html = document.documentElement;
    const wasLocked = html.classList.contains("!overflow-hidden");
    html.classList.add("!overflow-hidden");
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      if (!wasLocked) html.classList.remove("!overflow-hidden");
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const trap = (e) => {
    if (e.key !== "Tab") return;
    const els = [...panel.current.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    );
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return { panel, closeBtn, trap };
}
