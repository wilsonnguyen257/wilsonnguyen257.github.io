---
version: alpha
name: Anê Thành
description: Vietnamese Catholic parish website (Cộng Đoàn Công Giáo Việt Nam Anê Thành, Melbourne) — public site, reflections, events, and admin dashboard, in Vietnamese and English.

colors:
  primary: "#0D324D"
  secondary: "#61656C"
  tertiary: "#7F5A83"
  neutral: "#ECEDEF"
  surface: "#F6F7F8"
  on-surface: "#020202"
  border: "#D7D9DC"
  subtle: "#DCC2E0"
  success: "#3F6144"
  error: "#874A34"

typography:
  display:
    fontFamily: "Playfair Display"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Playfair Display"
    fontSize: 38px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: "Playfair Display"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.25
  body-lg:
    fontFamily: "Be Vietnam Pro"
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: "Be Vietnam Pro"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Be Vietnam Pro"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  nav-link:
    fontFamily: "Be Vietnam Pro"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
  label-caps:
    fontFamily: "Be Vietnam Pro"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.10em

rounded:
  none: 0px
  sm: 8px
  md: 16px
  lg: 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 24px
  margin: 48px

components:
  page:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  hero:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.display}"
    padding: "{spacing.xl}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  divider-signature:
    backgroundColor: "{colors.tertiary}"
    width: 2px
    height: 48px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "#0A2740"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-give:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.surface}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-give-hover:
    backgroundColor: "#6A4A6E"
    textColor: "{colors.surface}"
  nav-link-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  input-error:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
  badge-season:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
  icon-roundel:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    size: 36px
  footer:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    padding: "{spacing.xl}"
---

# Anê Thành

## Overview

This is a parish website: read by grandparents checking Mass times on a phone, by ban mục vụ (parish council) volunteers logging in from a shared laptop to post an event, and by a teenager searching last Sunday's gospel reflection between classes. Vietnamese is the default language, English a toggle away, and every typeface decision downstream of that has to survive full Vietnamese diacritics (ẳ, ữ, ộ, ế) — not just render them, but hold their proportions and weight the way they would in print.

The direction is a cool, quiet palette built from five sourced colors — Black, Deep Space Blue, Dusty Lavender, Dusty Mauve, and Cool Steel — replacing the earlier warm Vietnamese Heritage (sơn mài red / temple gold) treatment. The structural discipline that direction established stays: flat surfaces, one accent with one job, a hierarchical radius scale, generous density. What changes is the temperature — ink-dark blue in place of lacquer red, a muted dusty violet in place of temple gold, cool steel-tinted paper in place of warm rice paper. The button shape, the heading voice, and the "one accent, one job" rule are unchanged; only the hues and the story behind them are new.

What this direction gives up, deliberately: **warmth**. The earlier palette was explicitly sourced from Vietnamese lacquerware and communal iconography; this one is not — it's a considered, contemporary cool palette without that specific cultural narrative attached. That's a real trade worth naming, not something to paper over with a retrofitted backstory. It also gives up density: this is still an unhurried register, not a dashboard one, so the admin screens should feel like a calmer version of the public site rather than a bare utility panel bolted on the side (the two must never diverge again — see Do's and Don'ts).

## Colors

The palette is a fixed, given set of five colors — Black, Deep Space Blue, Dusty Lavender, Dusty Mauve, Cool Steel — plus tints and shades derived from them to cover the roles the five alone don't reach (light page/card backgrounds, hairline borders, and the success/error feedback states, neither of which appears in the source five). Every derived ramp holds the anchor color's hue constant and only moves lightness/saturation, so each family still reads as one pigment rather than an arbitrary gradient.

- **Primary (#0D324D — Deep Space Blue):** carries every primary interaction: links, primary buttons, the active nav state, focus rings. 12.4:1 against the page surface — enormous headroom, which is why it never needs a second, lighter "link blue"-style variant. One blue does the whole job.
- **Tertiary (#7F5A83 — Dusty Lavender):** the accent, and it has exactly one job: the Give/donate action and liturgical-season highlight badges. It appears nowhere else — not on headings, not on generic tags — because an accent that's everywhere stops reading as an accent and starts reading as "the site's purple." Dusty Mauve (#A188A6, the fifth sourced color) sits one step lighter in the same ramp (`accent-300`) — used only for hover/press states on accent-colored chips and borders, never standing in for the accent itself.
- **Secondary (#61656C):** a cool, desaturated mid-gray derived from Cool Steel, one step up from the darkest neutral. Used only for metadata: dates, authorship, footer copy. About 5.0:1 on the card surface — recessive without disappearing.
- **Neutral (#ECEDEF) and Surface (#F6F7F8):** two cool off-whites a half-step apart, both derived from Cool Steel (#9DA2AB, which itself sits mid-ramp as `slate-400`). Surface is the page ground, Neutral is the half-step-deeper stock used for cards, the footer, and the admin sidebar. Neither is pure white — there is no `#FFFFFF` anywhere in this system.
- **On-surface (#020202 — Black):** all body text and headings sit in this color. About 19.5:1 against the page surface — maximal headroom, deliberate for a readership that skews older.
- **Border (#D7D9DC):** a light Cool-Steel tint, used exclusively as the fill of the 1px `divider` component — hairlines separate, they don't enclose.
- **Subtle (#DCC2E0):** a light tint off the accent ramp, used only as the fill behind `badge-season` chips — never as a background of its own.
- **Success (#3F6144):** a dusty sage, invented to sit alongside the given five rather than importing stock `#22C55E` — it's desaturated and cool enough to belong in this family instead of reading as a generic UI green. Confirmation states only (RSVP received, message sent).
- **Error (#874A34):** a dusty terracotta, likewise invented — warm enough to be unmistakably distinct from the primary blue and the lavender accent at a glance, but still muted enough to belong in this palette rather than reading as a stock red alert. About 6.4:1 on the surface color.

## Typography

Two faces, split by classification, both already vetted for full Vietnamese diacritic support at every weight used.

**Playfair Display** carries the voice — display and both headline levels, set at 700 only. A high-contrast transitional serif with the dramatic thick-thin stroke of missal and hymnal lettering; at 56px it reads as a title page, not a SaaS hero. It is used at exactly one weight because the whole point of choosing a serif this expressive is the shape contrast against the sans below it — a second Playfair weight would just be indecision wearing a costume. Self-hosted from Google Fonts (already wired into `index.html`); fallback `"Playfair Display", Georgia, serif`. SIL Open Font License.

**Be Vietnam Pro** carries the apparatus — body copy, navigation, labels, buttons — at 400 (body) and 600 (nav, labels, emphasis). It was designed specifically for the Vietnamese market with full diacritic coverage as a first-class concern rather than a retrofitted subset, which is the actual reason it's here over a more common humanist sans: this is the one typographic decision in the system with a hard functional requirement behind it, not just a taste call. Fallback `"Be Vietnam Pro", -apple-system, "Segoe UI", Roboto, sans-serif`.

**Before adopting any third face for a future section** (e.g. a numerals face for event countdowns), test it against `ẳ ữ ộ ế Đ` at the target size and weight. A face that looks fine in the Latin alphabet can still clip diacritic marks or misalign tone marks in Vietnamese — this has already been the deciding factor once (Be Vietnam Pro over the system sans stack) and should stay the standing test.

The scale runs on roughly a 1.35 editorial ratio from 56px down to 12px, hand-broken so `display` and `headline-lg` sit clearly apart rather than one ratio-step from each other. Tracking is optical: −0.02em at display, neutral through body, +0.10em on the uppercase `label-caps` level. Line height moves inversely with size, 1.05 at display to 1.65 at `body-lg`.

## Layout

The site stays on the existing 4px-based spacing scale and the existing `max-w-7xl` centered container — that infrastructure was already sound and doesn't need re-deriving. Marketing and devotional content (home hero, About, page headers) stays **symmetric and centered**, which is the right register for a communal, welcoming institution; this is the one place this system deliberately does *not* reach for asymmetry, because a parish homepage that feels like it's making an editorial argument would be the wrong tone.

Reflection and gospel-reading content is capped at **~68 characters** measure — it is read start to finish, often at length, and the current uncapped prose width in `ReflectionDetail` should be fixed to this cap.

One signature layout device: a **2px vertical accent rule** (`divider-signature`, 48px tall, centered, in the Dusty Lavender accent color) marking a major transition — between the hero and the events strip on the homepage, for instance. It is used at most once per page. Sprinkled more often than that it stops being a landmark and becomes wallpaper.

Density stays even and generous throughout the public site — this is not a dashboard and never wants to feel like one. The admin dashboard is the one place a **denser** rhythm (tighter `spacing.sm` row padding in data tables) is appropriate, and even there it should sit on the same color and type tokens as the public site, not fall back to unstyled defaults.

## Elevation & Depth

The interface is flat by default: cards and buttons carry **no resting shadow**, only a 1px `border`-colored hairline. This was already the right instinct in the existing codebase and stays. What changes is that the on-hover shadow (previously neutral black at low opacity) is now tinted from `on-surface` — `rgba(30, 26, 24, 0.08)` rather than `rgba(0, 0, 0, 0.06)` — so that even a shadow reads as ink, not as generic UI chrome.

Elevation is reserved for things that are genuinely floating above the page: the gallery lightbox, dropdown menus, and toast confirmations get a real shadow (two layers — a tight dark one and a wider soft one, both ink-tinted) because they are actually above other content. A static card is not, and should not borrow their shadow to look important.

**Retire `.hover-lift`.** Its translate-and-scale-up-on-hover contradicts the rest of the system's restraint — nothing else in this design moves position on hover, only color. Any element currently using it should drop to a plain color/border transition instead.

## Shapes

Radius is **hierarchical, and this is the biggest structural break from the previous system**: buttons are no longer full pills. The pill (`rounded.full`) is reserved for a specific class of object — avatars, the logo mark, social icon roundels (`icon-roundel`), and pill-shaped status chips (`badge-season`, `badge-success`) — echoing the circular moon-gates and gongs of Vietnamese temple architecture, where a true circle marks something as a distinct, symbolic object rather than a generic container.

Everything else steps down: inputs and small controls at `rounded.sm` (8px), buttons at `rounded.md` (16px), cards and panels at `rounded.lg` (24px). Chips are the one deliberate exception to "chips follow control radius" — they use `rounded.full` specifically because a season badge or a success confirmation is meant to read as a small, complete object, the same symbolic register as the roundels.

Borders are 1px solid in `{colors.border}` at rest, 1px solid in `{colors.primary}` on focus, with a 2px offset focus ring in `{colors.primary}` (clears 3:1 against both `surface` and `neutral`).

## Components

**Buttons.** `button-primary` (Deep Space Blue fill, paper text) is the general-purpose primary action — "Submit," "Learn more," "RSVP." `button-give` is chromatically and structurally identical in every way *except* color: Dusty Lavender fill, paper text (not ink — Dusty Lavender is dark enough that ink text falls below WCAG AA contrast) — and it is the **only** place the accent appears as a button. Never style a second button with the accent color; if something else needs to stand out, give it more space or move it higher on the page, not a second accent. `button-secondary` is text-on-paper with a `{colors.primary}` 1px border (described here since `borderColor` isn't a tokenizable sub-token) — used for "Cancel" and secondary navigation actions.

**Nav.** `nav-link-active` is a pill only because it is functioning as a status indicator (which link is current), consistent with the "circle = symbolic object" rule above — it is not a general button shape creeping back in.

**Cards.** `neutral` fill, 24px radius, a 1px `border` hairline, no resting shadow — the tonal half-step plus the hairline is what separates a card from the page. Only a card that is itself a link takes the ink-tinted hover shadow; a static card never does, since the shadow would promise a click that isn't there. Used for genuinely discrete records: one event, one reflection preview, one ministry.

**Inputs.** `surface` fill, 8px radius, `body-md` type at full size (people fill these out on phones, in dim rooms after a Sunday evening Mass — 16px avoids the mobile-Safari zoom-on-focus behavior that a smaller size triggers). `input-error` swaps text to `error` and must always ship with an inline message and the standard error icon — never a color change alone.

**Badges.** `badge-season` marks a liturgical-season or festival highlight (accent-tinted, Dusty Lavender). `badge-success` marks a completed action (sage-filled). Both are pills, both are `label-caps` type, and both should be rare enough on a page that seeing one means something.

**Admin dashboard.** Every token above applies identically in `/admin/*`. The dashboard is not a separate visual product — the recent work to bring the admin forms in line with the public site's look is the correct direction and this file is what "in line" now means concretely.

## Do's and Don'ts

- **Do** keep the Dusty Lavender accent (`tertiary`, #7F5A83) exclusively on the Give action and season badges. The moment it appears on a third kind of element, it stops reading as a deliberate accent and starts reading as "the site's purple."
- **Don't** put `rounded.full` on a button. Full circles are reserved for avatars, the logo, icon roundels, and status/season chips — a button that becomes a pill again is this design reverting to the system it replaced.
- **Do** test any new typeface against `ẳ ữ ộ ế Đ` before adopting it, at the actual size and weight it will ship at. This system has exactly two vetted faces (Playfair Display, Be Vietnam Pro); a third needs to clear the same bar.
- **Don't** add a resting shadow to a card, button, or section. Flat + hairline border is the system; shadow is reserved for the lightbox, dropdowns, and toasts, which are the only things actually floating above the page.
- **Do** limit the vertical accent `divider-signature` rule to at most one per page. It's a landmark, not a decoration.
- **Don't** introduce a second gray scale. Every neutral in this system traces back to the Cool-Steel-derived `slate-*` ramp — an ad-hoc hex or an unrelated gray next to them will look like a bug, not a choice.
- **Do** cap reflection and gospel-reading body text at ~68 characters measure.
- **Don't** encode event status (cancelled, sold out, happening now) with color alone — pair it with a label or icon. Status should always be readable without relying on color perception at all.
- **Do** hold the admin dashboard to the exact same tokens as the public site — same radius scale, same shadow rules, same type. It should never visibly diverge again.
- **Don't** retire `.hover-lift` by deleting the class and leaving call sites broken — replace each usage with the plain color/border hover transition before removing it.
