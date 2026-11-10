/**
 * Runtime measurements (scroll progress, plan geometry, ...) stored as CSS custom properties.
 *
 * Values are written through the CSSOM (`el.style.setProperty`). That is cheap, and it stays
 * valid under a strict Content-Security-Policy (only style attributes in markup are blocked,
 * not CSSOM writes). Static styles belong in the stylesheet; only values computed at runtime
 * go through here.
 *
 * `data-layout-vars` is set on every element that has runtime values, because a few
 * Tailwind rules key off `[data-layout-vars]` (e.g. the hero film).
 */
const used = new WeakMap(); // node -> Set of custom property names we have written

export function setLayoutVars(node, values) {
  if (!node) return;
  let names = used.get(node);
  if (!names) {
    names = new Set();
    used.set(node, names);
    node.dataset.layoutVars = "";
  }
  const style = node.style;
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith("--")) {
      throw new Error("Runtime layout values must be CSS custom properties");
    }
    if (value == null || value === "") {
      style.removeProperty(name);
      names.delete(name);
      continue;
    }
    const next = String(value);
    if (style.getPropertyValue(name) !== next) style.setProperty(name, next);
    names.add(name);
  }
}

export function clearLayoutVars(node) {
  const names = node && used.get(node);
  if (!names) return;
  names.forEach((name) => node.style.removeProperty(name));
  used.delete(node);
  delete node.dataset.layoutVars;
}

/** React callback ref: React detaches the previous ref before applying new values. */
export function layoutVars(values) {
  let current;
  return (node) => {
    if (current && current !== node) clearLayoutVars(current);
    current = node;
    if (node) setLayoutVars(node, values);
  };
}
