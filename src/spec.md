# Specification

## Summary
**Goal:** Add an interactive 3D dungeon viewer to the Dungeons tab that lets authenticated users explore a dungeon scene and select quests/crates via clickable hotspots.

**Planned changes:**
- Embed a React Three Fiber 3D viewport in `frontend/src/pages/DungeonPage.tsx` above the existing dungeon/quest/crate lists, supporting rotate/zoom (pan optional).
- Add quest and crate hotspot markers inside the 3D scene; clicking a hotspot highlights and scrolls to the matching quest/crate card in the existing list UI for the currently displayed dungeon.
- Add static 3D dungeon model asset(s) to the frontend and load them in the 3D scene with an English loading state.
- Add an English fallback message when WebGL is unavailable or the 3D scene fails to load, while keeping the rest of the Dungeons UI functional.
- Style the 3D viewer to match the existing dark fantasy/ember UI theme and layout conventions without changing navigation or backend APIs.

**User-visible outcome:** On the Dungeons tab, users see a themed 3D dungeon scene they can rotate/zoom; clicking quest/crate markers highlights and scrolls to the corresponding items in the lists below, with loading and fallback messaging in English.
