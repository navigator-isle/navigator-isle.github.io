# Google Play listing – ready to paste

## Main store listing
**App name** (max 30 characters)
`Passage Planner – Ship Routes`  (29)

**Short description** (max 80)
`Berth-to-berth passage planning, waypoint actions, ETA, UKC & sailing calculators`  (80)

**Full description** (max 4000)
```
Passage Planner is a planning aid for deck officers and masters. Plan a berth-to-berth passage on your phone, tablet or laptop – even offline at sea.

PASSAGE PLANNING
• Route between 1,000+ world ports (UN/LOCODE search) through straits, canals and traffic separation schemes
• Great circle, rhumb line and composite sailing – set Start GC / End GC on any waypoint
• Import and check RTZ routes from your ECDIS; export RTZ
• Emission control areas (ECA / DECA), special areas, PSSAs, speed-restriction zones, VTS areas and high-risk areas marked on the chart with entry / exit waypoints
• Berth-to-berth summary with ECA legs for the fuel change-over plan

WAYPOINT ACTION POINTS
• Bridge checklist actions at every waypoint and on every leg, with regulation references (SOLAS, COLREG, MARPOL, STCW, ISPS)
• Pilot outbound / inbound, COSP / EOSP, position-fixing intervals, ECDIS safety settings, UKC, 12 nm and 50 nm points, echo sounder, ECA notices to the engine room, VTS reports, NAVAREA and Inmarsat-C ocean-region changes, ship's clocks and date line
• Parallel-index lines with the reference, distance and side for coastal legs
• Your own notes per waypoint

CALCULATORS
• ETA (berth to berth, pilot to pilot, speed-restricted sections, required speed)
• Safety depth / UKC and ECDIS safety contour
• Squat at different speeds
• Sunrise, sunset and twilight at any position
• Sailing calculators: great circle (vertex and waypoints), Mercator, parallel sailing, dead reckoning, estimated position (leeway, set and drift), composite sailing
• Voyage draft plan with fuel, diesel and fresh-water tanks and a hydrostatic table

INFORMATION
• NAVAREA / NAVTEX warnings along the route (when online), nautical publications and ENC cells
• Weather and sea forecast along the route (when online)
• Ship reporting systems (AMVER, JASREP, mandatory reporting)

PRIVATE BY DESIGN
No account, no ads, no tracking. Your plans stay on your device. Save and open plan files, back up everything to one file.

IMPORTANT
Passage Planner is a planning aid only and is NOT for navigation. Zones, limits, depths and positions are approximate. Always verify against official ENC / paper charts, Sailing Directions, ALRS, Notices to Mariners and your company SMS.
```

## Graphics (in this folder)
| Asset | File | Play requirement |
|---|---|---|
| App icon | `play-icon-512.png` | 512 × 512 PNG |
| Feature graphic | `feature-graphic.png` | 1024 × 500 |
| Phone screenshots | `phone-1 … phone-6` | 1080 × 1920 (2–8 required) |
| 7-inch tablet | `tablet7-*.png` | 1920 × 1200 |
| 10-inch tablet | `tablet10-*.png` | 1920 × 1200 |

Tip: the chart background in these screenshots is plain because they were made offline. For a nicer listing, retake phone screenshots on your phone with the chart loaded. Use 9:16 portrait and no status-bar clutter.

## Store settings
- **Category:** Maps & Navigation
- **Tags:** Navigation, Maps, Productivity
- **Contact e-mail:** your e-mail (required, shown publicly)
- **Privacy policy URL:** `https://<your-site>/privacy.html`

## App content (Policy → App content)
| Item | Answer |
|---|---|
| Privacy policy | URL above |
| Ads | No, the app contains no ads |
| App access | All functionality is available without special access (no login) |
| Content rating (IARC questionnaire) | Category "Reference, News or Educational" or "Utility"; answer **No** to all violence, sexual, drugs, gambling and user-interaction questions → expected rating: Everyone / PEGI 3 |
| Target audience | 18 and over (professional seafarers). Not designed for children |
| News app | No |
| Health / financial / government app | No |
| Data safety | see below |

## Data safety form
- **Does your app collect or share any of the required user data types?** → **No**
  - The app has no server. Plans, notes and settings never leave the device.
  - The GPS position is used on the device only and is never transmitted.
- **Is all user data encrypted in transit?** → Yes (HTTPS only)
- **Do you provide a way for users to request that their data is deleted?** → Data is stored only on the device. Clearing app data or uninstalling deletes it.
- Explain in the policy that chart, weather and warning services are contacted directly (they see the IP address and route coordinates for weather). This is already in `privacy.html`.

## Permissions to declare
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`: foreground only, to show the ship's position and calculate sun times. No background location, so no extra Play declaration is needed.
- `INTERNET`
