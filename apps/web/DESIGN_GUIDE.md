# UI Design Crash Course (Developer Edition)

Welcome to the frontend! As a developer, you probably think in logic, structures, and systems. Good news: **UI Design is just visual logic.** 

If you understand variables, scopes, and functions, you can understand colors, spacing, and components.

---

## Phase 1: The Design System (The "Variables")

We set up a "Midnight Finance" theme in `globals.css`. Open that file and look at the `@theme` block. Here is why we made those choices:

1. **Backgrounds aren't pitch black (`#050505`)**: Pure black (`#000000`) with pure white text creates extreme contrast that strains the eyes (astigmatism effect). A very dark gray looks much more premium.
2. **Surfaces (`#0f0f12`)**: We use a slightly lighter gray for "cards" or "sidebars" to create "elevation." In dark mode, lighter = closer to the user.
3. **Contrast is for action**: We use vibrant primary colors (`#3b82f6` blue) *sparingly*. If everything is blue, nothing stands out. Blue is for active tabs, primary buttons, or important stats.
4. **Subtle Borders (`#1f1f23`)**: Borders shouldn't draw attention. They should just separate content. Use very dark borders.

## Phase 2: The Core Principles (The "Logic")

When looking at your blank `page.tsx`, remember these three rules:

1. **Spacing (Whitespace is your friend)**: The biggest difference between a "developer UI" and a "designer UI" is padding. Give elements room to breathe. Use `p-6` or `gap-4` liberally.
2. **Hierarchy (Don't just use bold)**: When you want something to be less important (like a subtitle), don't just make it smaller. Make it dimmer. 
   - *Bad*: `<h1>Title</h1>` and `<h5>Subtitle</h5>`
   - *Good*: `<h1 className="text-xl font-semibold">Title</h1>` and `<p className="text-sm text-muted">Subtitle</p>` (Our `text-muted` turns it gray).
3. **Grouping**: If two pieces of data are related, put them in a box. We created a special `@utility glass` class in your CSS for this. It gives a slightly transparent, blurred background.

---

## Phase 3: The Coding Session (Your Assignment)

Let's rebuild that dashboard step-by-step. Open `layout.tsx` and `page.tsx`.

### Step 1: The Shell (in `layout.tsx`)
Currently, `layout.tsx` just has a `<main>` tag. 
1. Change the `<body>` to a flex container: `className="flex h-full bg-background text-foreground"`
2. Add an `<aside>` tag before the `<main>` tag. Make it `w-64` (64 * 4 = 256px wide), give it a `border-r border-border bg-surface`.
3. Add some navigation links inside the aside. Use the `lucide-react` icons (e.g., `<LayoutDashboard />`).

### Step 2: The Header (in `page.tsx`)
1. Wrap everything in a max-width container: `<div className="max-w-6xl mx-auto space-y-8">`
2. Add a `<header>` tag with an `<h1>` (Market Overview) and a `<p className="text-muted">` (Track your targets).

### Step 3: The Stats Row
1. Create a CSS Grid: `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">`
2. Inside, create 3 cards. Use our custom utility: `<div className="glass p-5 rounded-xl">`.
3. Inside the card, put a title (`text-muted text-sm`) and a big number (`text-3xl font-bold`).

### Step 4: The Main Content
1. Below the stats, make another Grid: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
2. **Left side (`lg:col-span-2`)**: Build a table for the Watchlist. Wrap it in a `glass rounded-xl overflow-hidden` div.
3. **Right side (`col-span-1`)**: Build a "Recent Alerts" feed.

### Pro-Tip:
If you get stuck, remember that you can always check Git to see the exact code I wrote before we cleared the canvas! 

Good luck, and remember: if it looks cluttered, add more padding or make the secondary text `text-muted`!
