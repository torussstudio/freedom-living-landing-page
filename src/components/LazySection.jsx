import { Suspense, useEffect, useRef, useState } from "react";

/**
 * Keeps a big below-the-fold section out of the first load.
 *
 * Until it is ready a placeholder with the section's `id` stands in for it (so anchor links such
 * as #plans still land in the right place). The section mounts, and its code is fetched, as soon
 * as the browser is idle or the placeholder gets within ~1500px of the viewport, whichever is first.
 */
export default function LazySection({ id, children }) {
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ready) return;
    const go = () => setReady(true);
    let io;
    if (typeof IntersectionObserver !== "undefined" && ref.current) {
      io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && go(), {
        rootMargin: "1500px 0px",
      });
      io.observe(ref.current);
    }
    let cancelIdle;
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(go, { timeout: 3000 });
      cancelIdle = () => window.cancelIdleCallback(handle);
    } else {
      const handle = setTimeout(go, 2500);
      cancelIdle = () => clearTimeout(handle);
    }
    return () => {
      io?.disconnect();
      cancelIdle();
    };
  }, [ready]);

  const placeholder = <div id={id} ref={ref} className="lazy-ph" aria-hidden="true" />;
  return ready ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder;
}
