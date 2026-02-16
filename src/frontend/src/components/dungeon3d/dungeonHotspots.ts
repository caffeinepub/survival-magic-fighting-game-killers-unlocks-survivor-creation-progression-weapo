export interface HotspotData {
  id: bigint;
  type: 'quest' | 'crate';
  position: [number, number, number];
}

// Generate deterministic positions for quests and crates
export function generateDungeonHotspots(
  quests: Array<{ id: bigint }>,
  crates: Array<{ id: bigint }>
): HotspotData[] {
  const hotspots: HotspotData[] = [];
  
  // Position quests in a semi-circle on the left side
  quests.forEach((quest, index) => {
    const angle = (Math.PI / 2) + (index * Math.PI / (quests.length + 1));
    const radius = 3;
    hotspots.push({
      id: quest.id,
      type: 'quest',
      position: [
        Math.cos(angle) * radius - 1,
        0.5,
        Math.sin(angle) * radius
      ],
    });
  });
  
  // Position crates in a semi-circle on the right side
  crates.forEach((crate, index) => {
    const angle = (Math.PI / 2) + (index * Math.PI / (crates.length + 1));
    const radius = 3;
    hotspots.push({
      id: crate.id,
      type: 'crate',
      position: [
        Math.cos(angle) * radius + 1,
        0.5,
        Math.sin(angle) * radius
      ],
    });
  });
  
  return hotspots;
}
