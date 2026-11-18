# stratigraph-brand

The StratiGraph visual identity, as files a program can use. One source of
truth: `stratigraph-theme.css` (tokens + the three faces), the self-hosted
`fonts/`, and the official `logo/` SVGs.

**Authority: `StratiGraph_full_guidebook.pdf` (WP1).** Every hex and every font
here is read out of it. Nothing in this directory is a design decision — the
decisions were made in the guidebook, and this is the machine-readable copy. If
the two ever disagree, the guidebook is right and this is a bug.

## Who uses it

The tools that are natively **StratiGraph**: the field assistant, the room
browser and node console (StratiGraph Server), the Catalog.

**NOT EMStudio and NOT EMtools.** Those are *Extended Matrix* tools and keep the
EM look. Two identities, on purpose: StratiGraph is the project, Extended
Matrix is the language it speaks.

## How an app gets it

Vendored, exactly the way the datamodels are (`sync-datamodels.sh` in EMStudio).
Each app has a `sync-brand.sh` that copies this directory in, and commits the
copy.

```bash
./sync-brand.sh              # from the sibling checkout
./sync-brand.sh ../elsewhere/stratigraph-brand
```

**Why vendored and not a `<link>` to the node.** A Field Computing Node lives in
a trench. It has no CDN, and the assistant has to work when the node itself is
the thing that is down. A theme that arrived over the network would leave the
tool unstyled exactly where it matters most — so the copy in the app is the
base. A node MAY also serve `/em/theme/stratigraph-theme.css` for web
consumers; that is a convenience on top, never the only channel.

## What is in here

| | |
|---|---|
| `stratigraph-theme.css` | the tokens. Palette (guidebook names), semantic roles, type scale, spacing, and a handful of shared primitives |
| `fonts/*.woff2` | Erode 400/500/600 (fontshare, free for personal and commercial use) · IBM Plex Sans 400/500/600 and Mono 400/500 (SIL OFL 1.1). Latin subsets |
| `logo/*.svg` | the official files, copied unchanged from WP1. Favicon (the hourglass) in four colourways, full logo in two |

## Using it

Reach for the **semantic** tokens, not the palette ones:

```css
background: var(--sg-bg);         /* not var(--sg-off-white)     */
color:      var(--sg-text);
border:     1px solid var(--sg-line);
```

The palette says what a colour *is*; the roles say what it is *for*, and only
the roles survive a rebrand.

**The digital accents are categories, not decoration** — the guidebook is
explicit: they "represent coded logic, modules, tool categories and system
navigation". Thermal Blue for an identifier, Soft Neon Green for something that
landed, Burnt Orange for the action, Terracotta for something that needs a
person. Not "whichever looks nice here".

And they are **fills, never text**: measured against Off-White, Thermal Blue is
2.27 and Soft Neon Green 1.36, both far below AA. That is why the theme ships
`--sg-info-ink` and `--sg-ok-ink` — the same hues, dark enough to read on their
own wash (6.28 and 5.76 measured).

## What you may reuse

Two different things live in this directory, and they travel on different terms.

The **styles** — `stratigraph-theme.css`, `skins.css`, `skin.js`, `GLOSSARY.md` —
are the reusable part, under the MIT licence in `LICENSE`. Take them into a tool
of the ecosystem, or into your own, and change what you need to.

The **mark** — everything in `logo/` — is the project's identity, copied
unchanged from WP1. Use it to refer to StratiGraph: in an interface that is part
of the ecosystem, in a slide, in a paper. Keep it as it is (no recolouring
outside the four colourways here, no redrawing, no new lock-ups), and do not
adopt it as the mark of a product that is not StratiGraph.

The **fonts** keep their own licences, filed beside them in `fonts/`: SIL Open
Font License 1.1 for Comfortaa, Sora and IBM Plex, the ITF Free Font License for
Erode (`NOTICE-erode.txt`).

## Updating

Edit here, then re-run each app's `sync-brand.sh` and review the diff. The
version below is what a consumer can check it has.

- `1.0.0` (2026-08-29) — first cut: palette, three faces, roles, logos.

## Skins (30 October 2026)

`stratigraph-theme.css` is the guidebook's theme and stays untouched. `skins.css`,
loaded right after it, gives the same roles three looks: **EM · terra** (the
default: Extended Matrix ink and ochre on a paper ground, a warm earth dark),
**EM · chiaro** (EM as on extendedmatrix.org and in EMStudio) and **StratiGraph**
(the guidebook, nothing overridden). `skin.js`, a classic script in `<head>`,
applies the reader's choice before the first paint and fills a `<select id="skin">`.
The choice is stored under `sg-skin`, shared by every face on the node's origin.
Sora and Comfortaa are SIL OFL 1.1 (`fonts/OFL-*.txt`).
