# ContractMotion — Claude Fable UI/UX Handoff Brief
**Target Agent:** Claude Fable (Creative Frontend & UI/UX Specialist)
**Objective:** Take the newly deployed Direct-Response "Sledgehammer" homepage prototype to a world-class, premium visual standard (adding micro-interactions, custom CSS/SVG transitions, and glassmorphism polish) without breaking the core copywriting, JavaScript components, or backend routing.

---

## 📍 1. Codebase Context & Active Files
The local website repository is located at `Desktop/contractmotion-site/`. Load and analyze these files before initiating changes:

*   **`index.html`** — The active homepage. Highly compressed, self-contained single-page direct-response funnel. Integrates all copy, layout structural grids, and JS interactive blocks.
*   **`style.css`** — The global stylesheet containing your root CSS variables, global layouts, and custom modular spacing.

---

## 🎨 2. Active Design System (CSS Variables)
Always adhere to these existing color palettes and typography rules in `style.css` to preserve branding consistency:
```css
:root {
  --bg:         #0D1117;       /* Deep obsidian canvas */
  --bg-2:       #161B22;       /* Mid-tone slate card backdrop */
  --bg-3:       #1C2128;       /* High-contrast element backdrop */
  --accent:     #00FF94;       /* Neon-green primary action */
  --accent-dim: rgba(0, 255, 148, 0.15);
  --border:     #21262D;       /* Standard grid divider border */
  --border-2:   #30363D;       /* High-contrast card border */
  --red:        #FF3366;       /* Alert / Disqualification accent */
  --red-dim:    rgba(255, 51, 102, 0.15);
  --font-mono:  'JetBrains Mono', monospace;
  --font-body:  'Inter', sans-serif;
}
```

---

## 🛠️ 3. Active JavaScript & Interactive Components (Do Not Break)
The `index.html` contains raw JavaScript scripts at the bottom that power these core visual engines. **Preserve their function names, variable bindings, and query selectors:**

1.  **`typeTerminal()` (Doppler Scraper Emulator):** Dynamically types and outputs terminal log lines representing a live scrape pipeline. Loops continuously with a cursor flash.
2.  **`switchNiche(nicheKey)` (Industry Signal Customizer):** Navigates tab states (`shredding`, `ndt`, `roofing`, `pest`), dynamically swaps out paragraphs, changes raw lists of scraped registries, and injects customized Fazio email copy.
3.  **`calculateROI()` (Interactive ROI Calculator):** Instantly calculates and formats the Visitor's expected revenue addition and percentage ROI based on Average Deal LTV and Close Rate sliders/inputs.
4.  **`toggleModal(show)` (VSL Storyboard Modal):** Opens and closes a high-end modal backdrop overlay showing the 2-minute video script and Veo 3.1 prompt guide.

---

## 📈 4. Actionable Directives for Fable (How to Get More Juice)
Fable, your mandate is to inject premium visual "juice" into the page while respecting the direct-response sales copy. Focus on these five areas:

### A. High-End Glassmorphism & Depth
*   Add subtle backdrop-filters (`backdrop-filter: blur(10px);`) and slight radial glare reflections to the `.panel-container`, `.compare-card`, `.velvet-box`, and `.pricing-card` elements to make them look like floating physical glass panes.
*   Incorporate absolute-positioned glowing ambient orbs (using blurred pseudo-elements `::before`/`::after` with radial gradients) behind major visual assets like the `.terminal-window` and `.dashboard-visual` to build depth.

### B. Polish Micro-Interactions & Hover States
*   Add smooth, elastic transitions (`transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);`) on buttons and cards.
*   Create a glowing border trail effect on the `.pricing-card.popular` or `.velvet-box` when hovered, so a neon-green line traces around the container.
*   Make form input ranges and text boxes glow intensely with a custom inner shadow (`box-shadow: inset 0 0 10px rgba(0, 255, 148, 0.2);`) when focused.

### C. Elevate SVG & Canvas Animations
*   Animate the SVG column chart bars inside the `.dashboard-visual` card so they grow upwards smoothly with a spring transition on load.
*   Animate the play icon pulse ring on the VSL preview so it ripples outwards infinitely with absolute-positioned SVG circles.

### D. Refine Responsive Typography & Spacing
*   Optimize mobile-screen padding and layouts for the `.hero-grid`, `.panel-grid`, and `.velvet-grid`. Ensure columns stack elegantly on screen sizes under 768px without breaking text line heights.
*   Style scrollbars (`::-webkit-scrollbar`) inside the `.terminal-window` and the `.modal-card` to match the dark slate theme.

### E. Smooth Modal Transitions
*   Animate the VSL modal (`#vsl-modal`) transition so it doesn't just instantly blink open. Use a fade-in backdrop overlay combined with a smooth slide-up animation for `.modal-card` using a custom cubic-bezier timing.
