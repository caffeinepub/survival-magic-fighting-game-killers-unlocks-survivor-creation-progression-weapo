# Specification

## Summary
**Goal:** Expand game content by extending killer progression, adding more dungeon quests, increasing boss encounters, and adding quick-pick pet names in the admin UI.

**Planned changes:**
- Extend backend killer unlock progression in `backend/main.mo` to add 9 new killers after Noli (Spydersammy, Doodle, Arkey, Caylus, Steak, Cruz, King arkey 👑, 67 kid, Zeus) using the existing `unlockNextKiller()` flow, with unique incremental ids and non-empty renderable fields.
- Update `frontend/src/pages/KillersPage.tsx` to show the full unlock order through Zeus, update the total unlocked count to 13, and allow unlocking until all 13 killers are unlocked.
- Expand `frontend/src/pages/GameplayPage.tsx` boss presets to a total of 12 bosses by adding 7 new boss entries with distinct stats and `goldReward` between 5,000 and 500,000.
- Add 26 new dungeon quests in `backend/main.mo` (returned by the existing dungeon listing used by `useGetAllDungeonMaps`) with unique ids, valid dungeonId references, English name/description, and reward currency consistent with the current UI.
- Add quick-pick options for 5 pet names (Floof, Buddy, Void breaker, Neo, Beluga) in `frontend/src/pages/AdminPanelPage.tsx` without removing manual name entry and while keeping the existing add-pet submission flow.

**User-visible outcome:** Players can unlock 9 additional killers (up to 13 total), choose from 12 boss fights in the Combat Arena, and see 26 more dungeon quests; admins can quickly select one of 5 preset pet names when creating pets.
