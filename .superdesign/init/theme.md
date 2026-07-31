# Theme

## Compact token summary

- Framework: static HTML; no component library
- CSS: vanilla CSS in `styles.css`
- Page shell: centered, `width: 100%`, `max-width: 640px`, clipped overflow
- Breakpoint: `480px`
- Colors: platinum `#F0F4F8`, navy `#0A2D54`, blue `#0063A6`, green `#43A64E`, slate `#64748B`
- Font stack: `Pretendard`, `Noto Sans KR`, system UI fallbacks
- Body typography: `15px`, line-height `1.7`
- Headings: h1 `clamp(1.5rem, 5vw, 2rem)`; h2 `1.75rem`; h3 `1.125rem`
- Desktop section padding: `56px 40px`; narrow section padding: `44px 24px`
- Border radii: pill `999px`, actions `8px`, account card `16px`
- Interactive target: actions have `min-height: 44px`
- Map: block image, full content width, intrinsic aspect ratio, no border

## Raw source

### `styles.css`

```css
:root {
  --platinum: #F0F4F8;
  --navy: #0A2D54;
  --blue: #0063A6;
  --green: #43A64E;
  --slate: #64748B;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--slate);
  color: var(--navy);
  font-family: "Pretendard", "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 15px;
  line-height: 1.7;
}

.invitation-shell { width: 100%; max-width: 640px; margin: 0 auto; overflow: hidden; background: var(--platinum); }
#intro-section { position: relative; overflow: hidden; padding: 72px 48px 76px; background: var(--slate); }
#intro-section::before {
  position: absolute;
  inset: 4px;
  content: "";
  background:
    radial-gradient(circle at 50% 38%, rgba(240, 244, 248, .62) 0%, rgba(10, 45, 84, .10) 54%, rgba(10, 45, 84, .36) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, .18) 0%, rgba(10, 45, 84, .18) 100%),
    url("img/reflection_background.png") center / cover no-repeat;
  filter: contrast(1.12) saturate(.85);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .92),
    inset 0 -36px 60px rgba(10, 45, 84, .17),
    inset 12px 0 24px rgba(10, 45, 84, .06),
    0 6px 18px rgba(10, 45, 84, .32);
}
#intro-section::after {
  position: absolute;
  inset: 4px;
  z-index: 1;
  border: 1px solid rgba(10, 45, 84, .14);
  content: "";
  pointer-events: none;
}
.intro-content { position: relative; z-index: 2; text-align: center; }
.brand-logo { display: block; width: min(200px, 70%); height: auto; margin: 0 auto 28px; }
h1, h2, h3, p { margin-top: 0; }
h1 { margin-bottom: 26px; color: var(--navy); font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; letter-spacing: -.04em; line-height: 1.45; }
h2 { margin-bottom: 28px; font-size: 1.75rem; line-height: 1.3; }
h3 { margin-bottom: 4px; color: var(--navy); font-size: 1.125rem; }
#event-details { margin: 0 auto 56px; text-align: center; }
#event-details p { margin: 0; }
.event-pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; background: var(--slate); color: var(--platinum); font-size: .75rem; letter-spacing: -.03em; line-height: 1.4; white-space: nowrap; }
.event-icon { color: var(--green); }
.invitation-message { max-width: 420px; margin: 0 auto; font-size: .9375rem; line-height: 2; }
.content-section, .account-section { padding: 56px 40px; }
.content-section { background: var(--platinum); }
.profile-section { padding-top: 40px; }
.profile-heading { margin: 0 -40px 32px; padding: 10px 40px; background: var(--navy); color: var(--platinum); font-size: 1.25rem; text-align: left; }
.profile-grid { display: grid; grid-template-columns: minmax(120px, .85fr) minmax(0, 1.35fr); gap: 24px; align-items: center; }
.portrait, .map-image { display: block; width: 100%; height: auto; }
.portrait { object-fit: contain; }
.eyebrow { margin-bottom: 8px; color: var(--blue); font-weight: 700; }
.career-list { margin: 0; padding-left: 18px; font-size: .9375rem; line-height: 1.7; }
.directions, .account-section { position: relative; }
.directions { background: var(--platinum); color: var(--navy); }
.directions::before, .account-section::before {
  position: absolute;
  top: 0;
  right: 40px;
  left: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(10, 45, 84, .18) 8%, rgba(10, 45, 84, .42) 20%, rgba(10, 45, 84, .42) 80%, rgba(10, 45, 84, .18) 92%, transparent 100%);
  content: "";
}
.directions h2 { color: var(--navy); font-size: 1.75rem; text-align: center; }
.map-image { margin-bottom: 20px; border: 0; }
address { margin-bottom: 16px; font-size: 1rem; font-style: normal; }
.transit { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 1rem; }
.transit img { width: 1.5rem; height: auto; }
.map-link, #copy-account-number { display: flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.0625rem; font-weight: 700; }
.map-link { background: var(--green); color: var(--platinum); text-decoration: none; }
.parking-notice { margin: 18px 0 0; padding: 14px; background: var(--navy); color: var(--platinum); font-size: .875rem; text-align: center; }
.account-section { background: var(--platinum); color: var(--navy); }
.account-card { padding: 28px 20px; border: 1px solid var(--blue); border-radius: 16px; background: var(--platinum); }
.account-message { margin-bottom: 0; text-align: center; color: var(--navy); font-size: 1.1rem; }
.account-card dl { margin: 24px 0; padding-top: 20px; border-top: 1px solid var(--blue); }
.account-card dl > div { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; }
.account-card dd { margin: 0; font-weight: 700; }
.account-card dl > div:nth-child(2) dd { color: var(--navy); font-size: 1.15rem; }
#copy-account-number { width: 100%; border: 0; background: var(--navy); color: var(--platinum); cursor: pointer; }
#copy-status { min-height: 1.7em; margin: 12px 0 0; color: var(--navy); text-align: center; }
.map-link:focus-visible { outline: 3px solid var(--navy); outline-offset: -3px; }
#copy-account-number:focus-visible { outline: 3px solid var(--green); outline-offset: -3px; }

@media (max-width: 480px) {
  #intro-section { padding: 56px 24px 64px; }
  #intro-section::before {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .92),
      inset 0 -28px 48px rgba(10, 45, 84, .15),
      inset 8px 0 18px rgba(10, 45, 84, .05),
      0 4px 12px rgba(10, 45, 84, .28);
  }
  .content-section, .account-section { padding: 44px 24px; }
  .profile-section { padding-top: 32px; }
  .directions::before, .account-section::before { right: 24px; left: 24px; }
  .profile-heading { margin-right: -24px; margin-bottom: 24px; margin-left: -24px; padding: 9px 24px; }
  .profile-grid { grid-template-columns: 1fr; gap: 20px; }
  .portrait { width: min(180px, 100%); margin: 0 auto; }
  .career-list { font-size: .875rem; }
  .account-card dl > div:nth-child(2) dd { flex-shrink: 0; white-space: nowrap; }
}
```
