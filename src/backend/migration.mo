import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type Killer = {
    id : Nat;
    name : Text;
    description : Text;
    url : Text;
    stats : {
      health : Nat;
      attack : Nat;
      defense : Nat;
      speed : Nat;
      magic : Nat;
      level : Nat;
    };
    unlocked : Bool;
    unlockCriteria : ?Nat;
    storyline : ?Text;
  };

  type Survivor = {
    name : Text;
    level : Nat;
    experience : Nat;
    stats : {
      health : Nat;
      attack : Nat;
      defense : Nat;
      speed : Nat;
      magic : Nat;
      level : Nat;
    };
  };

  type Weapon = {
    name : Text;
    description : Text;
    attackBonus : Int;
    defenseBonus : Int;
    speedBonus : Int;
    magicBonus : Int;
  };

  type Pet = {
    name : Text;
    description : Text;
    experienceBonus : Int;
    levelBonus : Int;
    dropRateBonus : Int;
  };

  type Enemy = {
    name : Text;
    health : Nat;
    attack : Nat;
    defense : Nat;
    speed : Nat;
    magic : Nat;
    goldReward : Nat;
    expReward : Nat;
  };

  type Dungeon = {
    id : Nat;
    name : Text;
    description : Text;
    difficulty : Nat;
    quests : [Quest];
    availableCrates : [Crate];
  };

  type Quest = {
    id : Nat;
    name : Text;
    description : Text;
    dungeonId : Nat;
    rewardCurrency : Nat;
  };

  type Crate = {
    id : Nat;
    name : Text;
    description : Text;
    location : Text;
    requiredKey : Text;
    reward : Nat;
  };

  type PlayerProfile = {
    currency : Nat;
    hasAdminPanel : Bool;
    killers : [Killer];
    survivors : [Survivor];
    weapons : [Weapon];
    pets : [Pet];
    activeSurvivor : ?Survivor;
    equippedWeapon : ?Weapon;
    equippedPet : ?Pet;
    storylineProgress : Nat;
    equippedArmor : ?Nat;
    activeDungeonId : ?Nat;
    completedQuests : [Nat];
    inventory : [Text];
    collectedKeys : [Text];
    openedCrates : [Nat];
  };

  type CombatStatus = {
    enemyName : Text;
    enemyHealth : Nat;
    playerHealth : Nat;
    playerActiveSurvivor : Survivor;
    combatOngoing : Bool;
  };

  type CombatResult = {
    winner : Winner;
    rewardCurrency : Nat;
    rewardExp : Nat;
  };

  type CombatDetails = {
    playerStats : Survivor;
    enemyStats : Enemy;
    playerHealth : Nat;
    enemyHealth : Nat;
    rewardedCurrency : Nat;
    rewardedExp : Nat;
    status : CombatStatus;
    result : ?CombatResult;
  };

  type UserProfile = PlayerProfile;

  type Clan = {
    id : Nat;
    name : Text;
    founder : Principal;
    members : [Principal];
    memberCount : Nat;
    createdAt : Nat;
  };

  type WhyDontYouJoin = {
    id : Nat;
    leader : Principal;
    name : Text;
    active : Bool;
    createClan : Bool;
    description : Text;
    imageUrl : Text;
    memberCount : Nat;
  };

  type ClanMarketplaceItem = {
    id : Nat;
    clanReference : Nat;
    whyDontYouJoinId : Nat;
  };

  type Winner = {
    #player;
    #enemy;
  };

  type AttackResult = {
    enemyAttack : Nat;
    playerAttack : Nat;
    playerCritical : Bool;
    enemyCritical : Bool;
    playerWasCriticalHit : Bool;
    playerAlive : Bool;
    enemyAlive : Bool;
  };

  type AdminPanelEvent = {
    id : Nat;
    creator : Principal;
    eventName : Text;
    description : Text;
    timestamp : Nat;
  };

  type OldActor = {
    adminPanelEvents : Map.Map<Principal, Map.Map<Nat, AdminPanelEvent>>;
    playerProfiles : Map.Map<Principal, PlayerProfile>;
    combatStatus : Map.Map<Principal, CombatStatus>;
    whyDontYouJoins : Map.Map<Nat, WhyDontYouJoin>;
    clans : Map.Map<Nat, Clan>;
    dungeons : Map.Map<Nat, Dungeon>;
    followers : Map.Map<Principal, Map.Map<Principal, ()>>;
  };

  type ShopItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    itemType : ItemType;
    bonusStat : ?Stat;
  };

  type ItemType = {
    #weapon;
    #armor;
    #pet;
    #key;
    #currencyPack;
    #misc;
  };

  type Stat = {
    #attack : Nat;
    #defense : Nat;
    #speed : Nat;
    #magic : Nat;
    #health : Nat;
    #experience : Nat;
    #level : Nat;
  };

  type Bot = {
    id : Nat;
    name : Text;
    url : Text;
    description : Text;
    difficulty : Nat;
    rewardCurrency : Nat;
    rewardExp : Nat;
  };

  type BotCombatStatus = {
    botId : Nat;
    botName : Text;
    botHealth : Nat;
    playerHealth : Nat;
    playerActiveSurvivor : Survivor;
    combatOngoing : Bool;
  };

  type NewActor = {
    adminPanelEvents : Map.Map<Principal, Map.Map<Nat, AdminPanelEvent>>;
    playerProfiles : Map.Map<Principal, PlayerProfile>;
    combatStatus : Map.Map<Principal, CombatStatus>;
    whyDontYouJoins : Map.Map<Nat, WhyDontYouJoin>;
    clans : Map.Map<Nat, Clan>;
    dungeons : Map.Map<Nat, Dungeon>;
    followers : Map.Map<Principal, Map.Map<Principal, ()>>;
    bots : Map.Map<Nat, Bot>;
    botCombatStatus : Map.Map<Principal, BotCombatStatus>;
    announcements : Map.Map<Nat, Announcement>;
    shopItems : Map.Map<Nat, ShopItem>;
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    message : Text;
    createdBy : Principal;
    timestamp : Nat;
  };

  // Migration function replacing old actor by new actor
  public func run(old : OldActor) : NewActor {
    // Initialize the bots map with sample bots
    let bots = Map.empty<Nat, Bot>();

    bots.add(
      1,
      {
        id = 1;
        name = "The Shyamnator";
        url = "https://shyamcore.app/images/shyamnator.png";
        description = "A speedy, legendary cyborg that spins 62,000 times per second. Ranked #1 in physics simulation races and speed in the Shyamcore Multiverse.";
        difficulty = 10;
        rewardCurrency = 250_000_000;
        rewardExp = 100_000;
      },
    );

    bots.add(
      2,
      {
        id = 2;
        name = "The WesleyCore";
        url = "https://shyamcore.app/images/wesleycore.png";
        description = "Developed by Wesley Hardcore, this bot is known for its immense strength and stamina. Built for endurance races and is exceptionally strong.";
        difficulty = 12;
        rewardCurrency = 350_000_000;
        rewardExp = 150_000;
      },
    );

    bots.add(
      3,
      {
        id = 3;
        name = "AdminDestroyer";
        url = "https://shyamcore.app/images/admindestroyer.png";
        description = "A cold, calculating cyborg created to protect administrators. Developed using AI technology based on the Mountain Admin Core Foundation.";
        difficulty = 20;
        rewardCurrency = 1_000_000_000;
        rewardExp = 1_000_000;
      },
    );

    let announcements = Map.empty<Nat, Announcement>();
    let shopItems = Map.empty<Nat, ShopItem>();
    let botCombatStatus = Map.empty<Principal, BotCombatStatus>();

    {
      old with
      bots;
      botCombatStatus;
      announcements;
      shopItems;
    };
  };
};
