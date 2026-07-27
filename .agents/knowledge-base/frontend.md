# 🎨 Frontend & Design System Tokens

## Color Tokens (`app/globals.css`)
- **Canvas Background (`--bg`)**: `#0D0D0D` (Pure Deep Onyx Black)
- **Container Surface (`--surface`)**: `#16161A` & `#1F1F24` (Dark Charcoal Surface)
- **Primary Accent (`--primary`)**: `#FF1E42` (Electric Crimson Red)
- **Primary Hover (`--primary-hover`)**: `#E01435` (Deep Crimson Red)
- **Primary Glow (`--shadow-glow`)**: `0 0 25px rgba(255, 30, 66, 0.5)`
- **Text Primary (`--text-primary`)**: `#F4F4F6` (Crisp Light Neutral)
- **Text Muted (`--text-muted`)**: `#71717A`

---

## Styling Architecture
- **Vanilla CSS**: Global styling managed via `app/globals.css`.
- **Gradients**: `linear-gradient(180deg, #16161A 0%, #111114 100%)` for cards and tables.
- **Charts**: Recharts library for interactive traffic timelines and keyword position distribution charts.
- **Badges**: Standardized semantic role badges (`badge-superadmin`, `badge-admin`, `badge-member`, `badge-client`).
