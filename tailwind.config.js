/** Exact design values are intentional; do not enable Preflight on this migration. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
}
