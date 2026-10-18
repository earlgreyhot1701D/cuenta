---
name: Artisanal Baker Stationery
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#635d5a'
  on-secondary: '#ffffff'
  secondary-container: '#eae1dc'
  on-secondary-container: '#69635f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c1c'
  on-tertiary-container: '#848483'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#eae1dc'
  secondary-fixed-dim: '#cdc5c0'
  on-secondary-fixed: '#1f1b18'
  on-secondary-fixed-variant: '#4b4642'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Bodoni Moda
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: 0.08em
  headline-xl-mobile:
    fontFamily: Bodoni Moda
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: 0.06em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.05em
  headline-sm:
    fontFamily: Bodoni Moda
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: EB Garamond
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: EB Garamond
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  body-italic:
    fontFamily: EB Garamond
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.14em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system translates the tactile elegance of bespoke printed bakery stationery into an operational digital invoicing tool. Built for wholesale and boutique client commerce, the aesthetic balances heritage culinary craftsmanship with clear fiscal structure.

- **Brand Personality:** Artisanal, meticulous, dignified, and editorial. Evokes the physical intimacy of fresh parchment, pressed black ink, and baker's ledger documentation.
- **Target Audience:** Commercial kitchen operations, boutique café purchasers, wholesale restaurant accounts, and culinary founders managing high-volume, reliable billing.
- **Design Movement:** Printed Editorial Stationery. It rejects conventional SaaS software tropes—foregoing heavy border radiuses, saturated primary buttons, colored badges, and layered drop shadows in favor of crisp ink-on-paper contrast, dotted hairline rules, precise letterspacing, and warm blush card stock accents.

## Colors

The palette is strictly minimal and paper-authentic, maximizing legibility in busy kitchen environments, desktop accounting offices, and thermal or physical printouts.

- **Primary (`#111111`):** Deep carbon black ink used for heavy display titles, table data, active interactive states, and solid hairline underlines.
- **Secondary (`#EFE6E1`):** Warm blush/linen tint representing specialty paper stock. Used exclusively as an accent panel surface (e.g., baker contact signature block, highlight summary callouts, or active table rows).
- **Tertiary (`#555555`):** Muted charcoal ink reserved for secondary labels, table headers, metadata descriptors, and subtle invoice rules.
- **Neutral (`#FFFFFF`):** Pure unbleached sheet white, providing maximum contrast and a pristine stationery sheet canvas.
- **Rule Tone (`#222222`):** 1px dotted dividers emulate classic perforated receipt and ledger tear-sheets.

## Typography

The typographic hierarchy juxtaposes high-contrast editorial headline presence with historical book serifs and technical tracking.

- **Display & Title Roles (`Bodoni Moda`):** Emulates dramatic Art Deco and high-fashion display letterforms (such as Limelight), delivering unmistakable visual punch to the brand title mark and capitalized document identifier (`INVOICE`).
- **Body & Product Names (`EB Garamond`):** Traditional, readable serif honoring centuries of culinary menus and ledger printing. Handles item line names, client postal addresses, chef accreditation, and payment legalities.
- **Column Headers & Metadata (`Space Grotesk`):** Fixed-width, slightly technical geometric sans executed in tracked all-caps (`DESCRIPTION`, `QTY`, `PRICE`, `TOTAL`, `INVOICE #`). Ensures tabular numbers and structured column boundaries stay strictly aligned across variable viewport widths.

## Layout & Spacing

Layout conforms to standard printed paper proportions (Letter / A4 ratio containers) on desktop while gracefully collapsing down to single-column transactional lists on mobile touch devices.

- **Page Frame:** The outer container mimics an invoice sheet centered against a soft background or spanning full-bleed on mobile viewports. Canvas margins are generous (`2.5rem` desktop, `1rem` mobile) to echo stationery margins.
- **Grid Structure:** A 12-column tabular grid with `1.25rem` gutters governs the desktop layout. Line items allocate 6 columns to `DESCRIPTION`, 2 to `QTY`, 2 to `PRICE`, and 2 to `TOTAL`.
- **Rhythm & Rules:** Content groupings are demarcated through vertical cadence (`space-lg` to `space-xl`) and horizontal hairline dividers rather than card shells or background fills.
- **Mobile Reflow:** In mobile viewports, the tabular headers remain pinned in a compact 4-column micro-grid, or convert into stacked receipt cards with right-aligned numeric inputs ensuring rapid thumb operation.

## Elevation & Depth

This design system is strictly non-skeuomorphic and shadow-free. It intentionally replaces synthetic elevations with printed physical layers.

- **Zero Drop Shadows:** No blur radii or box-shadows appear under cards, dropdowns, or buttons. All surfaces rest flat on the z-axis.
- **Hairline Perforations:** Separation of ledger rows, totals, and invoice sections relies entirely on `1px dotted #222222` rules. These visual dividers establish rhythm without visual clutter.
- **Tonal Inset Panels:** Emphasis is achieved through flat tint blocks (`#EFE6E1`), emulating pasted stationery slips or stamped address blocks on raw paper stock.
- **State Feedback:** Hover and press states use clean inverted ink fills (`#FFFFFF` text over `#111111` background) or solid `1px solid #111111` borders, eliminating the need for floating elevations.

## Shapes

The design system adheres to crisp, unrounded geometry (`roundedness: 0`), evoking cleanly trimmed paper, stamped blocks, and straight-edge printing cuts.

- **Corner Radius:** `0px` across all containers, inputs, buttons, and decorative panels.
- **Bounding Boxes:** Signature blocks, summary sidebars, and input boundaries remain orthogonal and unsoftened.
- **Dotted Dividers:** Punctured dot elements provide the sole organic contrast to the right-angled layout.

## Components

### Buttons & Interactive Controls
- **Primary Action (Issue Invoice / Save):** Solid `#111111` background, `#FFFFFF` crisp text in `label-caps` tracking, `0px` border radius, minimum height of `48px` for reliable touch fidelity. Hover shifts to `#333333`.
- **Secondary Action (Print / Download PDF):** Transparent background with a `1px solid #111111` border, `#111111` text. On hover, fills solid `#111111` with `#FFFFFF` text.
- **Inline Row Actions (Add Line / Remove Item):** Underlined serif or tracked text button (`+ Add Item`), without container boxes.

### Table & Invoice Line Items
- **Header:** Uppercase tracked `Space Grotesk` (`label-caps`), bottom-bordered by a `1px dotted #222222` hairline rule.
- **Rows:** Minimum height of `44px`. Product name in `EB Garamond` regular, unit price and totals aligned right in tabular figures.
- **Footer Calculation:** Grand total block preceded by a `1px dotted #222222` rule, with `INVOICE TOTAL $` set in `Bodoni Moda` bold.

### Input Fields & Selectors
- **Stationery Inputs:** Underline-only design (`border-bottom: 1px solid #111111`) for inline fields such as Client Name, Date, and Invoice Number, preserving the feel of filled-out paper forms.
- **Quantity Adjuster:** Compact numeric input with 48px touch targets, centered monospaced/sans text, with `+` and `−` stepped controls framed in hairline borders.

### Tint Panels & Address Blocks
- **Stationery Callout Card:** Solid `#EFE6E1` blush fill, `0px` radius, padded with `space-md`. Contains bakery identity, Chef title, kitchen location, and contact metadata. No outer border or drop shadow.
- **Sign-off / Order Received Line:** A single bottom border rule (`1px solid #222222`) alongside the italicized serif descriptor `Order received by:` for physical or digital stylus capture.