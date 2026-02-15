import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerProfile, Survivor, Weapon, Pet, Enemy, CombatDetails, Clan, WhyDontYouJoin, Dungeon } from '../backend';
import { toast } from 'sonner';

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
      if (!actor) throw new Error('Actor not available');
      return actor.createPlayerProfile();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create profile');
    },
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

export function useCreateClanFromJoin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ whyJoinId, clanName }: { whyJoinId: bigint; clanName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createClanFromJoin(whyJoinId, clanName);
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

export function useJoinExistingClan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clanId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinExistingClan(clanId);
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
      return actor.joinRandomClan();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clanMarketplace'] });
      queryClient.invalidateQueries({ queryKey: ['activeWhyDontYouJoins'] });
      toast.success('Joined random clan successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join random clan');
    },
  });
}

// Dungeon hooks
export function useGetAllDungeonMaps() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Dungeon[]>({
    queryKey: ['dungeonMaps'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDungeonMaps();
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
      return actor.startQuest(questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dungeonMaps'] });
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
      return actor.completeQuest(questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dungeonMaps'] });
      toast.success('Quest completed! Reward claimed!');
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
      return actor.unlockCrate(crateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dungeonMaps'] });
      toast.success('Crate unlocked! Reward claimed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock crate');
    },
  });
}
