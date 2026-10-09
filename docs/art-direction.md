# Republic art direction

The redesign uses original assets generated with the built-in image generation tool. No reference screenshot was copied into the product.

- `apps/web/public/art/republic-sunset.png`: cinematic title and summit background.
- `apps/web/public/art/resource-atlas.png`: ten resource illustrations, laid out using CSS background positions.
- Flags, the live land preview and in-game landmarks are native SVG/Three.js components.

## Background prompt

Use case: stylized-concept. Asset type: 16:9 cinematic title-screen background for a premium browser political strategy game called Republic. Create original high-quality painterly 3D game key art of a fictional modern West African developing republic at golden hour. A majestic cream stone government complex with a green copper dome and colonnades sits near a winding river and waterfront boulevard in the RIGHT HALF, dense warm terracotta low-rise neighbourhoods and elegant modern towers beyond, lush palm trees, sweeping rugged mountains in the distance, atmospheric peach-orange sunset and deep petrol-blue shadows. Rich detailed believable architecture, approachable stylization like polished strategy-game promotional art, not photorealism, not a toy city. Wide aerial cinematic view with depth, warm window lights and tiny distant traffic. LEFT THIRD should have quieter darker river and shaded terrain with space for overlaid game title and menu; architecture strongest in centre-right. Full-bleed landscape, no UI, no words, no letters, no logos, no borders, no flags of real nations. Deliver landscape 16:9.

## Resource atlas prompt

Use case: stylized-concept. Asset type: a single resource-card texture atlas for Republic, a premium strategy videogame. One landscape image with EXACTLY five equal columns and two equal rows, ten equal rectangular panels touching edge-to-edge, no borders or gaps, no words, numbers or UI. Each panel is a richly detailed painterly 3D game illustration with cinematic golden light and deep teal shadows. TOP ROW LEFT TO RIGHT: 1 black oil pumpjack in a sandy oil field at sunset; 2 natural gas processing plant with silver pipes and blue flame; 3 close-up of lustrous gold nuggets on dark mineral rock; 4 open-pit rare-earth mineral mine with subtle violet and turquoise minerals; 5 rust-red iron ore quarry with excavator. BOTTOM ROW LEFT TO RIGHT: 1 lush green farmland with neat crop rows and distant hills; 2 thick tropical timber forest with neatly cut logs in foreground; 3 azure coastal bay with cliffs and a busy shipping port; 4 wide meandering river winding through fertile verdant hills; 5 modern nuclear power station with cooling towers and soft steam, verdant surroundings. No real brands, no people in closeup, no text whatsoever. Make each of the ten panels distinct and legible at small card size. Overall atlas aspect ratio 5:2; panels individually 2.5:2 landscape.


## Presidential overhaul environments

Original generated environments, delivered as 2048px WebP assets:

- `apps/web/public/art/presidential-office.webp`
- `apps/web/public/art/diplomatic-boardroom.webp`

Office generation direction: wide cinematic presidential workspace viewed from behind
a walnut desk; cream briefing folder at left, black secure telephone at right, wall map
and bookshelves, tall windows overlooking a fictional coastal capital at golden hour.
Warm brass, deep navy shadows, layered atmospheric light. No people, words or real flags.

Boardroom generation direction: a symmetrical walnut negotiation table with a clear
foreground, opposing empty leather chairs and blank brass nameplates, tall windows over
a fictional coastal city at blue hour, warm brass lighting and navy shadows. No people,
words or real flags. React supplies fictional emblems, live names, documents and signatures.

The office uses restrained light/dust animation, interactive physical objects and optional
synthesized ambience. Reduced-motion preferences suppress nonessential movement. The
boardroom's cream documents retain clear contrast on mobile; the terms editor is portalled
above navigation. Republic visits retain R3F and an authored SVG fallback driven by actual
persistent plots, construction stages, flood severity, power availability and approval.

Actual local browser previews: [office](office-preview.jpg), [signed boardroom](boardroom-preview.jpg).
