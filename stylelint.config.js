/** @type {import('stylelint').Config} */
export default {
  // Lint only our hand-written SCSS. The `styles/vellum/*` design-system source
  // is `.css` (not matched by the `**/*.scss` lint glob) and is intentionally
  // exempt — it's where raw values are allowed to live.
  customSyntax: "postcss-scss",
  rules: {
    // Push consumers toward the design tokens. Both checks match the *whole*
    // value (anchored), so the pervasive `var(--token, #fallback)` form is fine —
    // only a BARE literal trips them.
    "declaration-property-value-disallowed-list": [
      {
        // No hardcoded px font-size — use a --fs-* token.
        "font-size": ["/^[0-9.]+px$/"],
        // No hardcoded hex as a color value — use a color token. Custom-property
        // definitions (e.g. `--gold-bright: #...`) don't end in `color`, so token
        // sources stay allowed.
        "/color$/": ["/^#[0-9a-fA-F]{3,8}$/"],
      },
      {
        message:
          "Use a design token, not a bare literal (--fs-* / a color token). `var(--token, #fallback)` is fine; for a deliberate exception add `// stylelint-disable-line declaration-property-value-disallowed-list` with a reason.",
      },
    ],
  },
};
