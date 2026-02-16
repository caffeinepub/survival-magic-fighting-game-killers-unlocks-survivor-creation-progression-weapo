# Specification

## Summary
**Goal:** Add user-facing usernames and replace prominent Principal ID displays with usernames while keeping Principals as the internal account identifier.

**Planned changes:**
- Extend the backend `PlayerProfile` model to persist a unique `username` per principal and enforce global uniqueness with clear English errors.
- Require setting a valid, non-empty username during profile creation (or immediately after via a dedicated method), including validation (format/length/characters/uniqueness) and English error messages.
- Add backend query method(s) to resolve username(s) from principal(s) and resolve a principal by username for social features.
- If needed for upgrades, add a conditional migration to safely populate deterministic default usernames for existing profiles and build any required username index.
- Update the profile setup UI to collect a `Username` as the primary field, with Principal ID shown only as secondary/advanced copyable info.
- Update `useCreatePlayerProfile` to send the username to the backend and preserve existing toast-based success/error handling and refetch behavior.
- Update the Social page to follow/unfollow via username input and display usernames in lists (with principal as secondary/fallback), using English UI copy and messages.
- Update other prominent UI surfaces that currently show “Principal ID” as the player identity to display username instead, keeping principal accessible only as secondary where appropriate.

**User-visible outcome:** Players choose a unique username during profile setup; the app primarily shows usernames (including in Social follow/unfollow and lists) while still using Principals internally and keeping Principal ID available as secondary info when needed.
