import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type OldKiller = {
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

  type OldSurvivor = {
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

  type OldWeapon = {
    name : Text;
    description : Text;
    attackBonus : Int;
    defenseBonus : Int;
    speedBonus : Int;
    magicBonus : Int;
  };

  type OldPet = {
    name : Text;
    description : Text;
    experienceBonus : Int;
    levelBonus : Int;
    dropRateBonus : Int;
  };

  type OldEnemy = {
    name : Text;
    health : Nat;
    attack : Nat;
    defense : Nat;
    speed : Nat;
    magic : Nat;
    goldReward : Nat;
    expReward : Nat;
  };

  type OldDungeon = {
    id : Nat;
    name : Text;
    description : Text;
    difficulty : Nat;
    quests : [OldQuest];
    availableCrates : [OldCrate];
  };

  type OldQuest = {
    id : Nat;
    name : Text;
    description : Text;
    dungeonId : Nat;
    rewardCurrency : Nat;
  };

  type OldCrate = {
    id : Nat;
    name : Text;
    description : Text;
    location : Text;
    requiredKey : Text;
    reward : Nat;
  };

  type OldPlayerProfile = {
    currency : Nat;
    hasAdminPanel : Bool;
    killers : [OldKiller];
    survivors : [OldSurvivor];
    weapons : [OldWeapon];
    pets : [OldPet];
    activeSurvivor : ?OldSurvivor;
    equippedWeapon : ?OldWeapon;
    equippedPet : ?OldPet;
    storylineProgress : Nat;
    equippedArmor : ?Nat;
    activeDungeonId : ?Nat;
    completedQuests : [Nat];
    inventory : [Text];
    collectedKeys : [Text];
    openedCrates : [Nat];
    auraPower : Nat;
    auraLevel : Nat;
    rebirthCount : Nat;
    rebirthMultiplier : Nat;
  };

  type OldCombatStatus = {
    enemyName : Text;
    enemyHealth : Nat;
    playerHealth : Nat;
    playerActiveSurvivor : OldSurvivor;
    combatOngoing : Bool;
  };

  type OldCombatResult = {
    winner : OldWinner;
    rewardCurrency : Nat;
    rewardExp : Nat;
  };

  type OldCombatDetails = {
    playerStats : OldSurvivor;
    enemyStats : OldEnemy;
    playerHealth : Nat;
    enemyHealth : Nat;
    rewardedCurrency : Nat;
    rewardedExp : Nat;
    status : OldCombatStatus;
    result : ?OldCombatResult;
  };

  type OldUserProfile = OldPlayerProfile;

  type OldClan = {
    id : Nat;
    name : Text;
    founder : Principal;
    members : [Principal];
    memberCount : Nat;
    createdAt : Nat;
  };

  type OldWhyDontYouJoin = {
    id : Nat;
    leader : Principal;
    name : Text;
    active : Bool;
    createClan : Bool;
    description : Text;
    imageUrl : Text;
    memberCount : Nat;
  };

  type OldClanMarketplaceItem = {
    id : Nat;
    clanReference : Nat;
    whyDontYouJoinId : Nat;
  };

  type OldWinner = {
    #player;
    #enemy;
  };

  type OldAttackResult = {
    enemyAttack : Nat;
    playerAttack : Nat;
    playerCritical : Bool;
    enemyCritical : Bool;
    playerWasCriticalHit : Bool;
    playerAlive : Bool;
    enemyAlive : Bool;
  };

  type OldAdminPanelEvent = {
    id : Nat;
    creator : Principal;
    eventName : Text;
    description : Text;
    timestamp : Nat;
  };

  type OldShopItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    itemType : OldItemType;
    bonusStat : ?OldStat;
  };

  type OldItemType = {
    #weapon;
    #armor;
    #pet;
    #key;
    #currencyPack;
    #misc;
  };

  type OldStat = {
    #attack : Nat;
    #defense : Nat;
    #speed : Nat;
    #magic : Nat;
    #health : Nat;
    #experience : Nat;
    #level : Nat;
  };

  type OldBot = {
    id : Nat;
    name : Text;
    url : Text;
    description : Text;
    difficulty : Nat;
    rewardCurrency : Nat;
    rewardExp : Nat;
  };

  type OldBotCombatStatus = {
    botId : Nat;
    botName : Text;
    botHealth : Nat;
    playerHealth : Nat;
    playerActiveSurvivor : OldSurvivor;
    combatOngoing : Bool;
  };

  type OldAnnouncement = {
    id : Nat;
    title : Text;
    message : Text;
    createdBy : Principal;
    timestamp : Nat;
  };

  type OldActor = {
    adminPanelEvents : Map.Map<Principal, Map.Map<Nat, OldAdminPanelEvent>>;
    playerProfiles : Map.Map<Principal, OldPlayerProfile>;
    combatStatus : Map.Map<Principal, OldCombatStatus>;
    whyDontYouJoins : Map.Map<Nat, OldWhyDontYouJoin>;
    clans : Map.Map<Nat, OldClan>;
    dungeons : Map.Map<Nat, OldDungeon>;
    followers : Map.Map<Principal, Map.Map<Principal, ()>>;
    bots : Map.Map<Nat, OldBot>;
    botCombatStatus : Map.Map<Principal, OldBotCombatStatus>;
    announcements : Map.Map<Nat, OldAnnouncement>;
    shopItems : Map.Map<Nat, OldShopItem>;
    currencyConversionRate : Nat;
    adminPanelCost : Nat;
    adminPanelConstant : Nat;
  };

  type NewKiller = OldKiller;
  type NewSurvivor = OldSurvivor;
  type NewWeapon = OldWeapon;
  type NewPet = OldPet;
  type NewEnemy = OldEnemy;
  type NewDungeon = OldDungeon;
  type NewQuest = OldQuest;
  type NewCrate = OldCrate;

  type NewPlayerProfile = {
    username : Text;
    currency : Nat;
    hasAdminPanel : Bool;
    killers : [NewKiller];
    survivors : [NewSurvivor];
    weapons : [NewWeapon];
    pets : [NewPet];
    activeSurvivor : ?NewSurvivor;
    equippedWeapon : ?NewWeapon;
    equippedPet : ?NewPet;
    storylineProgress : Nat;
    equippedArmor : ?Nat;
    activeDungeonId : ?Nat;
    completedQuests : [Nat];
    inventory : [Text];
    collectedKeys : [Text];
    openedCrates : [Nat];
    auraPower : Nat;
    auraLevel : Nat;
    rebirthCount : Nat;
    rebirthMultiplier : Nat;
  };

  type NewCombatStatus = OldCombatStatus;
  type NewCombatResult = OldCombatResult;
  type NewCombatDetails = OldCombatDetails;
  type NewUserProfile = NewPlayerProfile;

  type NewClan = OldClan;
  type NewWhyDontYouJoin = {
    id : Nat;
    leader : Principal;
    name : Text;
    active : Bool;
    description : Text;
    imageUrl : Text;
    memberCount : Nat;
  };
  type NewClanMarketplaceItem = OldClanMarketplaceItem;
  type NewWinner = OldWinner;
  type NewAttackResult = OldAttackResult;
  type NewAdminPanelEvent = OldAdminPanelEvent;
  type NewShopItem = OldShopItem;
  type NewItemType = OldItemType;
  type NewStat = OldStat;
  type NewBot = OldBot;
  type NewBotCombatStatus = OldBotCombatStatus;
  type NewAnnouncement = OldAnnouncement;

  type NewActor = {
    adminPanelEvents : Map.Map<Principal, Map.Map<Nat, NewAdminPanelEvent>>;
    playerProfiles : Map.Map<Principal, NewPlayerProfile>;
    combatStatus : Map.Map<Principal, NewCombatStatus>;
    whyDontYouJoins : Map.Map<Nat, NewWhyDontYouJoin>;
    clans : Map.Map<Nat, NewClan>;
    dungeons : Map.Map<Nat, NewDungeon>;
    followers : Map.Map<Principal, Map.Map<Principal, ()>>;
    bots : Map.Map<Nat, NewBot>;
    botCombatStatus : Map.Map<Principal, NewBotCombatStatus>;
    announcements : Map.Map<Nat, NewAnnouncement>;
    shopItems : Map.Map<Nat, NewShopItem>;
    currencyConversionRate : Nat;
    adminPanelCost : Nat;
    adminPanelConstant : Nat;
    usernames : Map.Map<Text, Principal>;
  };

  public func run(old : OldActor) : NewActor {
    let newPlayerProfiles = old.playerProfiles.map<Principal, OldPlayerProfile, NewPlayerProfile>(
      func(_id, oldProfile) {
        { oldProfile with username = "" };
      }
    );
    let newAdminPanelEvents = old.adminPanelEvents.map<Principal, Map.Map<Nat, OldAdminPanelEvent>, Map.Map<Nat, NewAdminPanelEvent>>(
      func(_id, events) { events }
    );
    let newWhyDontYouJoins = old.whyDontYouJoins.map<Nat, OldWhyDontYouJoin, NewWhyDontYouJoin>(
      func(_id, oldWhyDontYouJoin) {
        {
          oldWhyDontYouJoin with
          description = oldWhyDontYouJoin.description;
          imageUrl = oldWhyDontYouJoin.imageUrl;
        };
      }
    );
    let newClans = old.clans.map<Nat, OldClan, NewClan>(
      func(_id, clan) { clan }
    );
    let newDungeons = old.dungeons.map<Nat, OldDungeon, NewDungeon>(
      func(_id, dungeon) { dungeon }
    );
    let newBots = old.bots.map<Nat, OldBot, NewBot>(
      func(_id, bot) { bot }
    );
    let newAnnouncements = old.announcements.map<Nat, OldAnnouncement, NewAnnouncement>(
      func(_id, announcement) { announcement }
    );
    let newShopItems = old.shopItems.map<Nat, OldShopItem, NewShopItem>(
      func(_id, shopItem) { shopItem }
    );
    { old with
      playerProfiles = newPlayerProfiles;
      adminPanelEvents = newAdminPanelEvents;
      whyDontYouJoins = newWhyDontYouJoins;
      clans = newClans;
      dungeons = newDungeons;
      bots = newBots;
      announcements = newAnnouncements;
      shopItems = newShopItems;
      usernames = Map.empty<Text, Principal>();
    };
  };
};
