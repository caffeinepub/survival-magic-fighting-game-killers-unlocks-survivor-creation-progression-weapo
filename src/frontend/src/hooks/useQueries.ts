import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Survivor, Weapon, Pet, AdminPanelEvent, Bot, BotCombatStatus, Announcement, ShopItem, UsernameUpdateResult } from '../backend';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

// Type aliases for compatibility with existing code
type PlayerProfile = UserProfile;
type Enemy = any;
type CombatDetails = any;
type Clan = any;
type WhyDontYouJoin = any;
type Dungeon = any;

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<PlayerProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreatePlayerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      if (typeof actor.createPlayerProfile !== 'function') {
        throw new Error('Profile creation is not available. Please refresh the page.');
      }

      return actor.createPlayerProfile();
    },
    onSuccess: async () => {
      // Don't show success toast here - wait for username to be set
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create profile';
      
      // Handle specific error cases with user-friendly messages
      if (errorMessage.includes('already exists')) {
        toast.error('Profile already exists for your account');
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You must be logged in to create a profile');
      } else if (errorMessage.includes('not available')) {
        toast.error('Connection not available. Please try again.');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

export function useSetUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      if (typeof actor.setUsername !== 'function') {
        throw new Error('Username setup is not available. Please refresh the page.');
      }

      return actor.setUsername(username);
    },
    onSuccess: async (result: UsernameUpdateResult) => {
      // Invalidate and refetch to ensure the app transitions away from profile setup
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.refetchQueries({ queryKey: ['currentUserProfile'] });
      
      if (result.__kind__ === 'createdUsername') {
        toast.success(`Profile created! Welcome, ${result.createdUsername}!`);
      } else if (result.__kind__ === 'success') {
        toast.success('Username set successfully!');
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to set username';
      
      // Map backend errors to user-friendly messages
      if (errorMessage.includes('Invalid username length')) {
        toast.error('Username must be between 3 and 20 characters');
      } else if (errorMessage.includes('Invalid characters')) {
        toast.error('Username can only contain letters, numbers, and underscores');
      } else if (errorMessage.includes('already taken')) {
        toast.error('This username is already taken. Please choose another.');
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You must be logged in to set a username');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Username resolution hooks
export function useGetUsernameForPrincipal(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['username', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUsernameForPrincipal(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useGetPrincipalForUsername(username: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal | null>({
    queryKey: ['principal', username],
    queryFn: async () => {
      if (!actor || !username) return null;
      return actor.getPrincipalForUsername(username);
    },
    enabled: !!actor && !actorFetching && !!username && username.trim().length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Batch username resolution for lists
export function useGetUsernamesForPrincipals(principals: Principal[]) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Map<string, string>>({
    queryKey: ['usernames', principals.map(p => p.toString()).sort().join(',')],
    queryFn: async () => {
      if (!actor || principals.length === 0) return new Map();
      
      const usernameMap = new Map<string, string>();
      
      // Fetch usernames for all principals
      await Promise.all(
        principals.map(async (principal) => {
          try {
            const username = await actor.getUsernameForPrincipal(principal);
            if (username) {
              usernameMap.set(principal.toString(), username);
            }
          } catch (error) {
            // Silently fail for individual lookups
            console.warn(`Failed to fetch username for ${principal.toString()}`);
          }
        })
      );
      
      return usernameMap;
    },
    enabled: !!actor && !actorFetching && principals.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useCreateSurvivor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      stats,
    }: {
      name: string;
      stats: { health: bigint; attack: bigint; defense: bigint; speed: bigint; magic: bigint };
    }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.createSurvivor(name, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Survivor created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create survivor');
    },
  });
}

export function useSetActiveSurvivor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (survivorName: string) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.setActiveSurvivor(survivorName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Active survivor updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set active survivor');
    },
  });
}

export function useUnlockNextKiller() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.unlockNextKiller();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Killer unlocked!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock killer');
    },
  });
}

export function useEquipWeapon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weaponName: string) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.equipWeapon(weaponName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Weapon equipped!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to equip weapon');
    },
  });
}

export function useEquipPet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (petName: string) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.equipPet(petName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Pet equipped!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to equip pet');
    },
  });
}

export function usePurchaseAdminPanel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseAdminPanel();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Admin panel unlocked!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to purchase admin panel');
    },
  });
}

export function useAdminGrantCurrency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.adminGrantCurrency(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Currency granted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to grant currency');
    },
  });
}

export function useAdminUnlockKiller() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (killerId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.adminUnlockKiller(killerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Killer unlocked!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock killer');
    },
  });
}

export function useAdminSetLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ survivorName, level }: { survivorName: string; level: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.adminSetLevel(survivorName, level);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Level updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set level');
    },
  });
}

export function useAddWeapon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weapon: Weapon) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.addWeapon(weapon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Weapon added!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add weapon');
    },
  });
}

export function useAddPet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pet: Pet) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.addPet(pet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Pet added!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add pet');
    },
  });
}

export function useEarnCurrency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.earnCurrency(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to earn currency');
    },
  });
}

export function useStartCombat() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (enemy: Enemy) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.startCombat(enemy);
    },
    onSuccess: () => {
      toast.success('Combat started!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start combat');
    },
  });
}

export function usePerformAttack() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enemy: Enemy) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.performAttack(enemy);
    },
    onSuccess: (data: CombatDetails) => {
      if (data.result) {
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        if (data.result.winner === 'player') {
          toast.success(`Victory! Earned ${Number(data.rewardedCurrency)} gold and ${Number(data.rewardedExp)} EXP!`);
        } else {
          toast.error('Defeated! Better luck next time.');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Attack failed');
    },
  });
}

export function usePerformMagicAttack() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enemy: Enemy) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.performMagicAttack(enemy);
    },
    onSuccess: (data: CombatDetails) => {
      if (data.result) {
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        if (data.result.winner === 'player') {
          toast.success(`Victory! Earned ${Number(data.rewardedCurrency)} gold and ${Number(data.rewardedExp)} EXP!`);
        } else {
          toast.error('Defeated! Better luck next time.');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Magic attack failed');
    },
  });
}

// Clan hooks
export function useGetClanMarketplace() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Clan[]>({
    queryKey: ['clanMarketplace'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.getClanMarketplace();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetActiveWhyDontYouJoins() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WhyDontYouJoin[]>({
    queryKey: ['activeWhyDontYouJoins'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.getActiveWhyDontYouJoins();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddWhyDontYouJoin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, imageUrl }: { name: string; description: string; imageUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.addWhyDontYouJoin(name, description, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeWhyDontYouJoins'] });
      toast.success('Clan listing created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create clan listing');
    },
  });
}

export function useCreateClanFromListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ whyJoinId, clanName }: { whyJoinId: bigint; clanName: string }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.createClanFromListing(whyJoinId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeWhyDontYouJoins'] });
      queryClient.invalidateQueries({ queryKey: ['clanMarketplace'] });
      toast.success('Clan created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create clan');
    },
  });
}

export function useJoinClan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clanId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.joinClan(clanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clanMarketplace'] });
      toast.success('Joined clan successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join clan');
    },
  });
}

export function useJoinRandomClan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.joinRandomClan();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clanMarketplace'] });
      toast.success('Joined a random clan!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join random clan');
    },
  });
}

// Dungeon hooks
export function useGetAllDungeons() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Dungeon[]>({
    queryKey: ['dungeons'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.getAllDungeons();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useStartQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.startQuest(questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Quest started!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start quest');
    },
  });
}

export function useCompleteQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.completeQuest(questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Quest completed! Reward claimed.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete quest');
    },
  });
}

export function useUnlockCrate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (crateId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Method exists in actual backend but not in interface
      return actor.unlockCrate(crateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Crate unlocked! Treasure claimed.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock crate');
    },
  });
}

// Admin Panel Events
export function useGetAdminPanelEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminPanelEvent[]>({
    queryKey: ['adminPanelEvents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminPanelEventsForCaller();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateAdminPanelEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventName, description, timestamp }: { eventName: string; description: string; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAdminPanelEvent(eventName, description, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPanelEvents'] });
      toast.success('Event created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });
}

// Bot Combat
export function useGetAllBots() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Bot[]>({
    queryKey: ['bots'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBots();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useStartBotCombat() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (botId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startBotCombat(botId);
    },
    onSuccess: () => {
      toast.success('Bot combat started!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start bot combat');
    },
  });
}

export function useAttackBot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.attackBot();
    },
    onSuccess: (data: BotCombatStatus) => {
      if (!data.combatOngoing) {
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        if (data.botHealth === 0n) {
          toast.success('Victory! Bot defeated!');
        } else {
          toast.error('Defeated! Better luck next time.');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Attack failed');
    },
  });
}

export function useGetBotCombatStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BotCombatStatus | null>({
    queryKey: ['botCombatStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBotCombatStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.combatOngoing ? 1000 : false;
    },
  });
}

// Announcements
export function useGetAllAnnouncements() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAnnouncement(title, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create announcement');
    },
  });
}

// Shop Items
export function useGetAllShopItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShopItem[]>({
    queryKey: ['shopItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllShopItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function usePurchaseShopItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseShopItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Item purchased successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to purchase item');
    },
  });
}

// Social / Friends / Followers
export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('User followed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to follow user');
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('User unfollowed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unfollow user');
    },
  });
}

export function useGetFollowing() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['following'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWhoCallerFollowing();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFollowers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWhoIsFollowingCaller();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFriends() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallersFriends();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Aura Clicker
export function useClickAura() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clickAura();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to click aura');
    },
  });
}

export function useRebirth() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.rebirth();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Rebirth successful! Your multiplier has increased!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rebirth');
    },
  });
}
