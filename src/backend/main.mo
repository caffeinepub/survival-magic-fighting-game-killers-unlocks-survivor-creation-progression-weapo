import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
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

  let adminPanelEvents = Map.empty<Principal, Map.Map<Nat, AdminPanelEvent>>();

  let playerProfiles = Map.empty<Principal, PlayerProfile>();
  let combatStatus = Map.empty<Principal, CombatStatus>();
  var whyDontYouJoins = Map.empty<Nat, WhyDontYouJoin>();
  var clans = Map.empty<Nat, Clan>();
  var dungeons = Map.empty<Nat, Dungeon>();

  // Friends/Followers System
  let followers = Map.empty<Principal, Map.Map<Principal, ()>>();

  let currencyConversionRate = 639_273_000_000_012;
  let adminPanelCost : Nat = 1_000_000_000;
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

  public type AdminPanelEvent = {
    id : Nat;
    creator : Principal;
    eventName : Text;
    description : Text;
    timestamp : Nat;
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

  func nextAdminPanelEventId(caller : Principal) : Nat {
    switch (adminPanelEvents.get(caller)) {
      case (?userEvents) { userEvents.size() + 1 };
      case (null) { 1 };
    };
  };

  public shared ({ caller }) func createAdminPanelEvent(eventName : Text, description : Text, timestamp : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) {
        if (not profile.hasAdminPanel) {
          Runtime.trap(
            "User does not have access to the Admin Panel. To create events and use its features, please purchase and activate the Admin Panel"
          );
        };
      };
      case (null) {
        Runtime.trap("User profile not found. Please check your account and try again.");
      };
    };

    let eventId = nextAdminPanelEventId(caller);
    let newEvent : AdminPanelEvent = {
      id = eventId;
      creator = caller;
      eventName;
      description;
      timestamp;
    };

    switch (adminPanelEvents.get(caller)) {
      case (?userEvents) {
        let updatedEvents = userEvents.clone();
        updatedEvents.add(eventId, newEvent);
        adminPanelEvents.add(caller, updatedEvents);
      };
      case (null) {
        let newEvents = Map.empty<Nat, AdminPanelEvent>();
        newEvents.add(eventId, newEvent);
        adminPanelEvents.add(caller, newEvents);
      };
    };
  };

  public query ({ caller }) func getAdminPanelEventsForCaller() : async [AdminPanelEvent] {
    switch (playerProfiles.get(caller)) {
      case (?profile) {
        if (not profile.hasAdminPanel) {
          Runtime.trap("User does not have access to the Admin Panel. To view events, please purchase and activate the Admin Panel. ");
        };
      };
      case (null) {
        Runtime.trap("User profile not found. Please check your account and try again.");
      };
    };

    switch (adminPanelEvents.get(caller)) {
      case (?userEvents) {
        return userEvents.values().toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAdminPanelEventsForUser(user : Principal) : async [AdminPanelEvent] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own admin panel events");
    };

    switch (playerProfiles.get(user)) {
      case (?profile) {
        if (not profile.hasAdminPanel) {
          Runtime.trap("User does not have access to the Admin Panel. To view events, please purchase and activate the Admin Panel. ");
        };
      };
      case (null) {
        Runtime.trap("User profile not found. Please check your account and try again.");
      };
    };

    switch (adminPanelEvents.get(user)) {
      case (?userEvents) {
        return userEvents.values().toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getUserAdminPanelEvent(user : Principal, eventId : Nat) : async ?AdminPanelEvent {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own admin panel events");
    };

    switch (adminPanelEvents.get(user)) {
      case (?userEvents) {
        userEvents.get(eventId);
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func purchaseAdminPanel() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can make purchases");
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) {
        if (profile.currency < adminPanelCost) {
          Runtime.trap("Insufficient funds. The Admin Panel costs 1,000,000,000. Please earn more currency and try again.");
        };

        let updatedProfile : PlayerProfile = { profile with currency = profile.currency - adminPanelCost; hasAdminPanel = true };
        playerProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("User profile not found. Please check your account and try again.");
      };
    };
  };

  // Friends/Followers system methods
  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == target) {
      Runtime.trap("Cannot follow yourself");
    };

    let targetFollowers = switch (followers.get(target)) {
      case (?followersMap) { followersMap };
      case (null) {
        let followersMap = Map.empty<Principal, ()>();
        followers.add(target, followersMap);
        followersMap;
      };
    };

    switch (targetFollowers.get(caller)) {
      case (null) {};
      case (_) {
        Runtime.trap("You are already following this user");
      };
    };

    targetFollowers.add(caller, ());
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    if (caller == target) {
      Runtime.trap("Cannot unfollow yourself");
    };

    switch (followers.get(target)) {
      case (null) {
        Runtime.trap("You are not following this user, cannot unfollow them");
      };
      case (?targetFollowers) {
        switch (targetFollowers.get(caller)) {
          case (null) {
            Runtime.trap("You are not following this user");
          };
          case (_) { targetFollowers.remove(caller) };
        };
      };
    };
  };

  public query ({ caller }) func getWhoCallerFollowing() : async [Principal] {
    let iter = followers.entries();
    let following = iter.toArray().filter(
      func((followee, followersMap)) { followersMap.containsKey(caller) }
    );
    following.map(func((followee, _followers)) { followee });
  };

  public query ({ caller }) func getWhoUserIsFollowing(user : Principal) : async [Principal] {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own list of who you are following");
    };
    let iter = followers.entries();
    let following = iter.toArray().filter(
      func((followee, followersMap)) { followersMap.containsKey(user) }
    );
    following.map(func((followee, _followers)) { followee });
  };

  public query ({ caller }) func getWhoIsFollowingCaller() : async [Principal] {
    switch (followers.get(caller)) {
      case (?followersMap) { followersMap.keys().toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getWhoIsFollowingUser(user : Principal) : async [Principal] {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own list of who follows you");
    };
    switch (followers.get(user)) {
      case (?followersMap) { followersMap.keys().toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getCallersFriends() : async [Principal] {
    let userFollowers = switch (followers.get(caller)) {
      case (?followersMap) { followersMap };
      case (null) { return [] };
    };

    let friends = userFollowers.keys().toArray().filter(
      func(follower) {
        switch (followers.get(follower)) {
          case (?followerFollowersMap) {
            followerFollowersMap.containsKey(caller);
          };
          case (null) { false };
        };
      }
    );
    friends;
  };

  public query ({ caller }) func getUsersFriends(user : Principal) : async [Principal] {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friends");
    };

    let userFollowers = switch (followers.get(user)) {
      case (?followersMap) { followersMap };
      case (null) { return [] };
    };

    let friends = userFollowers.keys().toArray().filter(
      func(follower) {
        switch (followers.get(follower)) {
          case (?followerFollowersMap) {
            followerFollowersMap.containsKey(user);
          };
          case (null) { false };
        };
      }
    );
    friends;
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
