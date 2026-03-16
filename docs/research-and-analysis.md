# WatermarkOut — Research & Analysis

## Project Overview

**Product:** Client-side watermark removal tool for PDF, DOCX, and images.
**Key differentiator:** Files never leave the browser. Zero server cost. Works offline (PWA).
**Revenue model:** Passive income via ads / premium features.

## Competitor Analysis

### Existing Tools Reviewed
1. **Watermark Remover IO** — Server-side processing, requires upload, privacy concerns
2. **PDF Candy** — Server-side, watermark removal is one of many tools
3. **iLovePDF** — Popular but server-side, freemium with limits
4. **Remove.bg** — Image-only, AI-powered but server-side, subscription model
5. **Canva** — General design tool, basic watermark removal

### Key Gap Identified
No major competitor offers **fully client-side** watermark removal. All require file upload to servers. This is the primary differentiator.

### UX Patterns from Competitors
1. No signup to start — tool immediately usable
2. Drag-and-drop + file picker — both upload methods
3. Before/after interactive slider for image results
4. Sub-10s processing target
5. Preview before download
6. Privacy messaging prominent
7. Auto-detect file type — unified upload for all formats

## Technical Architecture Decisions

### Stack Selection
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React 19 + TypeScript 5 | Ecosystem maturity, type safety |
| Build | Vite 6 | Fast HMR, ESM-native, excellent plugin ecosystem |
| CSS | Tailwind CSS v4 | CSS-first config, dark/light mode support, utility-first |
| PDF structural | pdf-lib | Direct PDF manipulation, no server needed |
| PDF visual | pdfjs-dist + jspdf | Render-to-canvas fallback for complex watermarks |
| DOCX | JSZip | DOCX files are ZIP archives of XML |
| Image | Canvas API (native) | No external dependency, pixel-level control |
| PWA | vite-plugin-pwa (Workbox) | Offline support, installability |
| Deploy | Cloudflare Pages | Free tier, global CDN, zero-cost hosting |
| Icons | lucide-react | Lightweight, tree-shakeable, consistent design |

### Theme System Decision
**Choice:** Dual theme (dark + light) with auto-detection and manual toggle.

| Approach | Pros | Cons |
|----------|------|------|
| Dark only | Simpler CSS, premium aesthetic | Excludes light-preference users |
| Light only | Broader appeal | Less distinctive |
| **Both (chosen)** | Covers all users, system-aware | ~200 extra lines CSS, theme hook |

**Implementation:**
- Default: Dark theme
- Detection: `prefers-color-scheme` media query on first visit
- Toggle: Sun/Moon icon in header
- Persistence: `localStorage` key `watermarkout-theme`
- CSS: CSS custom properties on `:root` / `[data-theme="light"]`

### Dark Theme Palette
```
Background:   #0a0a0f (deep midnight)
Surface:      rgba(255,255,255,0.05) (glass cards)
Accent:       #00d4ff (electric cyan)
Text:         #f0f0f5 (soft white)
Muted:        #71717a (zinc-500)
Success:      #22c55e
Error:        #ef4444
Border:       rgba(255,255,255,0.1)
```

### Light Theme Palette
```
Background:   #fafafa (near white)
Surface:      #ffffff (white cards + shadow)
Accent:       #0066ff (deep blue)
Text:         #111827 (gray-900)
Muted:        #6b7280 (gray-500)
Success:      #059669
Error:        #dc2626
Border:       #e5e7eb (gray-200)
```

## Watermark Removal Strategies

### PDF Strategy 1 — Structural (pdf-lib)
Works by parsing PDF internals and removing watermark objects:
- Annotations with `/Subtype /Stamp` or low opacity
- Marked content blocks (`/Artifact BMC...EMC`, `/Watermark BDC...EMC`)
- Optional Content Groups (OCGs) named "Watermark"
- Full-page Form XObjects (likely watermark overlays)

**Pros:** Preserves text selectability, small file size, fast.
**Cons:** Misses pixel-embedded watermarks, depends on PDF structure.

### PDF Strategy 2 — Visual (pdfjs + Canvas + jspdf)
Works by rendering pages to canvas and pixel-processing:
- Render each page at 2x scale via pdfjs
- HSL-based watermark pixel detection
- Neighbourhood-average inpainting
- Reconstruct PDF from cleaned canvases

**Pros:** Works on any watermark type.
**Cons:** Loses text selectability, larger output, slower.

### DOCX Strategy
DOCX files are ZIP archives containing XML:
- Watermarks in `word/header*.xml` as VML shapes (`<w:pict>`)
- Also as DrawingML (`<mc:AlternateContent>`, `<w:drawing>`)
- Background images in `<w:background>`
- Strategy: Parse XML, regex-strip watermark elements, repackage ZIP

### Image Strategy
Canvas API pixel-level processing:
- HSL colour space detection (low saturation + high lightness = watermark)
- Configurable sensitivity thresholds
- Neighbourhood-average inpainting (5px radius, inverse-distance weighted)

## Performance Targets
- PDF (structural): < 2s for 50-page document
- PDF (visual): < 10s for 10-page document
- DOCX: < 1s
- Image: < 3s for 4000x3000 image
- Lighthouse: 90+ Performance, 100 Accessibility, 100 Best Practices, 90+ SEO

## SEO Strategy
- JSON-LD WebApplication schema in index.html
- Dynamic meta tags per page
- robots.txt + sitemap.xml
- Semantic HTML structure
- Target keywords: "remove watermark online", "watermark remover", "remove watermark from PDF"

## File Format Support
| Format | Extensions | Detection Method |
|--------|-----------|-----------------|
| PDF | .pdf | Magic bytes `%PDF-` |
| DOCX | .docx | Magic bytes `PK` (ZIP) + file extension |
| JPEG | .jpg, .jpeg | Magic bytes `FF D8 FF` |
| PNG | .png | Magic bytes `89 50 4E 47` |
| WebP | .webp | Magic bytes `52 49 46 46` + `WEBP` |

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Complex watermarks not detected | Medium | Dual PDF strategy with fallback |
| Large files crash browser | High | 100MB limit, Web Workers, streaming |
| WASM loading slow | Low | Preload, cache via Service Worker |
| Copyright/legal concerns | Medium | Clear ToS: user responsibility, no piracy |
