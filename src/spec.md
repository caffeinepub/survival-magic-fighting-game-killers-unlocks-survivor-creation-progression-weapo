# Specification

## Summary
**Goal:** Add an Admin Panel “Events” tab for Admin Panel owners to create and view their own events, and update the Admin Panel purchase cost to exactly 1,000,000,000 currency across backend and Shop UI.

**Planned changes:**
- Update Admin Panel purchase price to 1,000,000,000 in backend purchase enforcement and in the Shop UI display/affordability messaging so they match.
- Add backend persisted event model and canister methods to allow authenticated users with `hasAdminPanel = true` to create an event and list their own events.
- Add an “Events” tab to the Admin Panel page (visible/accessible only to Admin Panel owners) with an English UI form (title + description) to create events and a list showing created events.
- Extend the React Query hooks layer to support listing and creating events, including toast success/error behavior and cache invalidation to refresh the events list after creation.

**User-visible outcome:** Players who own the Admin Panel can open a new “Events” tab to create events (title/description) and see their created events persistently; the Admin Panel costs 1,000,000,000 currency everywhere it is shown and enforced.
