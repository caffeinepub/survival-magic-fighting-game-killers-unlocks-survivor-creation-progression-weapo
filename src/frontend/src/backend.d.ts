import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Stat = {
    __kind__: "magic";
    magic: bigint;
} | {
    __kind__: "level";
    level: bigint;
} | {
    __kind__: "experience";
    experience: bigint;
} | {
    __kind__: "speed";
    speed: bigint;
} | {
    __kind__: "defense";
    defense: bigint;
} | {
    __kind__: "attack";
    attack: bigint;
} | {
    __kind__: "health";
    health: bigint;
};
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
export interface BotCombatStatus {
    combatOngoing: boolean;
    botName: string;
    botHealth: bigint;
    botId: bigint;
    playerHealth: bigint;
    playerActiveSurvivor: Survivor;
}
export interface Bot {
    id: bigint;
    url: string;
    rewardCurrency: bigint;
    difficulty: bigint;
    name: string;
    description: string;
    rewardExp: bigint;
}
export interface Weapon {
    name: string;
    defenseBonus: bigint;
    attackBonus: bigint;
    description: string;
    magicBonus: bigint;
    speedBonus: bigint;
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
export interface Announcement {
    id: bigint;
    title: string;
    createdBy: Principal;
    message: string;
    timestamp: bigint;
}
export interface AdminPanelEvent {
    id: bigint;
    creator: Principal;
    description: string;
    timestamp: bigint;
    eventName: string;
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
export interface ShopItem {
    id: bigint;
    name: string;
    description: string;
    bonusStat?: Stat;
    itemType: ItemType;
    price: bigint;
}
export enum ItemType {
    key = "key",
    pet = "pet",
    armor = "armor",
    misc = "misc",
    currencyPack = "currencyPack",
    weapon = "weapon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    attackBot(): Promise<BotCombatStatus>;
    createAdminPanelEvent(eventName: string, description: string, timestamp: bigint): Promise<void>;
    createAnnouncement(title: string, message: string): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getAdminPanelEventsForCaller(): Promise<Array<AdminPanelEvent>>;
    getAdminPanelEventsForUser(user: Principal): Promise<Array<AdminPanelEvent>>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllBots(): Promise<Array<Bot>>;
    getAllShopItems(): Promise<Array<ShopItem>>;
    getAnnouncement(id: bigint): Promise<Announcement | null>;
    getBot(id: bigint): Promise<Bot | null>;
    getBotCombatStatus(): Promise<BotCombatStatus | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallersFriends(): Promise<Array<Principal>>;
    getShopItem(id: bigint): Promise<ShopItem | null>;
    getUserAdminPanelEvent(user: Principal, eventId: bigint): Promise<AdminPanelEvent | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsersFriends(user: Principal): Promise<Array<Principal>>;
    getWhoCallerFollowing(): Promise<Array<Principal>>;
    getWhoIsFollowingCaller(): Promise<Array<Principal>>;
    getWhoIsFollowingUser(user: Principal): Promise<Array<Principal>>;
    getWhoUserIsFollowing(user: Principal): Promise<Array<Principal>>;
    isCallerAdmin(): Promise<boolean>;
    purchaseAdminPanel(): Promise<void>;
    purchaseShopItem(itemId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startBotCombat(botId: bigint): Promise<BotCombatStatus>;
    unfollowUser(target: Principal): Promise<void>;
}
