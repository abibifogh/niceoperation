# The Somewhere Nice field guide

A guest-facing travel guide for the hostel at 9 Cotton Avenue, Kokomlemle. It
covers Accra first, then the rest of Ghana, and it sorts everything by what a
guest says they are interested in and by how far it is from their bed.

One file, `public/index.html`. No build step, no framework, no dependencies.
Open it in a browser and it is exactly what goes live.

## What it does that a printed sheet cannot

| Feature | Why it is there |
| --- | --- |
| **Interest picker** | Ten interests, a trip length, a budget and a pace. Every place is scored against the combination, so a surfer and a Pan-Africanist get different lists from the same page. |
| **Two maps** | An Accra map and a Ghana map, drawn from real coordinates. The gold star is the hostel; the dashed rings are 2, 5, 10 and 20 km from the front gate, so "is this a walk or a bus?" is answered by looking. |
| **Distances that are computed** | Nothing says "about 30 minutes away". Every card carries a real great-circle distance from `HOME`, calculated in the browser. Move the hostel and all 71 numbers move with it. |
| **Getting there from *our gate*** | Every place has a transport line naming the station to walk to, what to shout at the mate, and the fare. This is the part guests actually ask reception for, and the part no other guide has. |
| **What's on today** | The strip under the masthead reads the device clock — Ghana keeps GMT year-round, so UTC *is* Accra time — and says something true for that hour and that day. Saturday at 1pm it points at the Jamestown walking tour. December it warns about Detty December. |
| **My trip** | A basket saved in `localStorage`, with a rough cost tally, a currency box the guest fills in with the day's rate, a shareable link (the trip is encoded in the URL hash) and a print stylesheet. |
| **Six routes** | The loops guests keep recommending to each other, day by day, with the hops and fares between them. |
| **Ground rules** | Money, tro-tros, stations, taxis, paperwork, health, phones, safety, haggling, manners, food, packing and costs. Plus twelve words of Twi, Ga and Ewe. |

It works offline. Once the page has loaded it makes **no network request of any
kind** — the three typefaces are embedded as subset WOFF2 data URIs. That is
deliberate: guests read this on one bar of signal in a tro-tro, and on hostel
wi-fi that is doing its best.

## Editing the content

Everything a person would want to change lives in four arrays near the top of
the `<script>` block at the bottom of `public/index.html`. Nothing else needs
touching.

| Array | Holds | Notes |
| --- | --- | --- |
| `TAGS` | The ten interests | `k` is the key used in each place's `t`, `c` is the colour it wears in every strip |
| `PLACES` | All 71 entries | See the field list below |
| `ROUTES` | The six itineraries | Each has `legs`, and each leg has a day, a name, a paragraph and a `hop` |
| `MONTHS` | The calendar table | Twelve entries: weather, verdict, what's on |

### Adding a place

Copy an existing entry in `PLACES` and change it. The fields:

```js
{ id:"wli",                       // unique, lowercase, used in share links
  n:"Wli Waterfalls",             // name
  a:"Wli, near Hohoe",            // the area line above the name
  r:"volta",                      // region key, must exist in REGIONS
  lat:7.1200, lon:0.5920,         // real coordinates — the map and every
                                  // distance are computed from these
  t:["hike","wild"],              // interest keys; the first one sets the
                                  // pin colour, all of them make the strip
  d:1,                            // days it eats: 0.15 quick stop … 2.5 Mole
  cost:80,                        // foreigner entry in GHS, 0 if free
  tr:200,                         // rough return transport from the hostel
  star:3,                         // 3 unmissable, 2 strong, 1 if you have time
  when:"June–October for volume",
  why:"…",                        // the paragraph on the card
  how:"…",                        // station, fare, how long — from our gate
  tip:"…" }                       // the thing only someone who works here knows
```

The place count in the hero (`71 places, checked`) is written by JavaScript
from `PLACES.length`, so it stays correct on its own.

### Changing where the hostel is

One line, at the top of the script:

```js
var HOME = { lat: 5.5722, lon: -0.2113, name: "Somewhere Nice, 9 Cotton Ave" };
```

Every distance, every "away" figure, the star on both maps and all four
distance rings are derived from it.

### The maps

The outlines are simplified polygons stored as coordinate arrays
(`GHANA_BORDER`, `ACCRA_COAST`, `VOLTA_LAKE`, the road corridors). The
projection is equirectangular, which is accurate enough at Ghana's latitude
that a circle drawn in degrees is still a circle on screen. Pin positions are
never adjusted for looks — if two pins overlap, it is because the places do.

To reframe a map, edit `VIEWS`:

```js
accra: { lon0:-0.42, lon1:0.06, lat0:5.44, lat1:5.72, w:1000, h:583, rings:[2,5,10,20] }
```

Keep `w / (lon1 - lon0)` equal to `h / (lat1 - lat0)` or the distance rings
will come out as ellipses.

## Checking prices before a season

The numbers were verified in August 2026 and the footer says so. Ghanaian
entry fees, bus fares and opening hours move; the guide is written so that
being roughly right is enough, but the ones worth re-checking each year are
the national monuments (Nkrumah Park, the castles, Kakum, Mole) and the coach
fares to Kumasi and Tamale. They are all in `PLACES` as `cost` and `tr`, and
in the `how` and `why` text.

## Publishing

Hosted the same way as the rest of this repository, as its own Cloudflare
project so that it and niceoperation.com can never take each other down:

- Project name: `hostelaccra-guide`
- Build command: *(leave empty)*
- Deploy command: `npx wrangler deploy --config guide/wrangler.jsonc`
- Custom domain: `guide.hostelaccra.com`

From a working copy:

```bash
npx wrangler login
npx wrangler deploy --config guide/wrangler.jsonc
```

It is also a single self-contained file, so it can be dropped straight into
the existing hostelaccra.com — as a page, in a subfolder, or emailed to a
guest as an attachment that still works with the plane's wi-fi off.

## The design, briefly

The look comes from two things a guest sees on the walk to Circle: kente
strip-weaving, where narrow bands are woven separately and sewn edge to edge,
and hand-painted tro-tro destination boards.

- The weave is the only rule used between chapters, and each place card wears
  one band per interest it satisfies — so the edge of a card tells you what it
  is before you have read a word.
- Transport directions are set as a destination board: mono, uppercase, gold
  on near-black.
- Bricolage Grotesque for display, Karla for reading, IBM Plex Mono for fares,
  distances and station names, because timetable data deserves timetable type.
- Light and dark are both designed, with a manual toggle that overrides the
  device. Light is the default: this gets read outdoors.

## What is deliberately not here

No analytics, no cookie banner, no third-party anything, no affiliate links
and no paid placements — the footer says so out loud, which is the only reason
a guest has to believe the recommendations. Nothing is claimed that cannot be
checked, and everything that moves (prices, dates, timetables) is labelled as
a sense of scale rather than a quotation.
