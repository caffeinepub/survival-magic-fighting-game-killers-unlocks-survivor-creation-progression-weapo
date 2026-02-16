import Array "mo:core/Array";
import Bool "mo:core/Bool";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Add migration via with CLAUSE
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
    username : Text;
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
    // Aura Clicker State
    auraPower : Nat;
    auraLevel : Nat;
    rebirthCount : Nat;
    rebirthMultiplier : Nat;
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
  let usernames = Map.empty<Text, Principal>(); // Text -> Principal
  let combatStatus = Map.empty<Principal, CombatStatus>();
  let whyDontYouJoins = Map.empty<Nat, WhyDontYouJoin>();
  let clans = Map.empty<Nat, Clan>();
  let dungeons = Map.empty<Nat, Dungeon>();

  // Friends/Followers System
  let followers = Map.empty<Principal, Map.Map<Principal, ()>>();
  let bots = Map.empty<Nat, Bot>();
  let botCombatStatus = Map.empty<Principal, BotCombatStatus>();
  let announcements = Map.empty<Nat, Announcement>();
  let shopItems = Map.empty<Nat, ShopItem>();

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

  public type ShopItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    itemType : ItemType;
    bonusStat : ?Stat;
  };

  public type ItemType = {
    #weapon;
    #armor;
    #pet;
    #key;
    #currencyPack;
    #misc;
  };

  public type Stat = {
    #attack : Nat;
    #defense : Nat;
    #speed : Nat;
    #magic : Nat;
    #health : Nat;
    #experience : Nat;
    #level : Nat;
  };

  public type Bot = {
    id : Nat;
    name : Text;
    url : Text;
    description : Text;
    difficulty : Nat;
    rewardCurrency : Nat;
    rewardExp : Nat;
  };

  public type BotCombatStatus = {
    botId : Nat;
    botName : Text;
    botHealth : Nat;
    playerHealth : Nat;
    playerActiveSurvivor : Survivor;
    combatOngoing : Bool;
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    message : Text;
    createdBy : Principal;
    timestamp : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func nextAnnouncementId() : Nat {
    let nextId = announcements.size() + 1;
    if (announcements.containsKey(nextId)) {
      return nextId + 1;
    };
    nextId;
  };

  func nextShopItemId() : Nat {
    let nextId = shopItems.size() + 1;
    if (shopItems.containsKey(nextId)) {
      return nextId + 1;
    };
    nextId;
  };

  // Username Validation Logic
  let minLength = 3;
  let maxLength = 20;

  // Active usernames

  func isUsernameValid(username : Text) : Bool {
    // Get the length of the username string
    let length = getLength(username);

    // Check if the length: is within range (between 3 and 20)
    if (length < minLength or length > maxLength) {
      return false;
    };

    // Helper function to check if a character is valid
    func isValidChar(c : Char) : Bool {
      // Accept [a-z, A-Z, 0-9, _] only
      let asciiVal = c.toNat32();
      (asciiVal >= 0x30 and asciiVal <= 0x39) or // 0-9
      (asciiVal >= 0x41 and asciiVal <= 0x5A) or // A-Z
      (asciiVal >= 0x61 and asciiVal <= 0x7A) or // a-z
      (asciiVal == 0x5F) // Underscore
    };

    // Convert the username string to an array of characters using Text.toArray
    let chars = username.toArray();

    // Validate each character in the username
    for (c in chars.values()) {
      if (not isValidChar(c)) {
        return false;
      };
    };

    true;
  };

  // Helper function to get the length of a string (counts characters)
  func getLength(t : Text) : Nat {
    // Use Pattern/Matcher approach to count each character
    let charIter = t.chars();
    // Convert to array to get the length (in code points)
    charIter.toArray().size();
  };

  public type UsernameUpdateResult = {
    #success;
    #invalidLength;
    #invalidCharacters;
    #alreadyTaken;
    #internalError : Text;
    #createdUsername : Text;
  };

  // Get currently set username for caller (user: only)
  public query ({ caller }) func getCallerUsername() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their username");
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) { ?profile.username };
      case (null) { null };
    };
  };

  // Resolve username to Principal (user only - for social features like following by username)
  public query ({ caller }) func getUsernameForPrincipal(user : Principal) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resolve usernames");
    };

    switch (playerProfiles.get(user)) {
      case (?profile) {
        if (profile.username == "") {
          null
        } else {
          ?profile.username
        };
      };
      case (null) { null };
    };
  };

  // Resolve Principal by username (user only - for social features like following by username)
  public query ({ caller }) func getPrincipalForUsername(username : Text) : async ?Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resolve principals");
    };

    usernames.get(username);
  };

  // Check the validity of a given username
  public query func checkUsername(username : Text) : async UsernameUpdateResult {
    let length = getLength(username);
    if (length < minLength or length > maxLength) {
      Runtime.trap("Invalid username length, must be between 3 and 20");
    };

    if (not isUsernameValid(username)) {
      Runtime.trap("Invalid characters in username");
    };

    switch (usernames.get(username)) {
      case (?_existing) { Runtime.trap("Username already taken") };
      case (null) {};
    };

    #success;
  };

  // Set initial username for caller (called on signup)
  public shared ({ caller }) func setUsername(username : Text) : async UsernameUpdateResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set username");
    };

    let result = checkUsernameInternal(username);
    if (result != #success) {
      return result;
    };

    // Update profile and username mapping
    let profile = switch (playerProfiles.get(caller)) {
      case (?p) { p };
      case (null) {
        return #internalError("User profile not found. Unexpected error.");
      };
    };

    // Remove old username if exists
    let oldUsername = profile.username;
    if (oldUsername != "") {
      usernames.remove(oldUsername);
    };

    // Add new mapping and update profile
    usernames.add(username, caller);
    playerProfiles.add(caller, { profile with username });

    #createdUsername(username);
  };

  // Internal username check for update
  func checkUsernameInternal(username : Text) : UsernameUpdateResult {
    let length = getLength(username);
    if (length < minLength or length > maxLength) {
      return #invalidLength;
    };

    if (not isUsernameValid(username)) {
      return #invalidCharacters;
    };

    switch (usernames.get(username)) {
      case (?_existing) { return #alreadyTaken };
      case (null) {};
    };

    #success;
  };

  // Announcements - Admin can create, anyone (including guests) can view
  public shared ({ caller }) func createAnnouncement(title : Text, message : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create announcements");
    };

    let announcement : Announcement = {
      id = nextAnnouncementId();
      title;
      message;
      createdBy = caller;
      timestamp = Int.abs(Time.now());
    };
    announcements.add(announcement.id, announcement);
  };

  // Guest accessible - no authorization check needed
  public query func getAllAnnouncements() : async [Announcement] {
    let iter = announcements.values();
    iter.toArray();
  };

  // Guest accessible - no authorization check needed
  public query func getAnnouncement(id : Nat) : async ?Announcement {
    announcements.get(id);
  };

  // Shop Items - Guest accessible for browsing
  public query func getAllShopItems() : async [ShopItem] {
    let iter = shopItems.values();
    iter.toArray();
  };

  public query func getShopItem(id : Nat) : async ?ShopItem {
    shopItems.get(id);
  };

  public query ({ caller }) func profileExists() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check profile existence");
    };
    playerProfiles.containsKey(caller);
  };

  // Purchase shop item - User only
  public shared ({ caller }) func purchaseShopItem(itemId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase items");
    };

    let item = switch (shopItems.get(itemId)) {
      case (?i) { i };
      case (null) {
        Runtime.trap("Shop item not found");
      };
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) {
        if (profile.currency < item.price) {
          Runtime.trap("Insufficient funds to purchase this item");
        };

        let updatedProfile = { profile with currency = profile.currency - item.price };
        playerProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  // Bot Combat - Guest accessible for listing, user only for combat
  public query func getAllBots() : async [Bot] {
    let iter = bots.values();
    iter.toArray();
  };

  public query func getBot(id : Nat) : async ?Bot {
    bots.get(id);
  };

  // Start bot combat - User only
  public shared ({ caller }) func startBotCombat(botId : Nat) : async BotCombatStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start bot combat");
    };

    let bot = switch (bots.get(botId)) {
      case (?b) { b };
      case (null) {
        Runtime.trap("Bot not found");
      };
    };

    let profile = switch (playerProfiles.get(caller)) {
      case (?p) { p };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };

    let activeSurvivor = switch (profile.activeSurvivor) {
      case (?s) { s };
      case (null) {
        Runtime.trap("No active survivor selected");
      };
    };

    let status : BotCombatStatus = {
      botId = bot.id;
      botName = bot.name;
      botHealth = bot.difficulty * 100;
      playerHealth = activeSurvivor.stats.health;
      playerActiveSurvivor = activeSurvivor;
      combatOngoing = true;
    };

    botCombatStatus.add(caller, status);
    status;
  };

  // Attack bot - User only
  public shared ({ caller }) func attackBot() : async BotCombatStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can attack bots");
    };

    let status = switch (botCombatStatus.get(caller)) {
      case (?s) { s };
      case (null) {
        Runtime.trap("No active bot combat found");
      };
    };

    if (not status.combatOngoing) {
      Runtime.trap("Bot combat has already ended");
    };

    let bot = switch (bots.get(status.botId)) {
      case (?b) { b };
      case (null) {
        Runtime.trap("Bot not found");
      };
    };

    let playerDamage = status.playerActiveSurvivor.stats.attack;
    let botDamage = bot.difficulty * 5;

    let newBotHealth = if (status.botHealth > playerDamage) {
      status.botHealth - playerDamage;
    } else {
      0;
    };

    let newPlayerHealth = if (status.playerHealth > botDamage) {
      status.playerHealth - botDamage;
    } else {
      0;
    };

    let combatOngoing = newBotHealth > 0 and newPlayerHealth > 0;

    let updatedStatus : BotCombatStatus = {
      status with
      botHealth = newBotHealth;
      playerHealth = newPlayerHealth;
      combatOngoing;
    };

    botCombatStatus.add(caller, updatedStatus);

    // If player won, reward them
    if (newBotHealth == 0 and newPlayerHealth > 0) {
      switch (playerProfiles.get(caller)) {
        case (?profile) {
          let newCurrency = profile.currency + bot.rewardCurrency;
          let updatedProfile = { profile with currency = newCurrency };
          playerProfiles.add(caller, updatedProfile);
        };
        case (null) {};
      };
    };

    updatedStatus;
  };

  // Get bot combat status - User only, ownership check
  public query ({ caller }) func getBotCombatStatus() : async ?BotCombatStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view combat status");
    };
    botCombatStatus.get(caller);
  };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view admin panel events");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following list");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };

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

  public shared ({ caller }) func createPlayerProfile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (playerProfiles.containsKey(caller)) {
      Runtime.trap("Profile already exists for this caller");
    };

    let newProfile : PlayerProfile = {
      username = "";
      currency = 0;
      hasAdminPanel = false;
      killers = [];
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
      auraPower = 0;
      auraLevel = 0;
      rebirthCount = 0;
      rebirthMultiplier = 0;
    };

    playerProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func clickAura() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play Aura Clicker");
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) {
        let auraIncrement = profile.rebirthMultiplier;
        let newAuraPower = profile.auraPower + auraIncrement;

        // Calculate level progression based on rebirth count
        let levelRequirement = calculateLevelRequirement(profile.auraLevel, profile.rebirthCount);

        var newAuraLevel = profile.auraLevel;
        var remainingPower = newAuraPower;

        // Auto-level up if power exceeds requirement
        while (remainingPower >= levelRequirement) {
          remainingPower := remainingPower - levelRequirement;
          newAuraLevel := newAuraLevel + 1;
        };

        let updatedProfile = {
          profile with
          auraPower = remainingPower;
          auraLevel = newAuraLevel;
        };
        playerProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public shared ({ caller }) func rebirth() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rebirth in Aura Clicker");
    };

    switch (playerProfiles.get(caller)) {
      case (?profile) {
        if (profile.rebirthCount >= 1_000_000) {
          Runtime.trap("Maximum rebirth count reached (1,000,000)");
        };

        let newRebirthCount = profile.rebirthCount + 1;
        let newMultiplier = newRebirthCount * 2;

        let updatedProfile = {
          profile with
          auraPower = 0;
          auraLevel = 1;
          rebirthCount = newRebirthCount;
          rebirthMultiplier = newMultiplier;
        };
        playerProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  // Helper function to calculate level requirement based on current level and rebirth count
  func calculateLevelRequirement(level : Nat, rebirthCount : Nat) : Nat {
    // Base requirement increases with level
    let baseRequirement = level * 100;
    // Each rebirth makes requirements harder (exponential growth)
    let rebirthMultiplier = if (rebirthCount == 0) { 1 } else { rebirthCount * rebirthCount };
    baseRequirement * rebirthMultiplier;
  };

  module PlayerProfileExtensions {
    public func withKillers(profile : PlayerProfile, newKillers : [Killer]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withCurrency(profile : PlayerProfile, newCurrency : Nat) : PlayerProfile {
      {
        currency = newCurrency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withSurvivors(profile : PlayerProfile, newSurvivors : [Survivor]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withActiveSurvivor(profile : PlayerProfile, newActiveSurvivor : ?Survivor) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withWeapons(profile : PlayerProfile, newWeapons : [Weapon]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withEquippedWeapon(profile : PlayerProfile, newEquippedWeapon : ?Weapon) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withPets(profile : PlayerProfile, newPets : [Pet]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withEquippedPet(profile : PlayerProfile, newEquippedPet : ?Pet) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withAdminPanel(profile : PlayerProfile, hasPanel : Bool) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = hasPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withCompletedQuests(profile : PlayerProfile, newCompletedQuests : [Nat]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };

    public func withOpenedCrates(profile : PlayerProfile, newOpenedCrates : [Nat]) : PlayerProfile {
      {
        currency = profile.currency;
        hasAdminPanel = profile.hasAdminPanel;
        username = profile.username;
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
        auraPower = profile.auraPower;
        auraLevel = profile.auraLevel;
        rebirthCount = profile.rebirthCount;
        rebirthMultiplier = profile.rebirthMultiplier;
      };
    };
  };
};
