# Interior Design Website Structure & UX Guide

## Overview & Vision
This guide outlines the architectural, visual, and user experience strategy for an interactive interior design website. The core goal is to empower users to design their own homes using a rich, integrated knowledge base and intuitive UI design.

---

## 1. Visual Direction & Style System

To achieve a clean, professional, and stylish aesthetic while maintaining high usability, the UI relies on a monochromatic base paired with vibrant content imagery.

*   **Color Palette:**
    *   `#F9F9FB` (Off-White Background)
    *   `#1A1A1A` (Charcoal Text & Primary Elements)
    *   `#64748B` (Slate Accent & Secondary Labels)
    *   *Note:* Real photos of interior spaces and materials serve as the primary visual color source.
*   **Typography:**
    *   **Display Headers:** Refined Serif (*Playfair Display* or *Instrument Serif*) for an elevated, editorial tone.
    *   **Body & UI Controls:** Clean Sans-Serif (*Inter* or *Plus Jakarta Sans*) for clarity and legibility in tool panels.
*   **Grid Structure:**
    *   A minimalist split-pane grid combining fixed utility sidebars with fluid content displays (galleries, canvases, and guides).

---

## 2. Site Architecture & Layouts

### A. Hero & Onboarding
*   **Split-Screen Design:**
    *   *Left:* Editorial headline, high-level introduction, and direct calls-to-action ("Launch Planner", "Browse Knowledge Base").
    *   *Right:* Interactive before/after room slider or dynamic showcase visual.
*   **Intent-Based Search Header:**
    *   Unified search bar with quick pill filters for **Room Type** (*Living Room, Kitchen, Bedroom*), **Design Style** (*Japandi, Mid-Century Modern, Industrial*), and **Budget Tiers**.

### B. Knowledge Base & Inspiration Hub
*   **Visual Style Matrices:** Categorized guides covering color palettes, lighting strategies, and material pairings tailored to specific architectural styles.
*   **Interactive Hotspot Rooms:** Room imagery equipped with interactive pins detailing item specifications, material properties, paint codes, and spatial guidelines (e.g., clearance between coffee tables and sofas).
*   **Material & Furniture Catalog:** Filterable library covering lighting, flooring, textiles, and furniture with specs on dimensions, care instructions, and style pairings.

### C. Interactive Room Builder & Planner
*   **Three-Pane Canvas Layout:**
    *   **Left Dock:** Component library with drag-and-drop assets (furniture, finishes, lighting).
    *   **Center Canvas:** Interactive floor plan / 3D viewer featuring toggleable lighting modes (*Daylight*, *Evening Accent*).
    *   **Right Dock (Contextual Assistant):** Dynamic panel displaying real-time recommendations and rules from the knowledge base based on selected components.

---

## 3. Key UI Components & Interactions

| UI Element | Experience Design | Purpose |
| :--- | :--- | :--- |
| **Global Navigation Bar** | Sticky header with blurred backdrop (`backdrop-filter: blur`). Contains search, knowledge base navigation, app launcher, and user profile. | Provides constant access to key tools without cluttering active views. |
| **Knowledge Base Sidebar** | Multi-level collapsible accordion organized by *Room Type*, *Styles*, *Color & Light*, and *Spatial Rules*. | Delivers quick reference guides directly alongside active workflows. |
| **Inspiration Cards** | High-resolution image cards with smooth hover states that reveal design principles and product lists. | Connects visual inspiration directly with practical product knowledge. |
| **Material Swatch Drawer** | Bottom sliding panel featuring rich real-time texture previews (marbles, woods, fabrics) with compatibility tags. | Facilitates quick material experimentation within room plans. |