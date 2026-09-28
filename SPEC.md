# Kettle on-device — spec

Same numbers as [`scry-playground`](https://github.com/scryorg/scry-sample-rn)'s Kettle web
Storybook (`SPEC.md` there is the canonical source; this file mirrors it so both builds stay in
sync). This repo is the on-device (Expo + React Native) twin: a small coffee-ordering app whose
Storybook stories exist so Scry's `capture rn` adapter (capture-sources PR 6) and the Figma
comparisons at `okiwUTcdKlV1PmUtbuHjvZ` have a mobile fixture, not a real product.

No images, no icons, no emoji: every visual is a `View`/`Text` rectangle, circle or string, so
it renders the same shapes here as it does on the web and in Figma. One font: **Inter**
(Regular 400, Medium 500, Semi Bold 600, Bold 700), bundled via `@expo-google-fonts/inter` —
no system font fallback. Letter spacing 0 everywhere. All sizes in dp (RN's density-independent
px, same numbers as the web build's CSS px).

## Tokens

| Token | Value | Use |
|---|---|---|
| `bg` | `#FBF7F2` | screen background |
| `surface` | `#FFFFFF` | cards, stepper, secondary button |
| `ink` | `#2B1D14` | primary text |
| `muted` | `#7A6A5E` | secondary text |
| `line` | `#EADFD3` | 1px borders and dividers |
| `espresso` | `#3B2A20` | primary button fill |
| `caramel` | `#B8621B` | prices |
| `tile-flat-white` | `#C89F7A` | |
| `tile-cold-brew` | `#5A3B2A` | |
| `tile-matcha` | `#8FA876` | |
| `tile-cortado` | `#A9744F` | |

Radii: card 16, tile 12, hero 20, button 14, stepper 22 (pill). See `src/tokens.ts`.

## Names — these drive Suggest links, do not change them

Same story ids as the web build, so a Figma layer matches both builds' stories:

| Storybook title | Story export (name) | Story id | Figma layer |
|---|---|---|---|
| `Components/Button` | `Primary` | `components-button--primary` | component set **Button**, variant `Variant=Primary` |
| `Components/Button` | `Secondary` | `components-button--secondary` | component set **Button**, variant `Variant=Secondary` |
| `Components/MenuItem` | `Default` | `components-menuitem--default` | component **MenuItem** |
| `Components/QuantityStepper` | `Default` | `components-quantitystepper--default` | component **QuantityStepper** |
| `Screens/Menu` | `Default` | `screens-menu--default` | top-level frame **Menu** |
| `Screens/Item Detail` | `Default` | `screens-item-detail--default` | top-level frame **Item Detail** |
| `Screens/Order` | `Default` | `screens-order--default` | top-level frame **Order** |

Every other story in this repo (long labels, the other three menu items, boundary counts,
shorter menus/orders — see `README.md`'s story table) is a new id, added for adapter/UAT
coverage; it does not exist on the web build and does not map to a Figma layer.

## Components

### Button (`src/components/Button.tsx`)
- Height 52, width fills its container (350 inside screens; the component stories render it at
  width 350 via a decorator). Radius 14. Label centred, Inter Semi Bold 16, line height 20.
- **Primary:** fill `espresso`, label `#FFFFFF`, no border.
- **Secondary:** fill `surface`, 1px border `line`, label `ink`.
- Story args: Primary label `Add to order`; Secondary label `Add more`.

### MenuItem (`src/components/MenuItem.tsx`)
- 350 × 88. Fill `surface`, 1px border `line`, radius 16. Padding 16. Horizontal row, gap 14,
  items vertically centred.
- Left: tile 56 × 56, radius 12, fill = the item's tile colour; centred inside it a circle
  24 × 24, fill `#FFFFFF` at 35% opacity.
- Middle (fills remaining width): name Inter Semi Bold 16 / 22 `ink`; below it, gap 2,
  description Inter Regular 13 / 18 `muted`, single line (`numberOfLines={1}`, RN has no
  CSS `white-space: nowrap`).
- Right: price Inter Semi Bold 15 / 20 `caramel`.
- Story args (`Default`): Flat White · "Double ristretto, silky milk" · $4.50 · `tile-flat-white`.

### QuantityStepper (`src/components/QuantityStepper.tsx`)
- 128 × 44 pill: fill `surface`, 1px border `line`, radius 22. Three cells in a row, no gaps:
  minus cell 44 × 44, count cell 40 × 44, plus cell 44 × 44.
- Minus and plus are drawn, not typed: a bar 14 × 2, radius 1, fill `ink`, centred in its cell
  (absolute-positioned at `left:15,top:21`); the plus adds a second bar 2 × 14 crossing it
  (`left:21,top:15`).
- Count: Inter Semi Bold 16 / 20 `ink`, centred. Story arg (`Default`): count 1.

## Screens — all 390 × 844, fill `bg`, horizontal padding 20 (content width 350)

Each screen's root `View` carries `testID="scry-root"` (`src/Screen.tsx`) — the crop target for
the `capture rn` adapter and this repo's own `scripts/capture-stories.mjs`.

### Menu (`src/screens/Menu.tsx`)
- y 56: title `Menu`, Inter Bold 28 / 34 `ink`.
- y 94: subtitle `Order ahead, skip the line`, Inter Regular 15 / 20 `muted`.
- y 138: MenuItems stacked, gap 12 (four by default at y 138, 238, 338, 438):
  1. Flat White · Double ristretto, silky milk · $4.50 · `tile-flat-white`
  2. Cold Brew · Steeped 18 hours, over ice · $4.75 · `tile-cold-brew`
  3. Matcha Latte · Ceremonial grade, oat milk · $5.25 · `tile-matcha`
  4. Cortado · Equal parts espresso and milk · $4.00 · `tile-cortado`
- y 758: Button Primary, label `View order · 2 items`.

### Item Detail (`src/screens/ItemDetail.tsx`)
- y 56: `Back`, Inter Medium 15 / 20 `muted`.
- y 92: hero 350 × 220, radius 20, fill = the item's tile colour; centred circle 96 × 96,
  `#FFFFFF` at 35% opacity.
- y 332: item name, Inter Bold 26 / 32 `ink`.
- y 368: price, Inter Semi Bold 18 / 24 `caramel`.
- y 404: description, width 350, Inter Regular 15 / 22 `muted`, two lines exactly, rendered as
  two `Text` elements so both builds break at the same place (Flat White's copy is the spec's:
  "A double ristretto with steamed whole milk," / "poured thin so the coffee still leads.").
- y 480: a 350 × 44 row: `Quantity` Inter Medium 15 / 20 `ink` on the left, vertically centred;
  QuantityStepper (count 1) right-aligned.
- y 758: Button Primary, label `Add to order · <price>`.

### Order (`src/screens/Order.tsx`)
- y 56: `Your order`, Inter Bold 28 / 34 `ink`.
- y 94: `Pickup at Kettle on 5th St · ready in 8 min`, Inter Regular 15 / 20 `muted`.
- y 138: card 350 wide, fill `surface`, 1px border `line`, radius 16, padding 16 left/right.
  Rows 56 tall each, separated by a 1px `line` divider spanning 318:
  - left `Flat White` Inter Semi Bold 16 / 22 `ink`, gap 8, `×1` Inter Regular 15 / 20 `muted`;
    right `$4.50` Inter Semi Bold 15 / 20 `ink`
  - `Cold Brew` · `×1` · `$4.75`
  Default card height 113 (56 + 1 + 56).
- y 275: totals block, width 350, three rows 28 tall each: `Subtotal` / `$9.25` and `Tax` /
  `$0.76`, both Inter Regular 15 / 20 `muted`; then `Total` / `$10.01`, Inter Bold 17 / 22 `ink`
  (fixed to the two-line default order — the `OneItem`/`ThreeItems` stories relabel the rows
  rather than recompute real totals).
- y 694: Button Secondary `Add more`.
- y 758: Button Primary `Place order`.

## Capture determinism (`src/capture.ts`)

- `testID="scry-root"` on every component and screen root — the adapter's crop target.
- `EXPO_PUBLIC_SCRY_CAPTURE=1` turns off Pressable/Android-ripple touch feedback, so two
  captures of the same story are pixel-identical.
- Fixed fonts (`@expo-google-fonts/inter`), no network images (there are none — every visual
  here is a drawn rectangle/circle/text, same as the web build), light mode only, en-US.
