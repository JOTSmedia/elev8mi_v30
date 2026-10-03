# ELEV8MI v32

ELEV8MI-preview-v27.html (project folder) is the older v27 offline preview and
was not rebuilt for v28; preview v28 by serving website/ locally
(e.g. `python3 -m http.server` inside website/).
Upload the CONTENTS of website/ to the root of your existing GitHub repository,
replacing matching files. Include assets/, vendor/, favicon.ico and all CSS/JS.
No installation or build step is required.

## v32 changes (booking and payment)

- Sound menu order: Guitar, Cello, Violin, Piano, Harp, Singing Bowl, Tone. Tone is still the default.
- New "Book a personalized reading" section under the card draw (`booking.js`, `booking.css`): name, email, question and a choice of One Card Pull ($11.11) or 5 Card Story ($22.22, up to 5 cards; the story includes an expansion of card 1 based on your question). The email to Allison names the reading and its price.
- After the booking is sent (or the email draft opens), the visitor goes to the payment link for their reading. Until the links are pasted in, it says the payment link is coming soon and Allison will email them.
- Link preview image and favicons replaced (see below).
- Cache param is now ?v=32.

### Activating bookings and payments

1. Web3Forms key: paste it into `form-config.js` (replace `PASTE-WEB3FORMS-ACCESS-KEY-HERE`). The same key powers both the reading form and the booking form. Until then both forms open an email draft instead.
2. Payment links: in Stripe, create two Payment Links ($11.11 and $22.22) and paste their `https://buy.stripe.com/...` URLs into `payment-config.js`, replacing `PASTE-STRIPE-LINK-1111` and `PASTE-STRIPE-LINK-2222`. PayPal payment links also work.
3. Re-upload `form-config.js` and `payment-config.js`.

### Link preview and icons

- Link preview image: `og-image.jpg` (1200x630, the hero scene at sunrise). The `og:image`, `og:url` and `twitter:image` tags use absolute URLs on https://www.elev8mi.com/. If the site goes live on a different address first (for example a github.io path), update those absolute URLs in `index.html` (and the canonical link) to that address, or previews will not show the image.
- Icons, made from the star-and-crescent mark of the ELEV8MI logo: `favicon.ico` (16, 32, 48), `favicon-16x16.png`, `favicon-32x32.png` and `apple-touch-icon.png` (180x180). The site has no web manifest, so none was added.

## v31 changes (Sun and Moon)

- Earth's Moon is larger and closer to Earth: disc 42 -> 58 px (50 px on phones), orbit width 36% -> 27% of the scene, orbit height 90 -> 70 px (60 -> 48 in short landscape).
- The rising/setting Sun is larger: 24-42 px -> 34-62 px, with a stronger glow.
- The sunrise/sunset horizon glow is wider, warmer and a little brighter to match the bigger Sun. Other planets and moons are unchanged. Cache param is now ?v=31.

## v30 changes (mobile nav)

- Mobile top nav no longer overlaps: logo, 528 Hz pill, sound dropdown, play and menu buttons stay clear at 320–430 px portrait and in phone landscape (568x320 to 932x430).
- Compacting on small screens: the wave icon is hidden at 480 px and below, the "528 Hz" text is hidden at 400 px and below, the logo shrinks a little, and gaps are tighter. The sound label shortens with an ellipsis if needed.
- Sound dropdown: tap targets are 40 px or more, and the menu always opens fully on-screen. In short landscape screens it uses two columns.
- Desktop layout (wider than 960 px) and the gold nav lines are unchanged. Cache param is now ?v=30.

## v29 changes
- Nav indicator lines are brand gold (`--gold` tokens). On desktop both lines
  park exactly over and under the active link's text (re-measured on resize,
  font load, layout changes and scroll-spy updates); with no active section
  they keep looping. In the mobile menu the active link gets gold lines over
  and under its text.
- The 528 Hz pill has a sound dropdown (Tone + instruments), keyboard and
  screen-reader accessible (menu button, Arrow/Home/End/Enter/Escape).
- "Send your reading to Allison" form in the interpretation dialog
  (Web3Forms). The mailto draft stays as the fallback.

## Sound menu: adding an instrument (one line)
Add `{id:'<slug>',label:'<Name>'}` to `instruments` in `sound-config.js` and
upload `elev8mi-528hz-<slug>.ogg` and `.mp3` next to index.html. Files are
normalised to about -18 LUFS and share `sharedGain`; the Tone drone is set to
the same loudness. Listed instruments whose files are missing are hidden.

## Direct send form (Web3Forms): one-time activation
1. Open https://web3forms.com, enter elev8miangel@gmail.com, and create an
   access key. Web3Forms emails the key to that inbox.
2. In `form-config.js`, replace `PASTE-WEB3FORMS-ACCESS-KEY-HERE` with the key
   and re-upload `form-config.js`.
Until then, Send opens the visitor's email app with the same filled-in draft.
The form sends the name, email, optional question, reading style, and each
card's position, name, Upright/Reversed and image link. It has a honeypot
(`botcheck`) field.

## v28 changes
- Brighter, more vivid Earth (shader + CPU fallback), starfield and planets.
- Major moons orbit their planets: Phobos/Deimos, Io/Europa/Ganymede/Callisto,
  Rhea/Titan, Titania/Oberon, Triton (retrograde). Shaded toward the Sun;
  display orbits and time are compressed (period^0.5); they freeze with
  Pause motion and prefers-reduced-motion. Code: planet-moons.js.
- Nav item and hero CTA read "Tap into your energy". One- and three-card
  spreads both open the "Let Allison interpret your cards" email prompt.
- Inquiries go to elev8miangel@gmail.com via a mailto draft listing each
  card's position, name, Upright/Reversed and a link to its deck image. No
  form service (mailto cannot attach files); the dialog also offers
  "Download my cards" (a PNG of the drawn cards) the visitor may attach.
- Instagram @elev8mi and www.elev8mi.com
  are linked in the contact section and footer; canonical/og URLs use
  https://www.elev8mi.com/.
- Sound: the tuner pill has a Tone/Guitar choice. Guitar plays the seamless
  528 Hz loop (elev8mi-528hz-guitar.ogg/.mp3, CC0, see AUDIO-LICENSE.md).

## Swappable deck (custom 78-card art)
The custom ELEV8MI deck (600x1050 WebP, JPG fallbacks, one shared back.webp;
see assets/deck/deck.json and LICENSES.md) is installed in `assets/deck/`.
Card images load per card from `assets/deck/`, configured in `deck-config.js`
(`basePath`, `extension`, `version`). File names are listed in
`assets/deck/FILENAMES.txt`: `major-00-the-fool` … `major-21-the-world`
(slug of the site's card name, e.g. `major-12-the-hanged-one`),
`<suit>-01-ace` … `<suit>-10-ten`, `-11-page`, `-12-knight`, `-13-queen`,
`-14-king` for cups/wands/swords/pentacles, plus `back.webp`. Any file that is
missing falls back to the built-in atlas (tarot-atlas.webp), so cards can be
added gradually. Bump `version` when replacing files. With
`emailImageLinks:'auto'` the email draft lists a link per card to its image in
assets/deck/, built from the page's current address (works on a GitHub Pages
subpath and on www.elev8mi.com), for cards whose file actually loaded.

## Earlier changes (v27)
- Navigation uses translucent purple, blue and white glass with soft reflections.
  The rounded mobile dropdown matches the header.
- Two light trails loop continuously around the actual rounded pill perimeter,
  half a lap apart: top moves right and curves around to travel left below.
  They keep looping after link clicks and preserve their lap on screen resize.
  Pause motion and reduced motion freeze them in place.
- The nine face-down Draw cards are visible immediately, dimmed and disabled.
  Choosing a reading style shuffles and lights them up. Style, spread and shuffle
  remain editable until the first card is picked, then lock until completion.
  Reading options use uppercase Cinzel lettering. Instructions match this flow.
- Mobile orbits use a shallower oblique camera and a wider plane with real
  perspective, instead of tall loops. Foreground Earth remains an enlargement;
  the miniature mobile orbital plane is framed independently of that landmark.
- Moon and planet halos are brighter, with a softer outer bloom. Live Moon
  phase, Sun/Moon light directions, body spin and the shared pulse clock remain.
- Logo-based ICO/PNG favicons, an Apple touch icon and a 1200x630 share image
  are included. Open Graph and social-card metadata reference the GitHub Pages
  homepage and the versioned logo thumbnail. Upload these assets before sharing.

The existing Earth surface/weather animation, night opening, loader, subtle
complete orbit paths, curved Earth occlusion and interpretation dialog remain.
Earth surface rotation is six minutes; the Moon/daylight display cycle is
85.714 seconds. The interpretation email stays a reviewable mailto draft to
elev8miangel@gmail.com, with subject INTERPRET MY CARDS and selected cards.

Radial distances, sizes, camera framing and time are cinematic display scales.
Earth maps are historical satellite composites. Other globes use illustrative
photographs. Moon phase uses the device date. Credits/licenses are in assets/
and vendor/. This package is for manual upload; it does not deploy or send email.
