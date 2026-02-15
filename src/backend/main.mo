import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type Killer = {
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

  public type Survivor = {
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

  public type Weapon = {
    name : Text;
    description : Text;
    attackBonus : Int;
    defenseBonus : Int;
    speedBonus : Int;
    magicBonus : Int;
  };

  public type Pet = {
    name : Text;
    description : Text;
    experienceBonus : Int;
    levelBonus : Int;
    dropRateBonus : Int;
  };

  public type Enemy = {
    name : Text;
    health : Nat;
    attack : Nat;
    defense : Nat;
    speed : Nat;
    magic : Nat;
    goldReward : Nat;
    expReward : Nat;
  };

  public type Dungeon = {
    id : Nat;
    name : Text;
    description : Text;
    difficulty : Nat;
    quests : [Quest];
    availableCrates : [Crate];
  };

  public type Quest = {
    id : Nat;
    name : Text;
    description : Text;
    dungeonId : Nat;
    rewardCurrency : Nat;
  };

  public type Crate = {
    id : Nat;
    name : Text;
    description : Text;
    location : Text;
    requiredKey : Text;
    reward : Nat;
  };

  public type PlayerProfile = {
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

  public type CombatStatus = {
    enemyName : Text;
    enemyHealth : Nat;
    playerHealth : Nat;
    playerActiveSurvivor : Survivor;
    combatOngoing : Bool;
  };

  public type CombatResult = {
    winner : Winner;
    rewardCurrency : Nat;
    rewardExp : Nat;
  };

  public type CombatDetails = {
    playerStats : Survivor;
    enemyStats : Enemy;
    playerHealth : Nat;
    enemyHealth : Nat;
    rewardedCurrency : Nat;
    rewardedExp : Nat;
    status : CombatStatus;
    result : ?CombatResult;
  };

  public type UserProfile = PlayerProfile;
  public type Clan = {
    id : Nat;
    name : Text;
    founder : Principal;
    members : [Principal];
    memberCount : Nat;
    createdAt : Nat;
  };

  public type WhyDontYouJoin = {
    id : Nat;
    leader : Principal;
    name : Text;
    active : Bool;
    createClan : Bool;
    description : Text;
    imageUrl : Text;
    memberCount : Nat;
  };

  public type ClanMarketplaceItem = {
    id : Nat;
    clanReference : Nat;
    whyDontYouJoinId : Nat;
  };

  let playerProfiles = Map.empty<Principal, PlayerProfile>();
  let combatStatus = Map.empty<Principal, CombatStatus>();
  var whyDontYouJoins = Map.empty<Nat, WhyDontYouJoin>();
  var clans = Map.empty<Nat, Clan>();
  var dungeons = Map.empty<Nat, Dungeon>();

  let currencyConversionRate = 639_273_000_000_012;
  let adminPanelCost : Nat = 10000;
  let adminPanelConstant = 123_321_456_789;

  public type Winner = {
    #player;
    #enemy;
  };

  public type AttackResult = {
    enemyAttack : Nat;
    playerAttack : Nat;
    playerCritical : Bool;
    enemyCritical : Bool;
    playerWasCriticalHit : Bool;
    playerAlive : Bool;
    enemyAlive : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func nextWhyDontYouJoinId() : Nat {
    whyDontYouJoins.size() + 1;
  };

  func nextClanId() : Nat {
    clans.size() + 1;
  };

  func nextDungeonId() : Nat {
    dungeons.size() + 1;
  };

  public shared ({ caller }) func addWhyDontYouJoin(name : Text, description : Text, imageUrl : Text) : async WhyDontYouJoin {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create clan listings");
    };

    let newJoin : WhyDontYouJoin = {
      id = nextWhyDontYouJoinId();
      leader = caller;
      name;
      active = true;
      createClan = false;
      description;
      imageUrl;
      memberCount = 1;
    };
    whyDontYouJoins.add(newJoin.id, newJoin);
    newJoin;
  };

  public shared ({ caller }) func updateWhyDontYouJoin(id : Nat, active : Bool) : async ?WhyDontYouJoin {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update clan listings");
    };

    switch (whyDontYouJoins.get(id)) {
      case (?existing) {
        if (existing.leader != caller) {
          Runtime.trap("Only the creator can update this listing");
        };
        let updated : WhyDontYouJoin = {
          existing with
          active;
        };
        whyDontYouJoins.add(id, updated);
        ?updated;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getActiveWhyDontYouJoins() : async [WhyDontYouJoin] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clan listings");
    };
    whyDontYouJoins.values().toArray().filter(func(j) { j.active });
  };

  public query ({ caller }) func getAllWhyDontYouJoins() : async [WhyDontYouJoin] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clan listings");
    };
    whyDontYouJoins.values().toArray();
  };

  public shared ({ caller }) func createClanFromJoin(whyJoinId : Nat, clanName : Text) : async ?Clan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create clans");
    };

    let join = switch (whyDontYouJoins.get(whyJoinId)) {
      case (?join) { join };
      case (null) {
        Runtime.trap("No active join request found, try a different listing");
      };
    };
    if (join.active == false) {
      Runtime.trap("No active join request found, try a different listing");
    };

    if (join.memberCount == 0) {
      Runtime.trap("No available personally listed clans to join, try again later!");
    };
    let newClan : Clan = {
      id = nextClanId();
      name = clanName;
      founder = join.leader;
      members = [join.leader];
      memberCount = 1;
      createdAt = 0;
    };

    clans.add(newClan.id, newClan);
    let updatedJoin = {
      join with
      active = false;
      createClan = true;
    };
    whyDontYouJoins.add(whyJoinId, updatedJoin);
    ?newClan;
  };

  public shared ({ caller }) func joinExistingClan(clanId : Nat) : async ?Clan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join clans");
    };

    let clan = switch (clans.get(clanId)) {
      case (?clan) { clan };
      case null { Runtime.trap("No active clan found, try a different listing") };
    };

    let updatedMembers = clan.members.concat([caller]);
    let updatedClan = {
      clan with
      members = updatedMembers;
      memberCount = updatedMembers.size();
    };
    clans.add(clanId, updatedClan);
    ?updatedClan;
  };

  public query ({ caller }) func getClanMarketplace() : async [Clan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clan marketplace");
    };
    clans.values().toArray();
  };

  public shared ({ caller }) func joinRandomClan() : async ?Clan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join clans");
    };

    let activeJoins = whyDontYouJoins.values().toArray().filter(func(j) { j.active });
    if (activeJoins.size() == 0) {
      Runtime.trap("No active 'join a clan requests' available");
    };
    let randomJoin = activeJoins[0];

    let newClan : Clan = {
      id = nextClanId();
      name = "Clan " # randomJoin.name;
      founder = randomJoin.leader;
      members = [randomJoin.leader, caller];
      memberCount = 2;
      createdAt = 0;
    };
    clans.add(newClan.id, newClan);

    let updatedJoin = {
      randomJoin with
      createClan = true;
    };
    whyDontYouJoins.add(randomJoin.id, updatedJoin);
    ?newClan;
  };

  public shared ({ caller }) func createPlayerProfile() : async PlayerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    switch (playerProfiles.get(caller)) {
      case (?_) { Runtime.trap("Profile already exists") };
      case (null) {};
    };

    let startingKillers : [Killer] = [
      {
        id = 1;
        name = "Jason";
        description = "A menacing killer with high attack power.";
        url = "https://game-assets.icp/sprites/jason.png";
        stats = { health = 100; attack = 40; defense = 20; speed = 15; magic = 5; level = 1 };
        unlocked = true;
        unlockCriteria = null;
        storyline = ? "Jason's story begins in the dark forests...";
      },
    ];

    let profile = {
      currency = 0;
      hasAdminPanel = false;
      killers = startingKillers;
      survivors = [];
      weapons = [];
      pets = [];
      activeSurvivor = null;
      equippedWeapon = null;
      equippedPet = null;
      storylineProgress = 0;
      equippedArmor = null;
      activeDungeonId = null;
      completedQuests = [];
      inventory = [];
      collectedKeys = [];
      openedCrates = [];
    };

    playerProfiles.add(caller, profile);
    profile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    playerProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    playerProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    playerProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPlayerProfile() : async PlayerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };
  };

  public query ({ caller }) func getPlayerInventory() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };
    switch (playerProfiles.get(caller)) {
      case (?profile) { profile.inventory };
      case (null) { Runtime.trap("Profile does not exist") };
    };
  };

  public query ({ caller }) func getCompletedQuests() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view completed quests");
    };
    switch (playerProfiles.get(caller)) {
      case (?profile) { profile.completedQuests };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getCollectedKeys() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view collected keys");
    };
    switch (playerProfiles.get(caller)) {
      case (?profile) { profile.collectedKeys };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getOpenedCrates() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view opened crates");
    };
    switch (playerProfiles.get(caller)) {
      case (?profile) { profile.openedCrates };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getActiveDungeon() : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view active dungeon");
    };
    switch (playerProfiles.get(caller)) {
      case (?profile) { profile.activeDungeonId };
      case (null) { null };
    };
  };

  public shared ({ caller }) func createSurvivor(name : Text, startingStats : { health : Nat; attack : Nat; defense : Nat; speed : Nat; magic : Nat }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create survivors");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let newSurvivor : Survivor = {
      name = name;
      level = 1;
      experience = 0;
      stats = {
        health = startingStats.health;
        attack = startingStats.attack;
        defense = startingStats.defense;
        speed = startingStats.speed;
        magic = startingStats.magic;
        level = 1;
      };
    };

    let updatedProfile = PlayerProfileExtensions.withSurvivors(
      currentProfile,
      currentProfile.survivors.concat([newSurvivor])
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func setActiveSurvivor(survivorName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set active survivor");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let survivor = currentProfile.survivors.find(func(s) { s.name == survivorName });

    let updatedProfile = PlayerProfileExtensions.withActiveSurvivor(currentProfile, survivor);
    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func unlockNextKiller() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock killers");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let unlockedCount = currentProfile.killers.filter(func(k) { k.unlocked }).size();

    let nextKiller : ?Killer = switch (unlockedCount) {
      case (1) {
        ? {
          id = 2;
          name = "Coolkidd";
          description = "A swift and cunning killer.";
          url = "https://game-assets.icp/sprites/coolkidd.png";
          stats = { health = 120; attack = 45; defense = 25; speed = 20; magic = 10; level = 1 };
          unlocked = true;
          unlockCriteria = ?10;
          storyline = ? "Coolkidd emerges from the shadows...";
        };
      };
      case (2) {
        ? {
          id = 3;
          name = "1x1x1x1";
          description = "A mysterious and powerful killer.";
          url = "https://game-assets.icp/sprites/1x1x1x1.png";
          stats = { health = 150; attack = 50; defense = 30; speed = 25; magic = 20; level = 1 };
          unlocked = true;
          unlockCriteria = ?25;
          storyline = ? "The legend of 1x1x1x1 unfolds...";
        };
      };
      case (3) {
        ? {
          id = 4;
          name = "Noli";
          description = "The ultimate killer with devastating power.";
          url = "https://game-assets.icp/sprites/noli.png";
          stats = { health = 200; attack = 60; defense = 40; speed = 30; magic = 30; level = 1 };
          unlocked = true;
          unlockCriteria = ?50;
          storyline = ? "Noli, the apex predator, awakens...";
        };
      };
      case (4) {
        ? {
          id = 5;
          name = "Spydersammy";
          description = "Deadly assassin lurking in the night.";
          url = "https://game-assets.icp/sprites/spydersammy.png";
          stats = { health = 130; attack = 55; defense = 35; speed = 28; magic = 15; level = 1 };
          unlocked = true;
          unlockCriteria = ?75;
          storyline = ? "Spydersammy strikes from the shadows...";
        };
      };
      case (5) {
        ? {
          id = 6;
          name = "Doodle";
          description = "A crafty killer with unexpected tricks.";
          url = "https://game-assets.icp/sprites/doodle.png";
          stats = { health = 110; attack = 50; defense = 25; speed = 32; magic = 18; level = 1 };
          unlocked = true;
          unlockCriteria = ?100;
          storyline = ? "Doodle weaves a path of chaos...";
        };
      };
      case (6) {
        ? {
          id = 7;
          name = "Arkey";
          description = "Fearless warrior from the underworld.";
          url = "https://game-assets.icp/sprites/arkey.png";
          stats = { health = 170; attack = 60; defense = 40; speed = 20; magic = 28; level = 1 };
          unlocked = true;
          unlockCriteria = ?150;
          storyline = ? "Arkey rises from the abyss...";
        };
      };
      case (7) {
        ? {
          id = 8;
          name = "Caylus";
          description = "Elven killer with nature's gift.";
          url = "https://game-assets.icp/sprites/caylus.png";
          stats = { health = 160; attack = 51; defense = 37; speed = 31; magic = 35; level = 1 };
          unlocked = true;
          unlockCriteria = ?220;
          storyline = ? "Caylus brings balance of nature and death...";
        };
      };
      case (8) {
        ? {
          id = 9;
          name = "Steak";
          description = "Seasoned mercenary with a dark past.";
          url = "https://game-assets.icp/sprites/steak.png";
          stats = { health = 140; attack = 52; defense = 43; speed = 19; magic = 10; level = 1 };
          unlocked = true;
          unlockCriteria = ?300;
          storyline = ? "Steak serves up cold justice...";
        };
      };
      case (9) {
        ? {
          id = 10;
          name = "Cruz";
          description = "Powerful mage who manipulates darkness.";
          url = "https://game-assets.icp/sprites/cruz.png";
          stats = { health = 95; attack = 66; defense = 20; speed = 33; magic = 54; level = 1 };
          unlocked = true;
          unlockCriteria = ?350;
          storyline = ? "Cruz unleashes masterful spells...";
        };
      };
      case (10) {
        ? {
          id = 11;
          name = "King Arkey";
          description = "Ruler of the undead realm.";
          url = "https://game-assets.icp/sprites/kingarkey.png";
          stats = { health = 200; attack = 70; defense = 60; speed = 20; magic = 42; level = 1 };
          unlocked = true;
          unlockCriteria = ?450;
          storyline = ? "King Arkey reigns supreme...";
        };
      };
      case (11) {
        ? {
          id = 12;
          name = "67 Kid";
          description = "Master assassin with lightning speed.";
          url = "https://game-assets.icp/sprites/67kid.png";
          stats = { health = 175; attack = 73; defense = 37; speed = 40; magic = 18; level = 1 };
          unlocked = true;
          unlockCriteria = ?600;
          storyline = ? "67 Kid strikes before you see him...";
        };
      };
      case (12) {
        ? {
          id = 13;
          name = "Zeus";
          description = "Godlike killer wielding thunder.";
          url = "https://game-assets.icp/sprites/zeus.png";
          stats = { health = 145; attack = 100; defense = 45; speed = 27; magic = 65; level = 1 };
          unlocked = true;
          unlockCriteria = ?900;
          storyline = ? "Zeus brings divine wrath upon the world...";
        };
      };
      case (_) { null };
    };

    switch (nextKiller) {
      case (?killer) {
        let updatedProfile = PlayerProfileExtensions.withKillers(
          currentProfile,
          currentProfile.killers.concat([killer])
        );
        playerProfiles.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("No more killers to unlock") };
    };
  };

  public shared ({ caller }) func addWeapon(weapon : Weapon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add weapons");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let updatedProfile = PlayerProfileExtensions.withWeapons(
      currentProfile,
      currentProfile.weapons.concat([weapon])
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func equipWeapon(weaponName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can equip weapons");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let weapon = currentProfile.weapons.find(func(w) { w.name == weaponName });

    let updatedProfile = PlayerProfileExtensions.withEquippedWeapon(currentProfile, weapon);
    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func addPet(pet : Pet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add pets");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let updatedProfile = PlayerProfileExtensions.withPets(
      currentProfile,
      currentProfile.pets.concat([pet])
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func equipPet(petName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can equip pets");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let pet = currentProfile.pets.find(func(p) { p.name == petName });

    let updatedProfile = PlayerProfileExtensions.withEquippedPet(currentProfile, pet);
    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func purchaseAdminPanel() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase admin panel");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    if (currentProfile.hasAdminPanel) {
      Runtime.trap("Admin panel already purchased");
    };

    if (currentProfile.currency < adminPanelCost) {
      Runtime.trap("Insufficient currency");
    };

    let updatedProfile = PlayerProfileExtensions.withAdminPanel(
      PlayerProfileExtensions.withCurrency(currentProfile, currentProfile.currency - adminPanelCost),
      true,
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func adminGrantCurrency(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let updatedProfile = PlayerProfileExtensions.withCurrency(
      currentProfile,
      currentProfile.currency + amount,
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func adminUnlockKiller(killerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let updatedKillers = currentProfile.killers.map(
      func(k) {
        if (k.id == killerId) {
          {
            id = k.id;
            name = k.name;
            description = k.description;
            url = k.url;
            stats = k.stats;
            unlocked = true;
            unlockCriteria = k.unlockCriteria;
            storyline = k.storyline;
          };
        } else {
          k;
        };
      }
    );

    let updatedProfile = PlayerProfileExtensions.withKillers(currentProfile, updatedKillers);
    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func adminSetLevel(survivorName : Text, newLevel : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    if (newLevel < 1 or newLevel > 2400) {
      Runtime.trap("Level must be between 1 and 2400");
    };

    let updatedSurvivors = currentProfile.survivors.map(
      func(s) {
        if (s.name == survivorName) {
          {
            name = s.name;
            level = newLevel;
            experience = s.experience;
            stats = {
              health = s.stats.health;
              attack = s.stats.attack;
              defense = s.stats.defense;
              speed = s.stats.speed;
              magic = s.stats.magic;
              level = newLevel;
            };
          };
        } else {
          s;
        };
      }
    );

    let updatedProfile = PlayerProfileExtensions.withSurvivors(currentProfile, updatedSurvivors);
    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func earnCurrency(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can earn currency");
    };

    let currentProfile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    let updatedProfile = PlayerProfileExtensions.withCurrency(
      currentProfile,
      currentProfile.currency + amount,
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func startCombat(enemy : Enemy) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start combat");
    };

    let profile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("You have to create a profile before you can start combat") };
    };

    let survivor = switch (profile.activeSurvivor) {
      case (?survivor) { survivor };
      case (null) { Runtime.trap("Empty Survivor is not viable to attempt combat") };
    };

    switch (combatStatus.get(caller)) {
      case (?status) {
        if (status.combatOngoing) {
          Runtime.trap("Combat already in progress. Finish current combat before starting a new one");
        };
      };
      case (null) {};
    };

    forceStoreCombatStatus(caller, {
      enemyName = enemy.name;
      enemyHealth = enemy.health;
      playerHealth = survivor.stats.health;
      playerActiveSurvivor = survivor;
      combatOngoing = true;
    });
  };

  public shared ({ caller }) func performAttack(enemy : Enemy) : async CombatDetails {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform attacks");
    };

    let currentCombatStatus = switch (combatStatus.get(caller)) {
      case (?status) {
        if (not status.combatOngoing) {
          Runtime.trap("No active combat session. Start combat first");
        };
        status;
      };
      case (null) {
        Runtime.trap("No active combat session. Start combat first");
      };
    };

    let profile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("You have to create a profile before you can start combat") };
    };

    let survivor = switch (profile.activeSurvivor) {
      case (?survivor) { survivor };
      case (null) { Runtime.trap("Empty Survivor is not viable to attempt combat") };
    };

    let attackResult = calculateAttack(survivor, enemy);

    let finalAttackResult = updateHealth(attackResult, currentCombatStatus.playerHealth, currentCombatStatus.enemyHealth);

    let combatResult = calculateCombatResult(caller, enemy, survivor, finalAttackResult.playerAlive, finalAttackResult.enemyAlive);

    let combatDetails : CombatDetails = {
      playerStats = survivor;
      enemyStats = enemy;
      playerHealth = currentCombatStatus.playerHealth;
      enemyHealth = currentCombatStatus.enemyHealth;
      rewardedCurrency = 0;
      rewardedExp = 0;
      status = {
        enemyName = enemy.name;
        enemyHealth = currentCombatStatus.enemyHealth;
        playerHealth = currentCombatStatus.playerHealth;
        playerActiveSurvivor = survivor;
        combatOngoing = currentCombatStatus.playerHealth > 0 and currentCombatStatus.enemyHealth > 0;
      };
      result = combatResult;
    };

    forceStoreCombatStatus(caller, combatDetails.status);

    switch (combatResult) {
      case (null) { combatDetails };
      case (?result) {
        let updatedSurvivors = profile.survivors.map(
          func(s) {
            if (s.name == survivor.name) {
              {
                name = s.name;
                level = s.level;
                experience = s.experience + result.rewardExp;
                stats = s.stats;
              };
            } else {
              s;
            };
          }
        );

        let updatedProfile = PlayerProfileExtensions.withSurvivors(
          PlayerProfileExtensions.withCurrency(
            profile,
            profile.currency + result.rewardCurrency,
          ),
          updatedSurvivors,
        );

        playerProfiles.add(caller, updatedProfile);

        markCombatEnded(caller);

        {
          combatDetails with
          rewardedCurrency = result.rewardCurrency;
          rewardedExp = result.rewardExp;
          result = ?result;
        };
      };
    };
  };

  public shared ({ caller }) func performMagicAttack(_enemy : Enemy) : async CombatDetails {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform magic attacks");
    };

    switch (combatStatus.get(caller)) {
      case (?status) {
        if (not status.combatOngoing) {
          Runtime.trap("No active combat session. Start combat first");
        };
      };
      case (null) {
        Runtime.trap("No active combat session. Start combat first");
      };
    };

    Runtime.trap("Combination attacks are not yet supported. Coming soon!");
  };

  public query ({ caller }) func getCombatStatus() : async ?CombatStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view combat status");
    };
    combatStatus.get(caller);
  };

  func calculateAttack(survivor : Survivor, enemy : Enemy) : AttackResult {
    let playerCritical = false;
    let enemyCritical = false;
    let playerWasCriticalHit = false;

    {
      playerAttack = survivor.stats.attack;
      enemyAttack = enemy.attack;
      playerCritical;
      enemyCritical;
      playerWasCriticalHit;
      playerAlive = true;
      enemyAlive = true;
    };
  };

  func updateHealth(attackResult : AttackResult, playerHealth : Nat, enemyHealth : Nat) : AttackResult {
    let newPlayerHealth = switch (playerHealth, attackResult.enemyAttack) {
      case (playerHealth, enemyAttack) {
        if (playerHealth > enemyAttack) { playerHealth - enemyAttack } else {
          0;
        };
      };
    };

    let newEnemyHealth = switch (enemyHealth, attackResult.playerAttack) {
      case (enemyHealth, playerAttack) {
        if (enemyHealth > playerAttack) {
          enemyHealth - playerAttack;
        } else {
          0;
        };
      };
    };

    {
      attackResult with
      playerAlive = newPlayerHealth > 0;
      enemyAlive = newEnemyHealth > 0;
    };
  };

  func calculateCombatResult(_caller : Principal, enemy : Enemy, _player : Survivor, playerAlive : Bool, enemyAlive : Bool) : ?CombatResult {
    if (not enemyAlive and playerAlive) {
      ?{
        rewardCurrency = enemy.goldReward;
        rewardExp = enemy.expReward;
        winner = #player;
      };
    } else if (not playerAlive) {
      ?{
        rewardCurrency = 0;
        rewardExp = 0;
        winner = #enemy;
      };
    } else {
      null;
    };
  };

  func addReward(_caller : Principal, _reward : Nat) {
    // Implementation placeholder
  };

  func markCombatEnded(caller : Principal) {
    let currentStatus = switch (combatStatus.get(caller)) {
      case (?status) { status };
      case (null) { { enemyName = "not found"; enemyHealth = 0; playerHealth = 0; playerActiveSurvivor = { name = "not found"; level = 0; experience = 0; stats = { health = 0; attack = 0; defense = 0; speed = 0; magic = 0; level = 0 } }; combatOngoing = false } };
    };

    let updatedStatus = {
      currentStatus with
      combatOngoing = false;
    };
    combatStatus.add(caller, updatedStatus);
  };

  func forceStoreCombatStatus(caller : Principal, status : CombatStatus) {
    combatStatus.add(caller, status);
  };

  public query ({ caller }) func getAllDungeonMaps() : async [Dungeon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dungeons");
    };
    dungeons.values().toArray();
  };

  public query ({ caller }) func getActiveDungeonMaps() : async [Dungeon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dungeons");
    };
    dungeons.values().toArray();
  };

  public query ({ caller }) func getAllDungeonKeys() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view keys");
    };
    ["forest_key", "cloud_key", "cave_key", "dungeon_map"];
  };

  public query ({ caller }) func getAvailableDungeonMaps() : async ?[Dungeon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dungeons");
    };
    ?dungeons.values().toArray().filter(func(d) { d.difficulty == 1 });
  };

  public query ({ caller }) func getAllKeys() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view keys");
    };
    ["forest_key", "cloud_key", "cave_key", "dungeon_map"];
  };

  public shared ({ caller }) func startQuest(questId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start quests");
    };

    let profile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    if (profile.completedQuests.find(func(q) { q == questId }) != null) {
      Runtime.trap("Quest already completed");
    };

    // Quest is now active (tracked by frontend or additional state if needed)
  };

  public shared ({ caller }) func completeQuest(questId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete quests");
    };

    let profile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    if (profile.completedQuests.find(func(q) { q == questId }) != null) {
      Runtime.trap("Quest already completed");
    };

    // Find the quest to get reward
    var questReward : Nat = 0;
    for (dungeon in dungeons.values()) {
      switch (dungeon.quests.find(func(q) { q.id == questId })) {
        case (?quest) {
          questReward := quest.rewardCurrency;
        };
        case (null) {};
      };
    };

    let updatedProfile = PlayerProfileExtensions.withCompletedQuests(
      PlayerProfileExtensions.withCurrency(profile, profile.currency + questReward),
      profile.completedQuests.concat([questId])
    );

    playerProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func unlockCrate(crateId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock crates");
    };

    let profile = switch (playerProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    if (profile.openedCrates.find(func(c) { c == crateId }) != null) {
      Runtime.trap("Crate already opened");
    };

    // Find the crate and check key requirement
    var crate : ?Crate = null;
    for (dungeon in dungeons.values()) {
      switch (dungeon.availableCrates.find(func(c) { c.id == crateId })) {
        case (?foundCrate) {
          crate := ?foundCrate;
        };
        case (null) {};
      };
    };

    let foundCrate = switch (crate) {
      case (?c) { c };
      case (null) { Runtime.trap("Crate not found") };
    };

    // Check if caller has the required key
    if (profile.collectedKeys.find(func(k) { k == foundCrate.requiredKey }) == null) {
      Runtime.trap("You do not have the required key to unlock this crate");
    };

    // Grant reward and mark crate as opened
    let updatedProfile = PlayerProfileExtensions.withOpenedCrates(
      PlayerProfileExtensions.withCurrency(profile, profile.currency + foundCrate.reward),
      profile.openedCrates.concat([crateId])
    );

    playerProfiles.add(caller, updatedProfile);
  };

  module PlayerProfileExtensions {
    public func withKillers(profile : PlayerProfile, newKillers : [Killer]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = newKillers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withCurrency(profile : PlayerProfile, newCurrency : Nat) : PlayerProfile {
      {
        currency = newCurrency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withSurvivors(profile : PlayerProfile, newSurvivors : [Survivor]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = newSurvivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withActiveSurvivor(profile : PlayerProfile, newActiveSurvivor : ?Survivor) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = newActiveSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withWeapons(profile : PlayerProfile, newWeapons : [Weapon]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = newWeapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withEquippedWeapon(profile : PlayerProfile, newEquippedWeapon : ?Weapon) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = newEquippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withPets(profile : PlayerProfile, newPets : [Pet]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = newPets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withEquippedPet(profile : PlayerProfile, newEquippedPet : ?Pet) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = newEquippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withAdminPanel(profile : PlayerProfile, hasPanel : Bool) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = hasPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withCompletedQuests(profile : PlayerProfile, newCompletedQuests : [Nat]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = newCompletedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = profile.openedCrates;
      };
    };

    public func withOpenedCrates(profile : PlayerProfile, newOpenedCrates : [Nat]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        killers = profile.killers;
        survivors = profile.survivors;
        weapons = profile.weapons;
        pets = profile.pets;
        activeSurvivor = profile.activeSurvivor;
        equippedWeapon = profile.equippedWeapon;
        equippedPet = profile.equippedPet;
        storylineProgress = profile.storylineProgress;
        equippedArmor = profile.equippedArmor;
        activeDungeonId = profile.activeDungeonId;
        completedQuests = profile.completedQuests;
        inventory = profile.inventory;
        collectedKeys = profile.collectedKeys;
        openedCrates = newOpenedCrates;
      };
    };
  };
};
