/**
 * Runtime measurements for Tailwind's arbitrary-value utilities.
 * Static styles belong in Tailwind. Only values computed by scrolling, resizing,
 * or plan geometry are stored here, without adding inline style attributes.
 */
let sheet;
let serial = 0;
const entries = new Map();

function runtimeSheet() {
  if (sheet) return sheet;
  if ('adoptedStyleSheets' in document && 'replaceSync' in CSSStyleSheet.prototype) {
    sheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } else {
    // Compatibility for older browsers; this sheet contains only runtime variables.
    const element = document.createElement('style');
    element.dataset.layoutVariables = '';
    document.head.appendChild(element);
    sheet = element.sheet;
  }
  new MutationObserver(() => {
    for (const node of entries.keys()) if (!node.isConnected) clearLayoutVars(node);
  }).observe(document.documentElement, { childList: true, subtree: true });
  return sheet;
}

export function setLayoutVars(node, values) {
  if (!node) return;
  let entry = entries.get(node);
  if (!entry) {
    const target = runtimeSheet();
    const id = `layout-${++serial}`;
    node.dataset.layoutVars = id;
    // The ID branch gives runtime variables the precedence of the old inline
    // values over normal component rules, without changing selector matches.
    const index = target.insertRule(`:is(#__freedom_runtime__, [data-layout-vars="${id}"]) {}`, target.cssRules.length);
    entry = target.cssRules[index];
    entries.set(node, entry);
  }
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith('--')) throw new Error('Runtime layout values must be CSS custom properties');
    if (value == null || value === '') entry.style.removeProperty(name);
    else if (entry.style.getPropertyValue(name) !== String(value)) entry.style.setProperty(name, String(value));
  }
}

export function clearLayoutVars(node) {
  const entry = entries.get(node);
  if (!entry) return;
  const index = Array.from(sheet.cssRules).indexOf(entry);
  if (index !== -1) sheet.deleteRule(index);
  entries.delete(node);
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
