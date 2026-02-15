import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WhyDontYouJoin {
    id: bigint;
    active: boolean;
    name: string;
    memberCount: bigint;
    createClan: boolean;
    description: string;
    imageUrl: string;
    leader: Principal;
}
export interface CombatDetails {
    status: CombatStatus;
    result?: CombatResult;
    enemyStats: Enemy;
    playerStats: Survivor;
    rewardedCurrency: bigint;
    enemyHealth: bigint;
    rewardedExp: bigint;
    playerHealth: bigint;
}
export interface PlayerProfile {
    hasAdminPanel: boolean;
    completedQuests: Array<bigint>;
    storylineProgress: bigint;
    activeDungeonId?: bigint;
    inventory: Array<string>;
    pets: Array<Pet>;
    collectedKeys: Array<string>;
    survivors: Array<Survivor>;
    activeSurvivor?: Survivor;
    currency: bigint;
    equippedArmor?: bigint;
    killers: Array<Killer>;
    weapons: Array<Weapon>;
    openedCrates: Array<bigint>;
    equippedWeapon?: Weapon;
    equippedPet?: Pet;
}
export interface Killer {
    id: bigint;
    url: string;
    storyline?: string;
    name: string;
    unlocked: boolean;
    description: string;
    stats: {
        magic: bigint;
        level: bigint;
        speed: bigint;
        defense: bigint;
        attack: bigint;
        health: bigint;
    };
    unlockCriteria?: bigint;
}
export interface Dungeon {
    id: bigint;
    difficulty: bigint;
    name: string;
    description: string;
    availableCrates: Array<Crate>;
    quests: Array<Quest>;
}
export interface Crate {
    id: bigint;
    reward: bigint;
    name: string;
    description: string;
    requiredKey: string;
    location: string;
}
export interface Clan {
    id: bigint;
    members: Array<Principal>;
    name: string;
    createdAt: bigint;
    memberCount: bigint;
    founder: Principal;
}
export interface Survivor {
    name: string;
    level: bigint;
    experience: bigint;
    stats: {
        magic: bigint;
        level: bigint;
        speed: bigint;
        defense: bigint;
        attack: bigint;
        health: bigint;
    };
}
export interface Pet {
    dropRateBonus: bigint;
    name: string;
    experienceBonus: bigint;
    description: string;
    levelBonus: bigint;
}
export interface Enemy {
    magic: bigint;
    name: string;
    goldReward: bigint;
    expReward: bigint;
    speed: bigint;
    defense: bigint;
    attack: bigint;
    health: bigint;
}
export interface Weapon {
    name: string;
    defenseBonus: bigint;
    attackBonus: bigint;
    description: string;
    magicBonus: bigint;
    speedBonus: bigint;
}
export interface Quest {
    id: bigint;
    dungeonId: bigint;
    rewardCurrency: bigint;
    name: string;
    description: string;
}
export interface CombatResult {
    rewardCurrency: bigint;
    winner: Winner;
    rewardExp: bigint;
}
export interface CombatStatus {
    combatOngoing: boolean;
    enemyName: string;
    enemyHealth: bigint;
    playerHealth: bigint;
    playerActiveSurvivor: Survivor;
}
export interface UserProfile {
    hasAdminPanel: boolean;
    completedQuests: Array<bigint>;
    storylineProgress: bigint;
    activeDungeonId?: bigint;
    inventory: Array<string>;
    pets: Array<Pet>;
    collectedKeys: Array<string>;
    survivors: Array<Survivor>;
    activeSurvivor?: Survivor;
    currency: bigint;
    equippedArmor?: bigint;
    killers: Array<Killer>;
    weapons: Array<Weapon>;
    openedCrates: Array<bigint>;
    equippedWeapon?: Weapon;
    equippedPet?: Pet;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Winner {
    player = "player",
    enemy = "enemy"
}
export interface backendInterface {
    addPet(pet: Pet): Promise<void>;
    addWeapon(weapon: Weapon): Promise<void>;
    addWhyDontYouJoin(name: string, description: string, imageUrl: string): Promise<WhyDontYouJoin>;
    adminGrantCurrency(amount: bigint): Promise<void>;
    adminSetLevel(survivorName: string, newLevel: bigint): Promise<void>;
    adminUnlockKiller(killerId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeQuest(questId: bigint): Promise<void>;
    createClanFromJoin(whyJoinId: bigint, clanName: string): Promise<Clan | null>;
    createPlayerProfile(): Promise<PlayerProfile>;
    createSurvivor(name: string, startingStats: {
        magic: bigint;
        speed: bigint;
        defense: bigint;
        attack: bigint;
        health: bigint;
    }): Promise<void>;
    earnCurrency(amount: bigint): Promise<void>;
    equipPet(petName: string): Promise<void>;
    equipWeapon(weaponName: string): Promise<void>;
    getActiveDungeon(): Promise<bigint | null>;
    getActiveDungeonMaps(): Promise<Array<Dungeon>>;
    getActiveWhyDontYouJoins(): Promise<Array<WhyDontYouJoin>>;
    getAllDungeonKeys(): Promise<Array<string>>;
    getAllDungeonMaps(): Promise<Array<Dungeon>>;
    getAllKeys(): Promise<Array<string>>;
    getAllWhyDontYouJoins(): Promise<Array<WhyDontYouJoin>>;
    getAvailableDungeonMaps(): Promise<Array<Dungeon> | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClanMarketplace(): Promise<Array<Clan>>;
    getCollectedKeys(): Promise<Array<string>>;
    getCombatStatus(): Promise<CombatStatus | null>;
    getCompletedQuests(): Promise<Array<bigint>>;
    getOpenedCrates(): Promise<Array<bigint>>;
    getPlayerInventory(): Promise<Array<string>>;
    getPlayerProfile(): Promise<PlayerProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinExistingClan(clanId: bigint): Promise<Clan | null>;
    joinRandomClan(): Promise<Clan | null>;
    performAttack(enemy: Enemy): Promise<CombatDetails>;
    performMagicAttack(_enemy: Enemy): Promise<CombatDetails>;
    purchaseAdminPanel(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setActiveSurvivor(survivorName: string): Promise<void>;
    startCombat(enemy: Enemy): Promise<void>;
    startQuest(questId: bigint): Promise<void>;
    unlockCrate(crateId: bigint): Promise<void>;
    unlockNextKiller(): Promise<void>;
    updateWhyDontYouJoin(id: bigint, active: boolean): Promise<WhyDontYouJoin | null>;
}
