# Specification

## Summary
**Goal:** Add AI bot PvE fights, expand the Shop with more purchasable items, and introduce an Announcements page with admin-created posts.

**Planned changes:**
- Backend: add APIs to list AI bots and start/execute bot fights using the existing combat flow, awarding and persisting currency/EXP rewards on victory.
- Frontend: add a Combat Arena section/tab to browse bots and start bot fights, reusing existing combat UI and React Query + toast patterns (including profile cache invalidation).
- Backend: define shop item catalog data and a purchase API that validates currency/profile, subtracts currency, grants item effects, and persists the result.
- Frontend: expand the Shop page to list new items alongside the existing Admin Panel card (unchanged), with affordability state, purchase actions, and profile refresh/toasts.
- Frontend: add an Announcements page in main authenticated navigation that renders a scrollable list of announcement cards (English text).
- Backend + Frontend: persist announcements, expose list and admin-only create endpoints, and add admin-only UI (via Admin Panel section/tab) to create announcements with cache invalidation.
- Frontend: update any local Page type unions/navigation helpers to include the new Announcements page and avoid TypeScript errors.

**User-visible outcome:** Players can fight AI bots for rewards, buy additional shop items with in-game currency, and read announcements; Admin Panel owners can create announcements that appear in the Announcements page.
