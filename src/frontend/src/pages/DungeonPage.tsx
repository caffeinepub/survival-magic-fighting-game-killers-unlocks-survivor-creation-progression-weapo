import { useGetAllDungeons, useGetCallerUserProfile, useStartQuest, useCompleteQuest, useUnlockCrate } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Lock, Unlock, Key, MapPin, Scroll } from 'lucide-react';
import { useState } from 'react';

export function DungeonPage() {
  const { data: dungeons, isLoading: dungeonsLoading } = useGetAllDungeons();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const startQuest = useStartQuest();
  const completeQuest = useCompleteQuest();
  const unlockCrate = useUnlockCrate();
  const [lastReward, setLastReward] = useState<{ type: 'currency'; amount: number } | null>(null);

  const isLoading = dungeonsLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedQuests = profile?.completedQuests || [];
  const openedCrates = profile?.openedCrates || [];
  const collectedKeys = profile?.collectedKeys || [];

  const handleStartQuest = async (questId: bigint) => {
    try {
      await startQuest.mutateAsync(questId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCompleteQuest = async (questId: bigint) => {
    try {
      await completeQuest.mutateAsync(questId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUnlockCrate = async (crateId: bigint, reward: bigint) => {
    try {
      await unlockCrate.mutateAsync(crateId);
      setLastReward({ type: 'currency', amount: Number(reward) });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isQuestCompleted = (questId: bigint) => {
    return completedQuests.some((id) => id === questId);
  };

  const isCrateOpened = (crateId: bigint) => {
    return openedCrates.some((id) => id === crateId);
  };

  const hasKey = (keyName: string) => {
    return collectedKeys.includes(keyName);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Dungeons</h1>
        <p className="text-muted-foreground">Explore dungeons, complete quests, and unlock treasure crates</p>
      </div>

      {lastReward && (
        <Alert className="border-primary bg-primary/10">
          <Unlock className="h-4 w-4" />
          <AlertDescription>
            <strong>Crate Unlocked!</strong> You received {lastReward.amount} gold!
          </AlertDescription>
        </Alert>
      )}

      {(!dungeons || dungeons.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No dungeons available yet. Check back later!</p>
          </CardContent>
        </Card>
      )}

      {dungeons && dungeons.length > 0 && (
        <div className="space-y-8">
          {dungeons.map((dungeon) => (
            <Card key={Number(dungeon.id)} className="overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                <img
                  src="/assets/generated/dungeon-map.dim_1600x900.png"
                  alt={dungeon.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-foreground">{dungeon.name}</h2>
                  <p className="text-sm text-muted-foreground">{dungeon.description}</p>
                  <Badge variant="outline" className="mt-2">
                    Difficulty: {Number(dungeon.difficulty)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Quests Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Quests</h3>
                  </div>

                  {dungeon.quests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No quests available in this dungeon.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {dungeon.quests.map((quest) => {
                        const completed = isQuestCompleted(quest.id);
                        return (
                          <Card key={Number(quest.id)} className={completed ? 'border-primary/50' : ''}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">{quest.name}</CardTitle>
                                  <CardDescription className="text-sm mt-1">{quest.description}</CardDescription>
                                </div>
                                {completed && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  <Coins className="w-3 h-3 mr-1" />
                                  {Number(quest.rewardCurrency)} gold
                                </Badge>
                                {!completed && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCompleteQuest(quest.id)}
                                    disabled={completeQuest.isPending}
                                  >
                                    {completeQuest.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Complete'
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Crates Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Treasure Crates</h3>
                  </div>

                  {dungeon.availableCrates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No treasure crates in this dungeon.</p>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                      {dungeon.availableCrates.map((crate) => {
                        const opened = isCrateOpened(crate.id);
                        const hasRequiredKey = hasKey(crate.requiredKey);
                        return (
                          <Card key={Number(crate.id)} className={opened ? 'border-muted' : 'border-primary/30'}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-center">
                                <img
                                  src={
                                    opened
                                      ? '/assets/generated/crate-open.dim_512x512.png'
                                      : '/assets/generated/crate-locked.dim_512x512.png'
                                  }
                                  alt={crate.name}
                                  className="w-24 h-24 object-contain"
                                />
                              </div>
                              <div className="text-center">
                                <h4 className="font-semibold">{crate.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{crate.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {crate.location}
                                </p>
                              </div>
                              {!opened && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center gap-2 text-xs">
                                    <Key className="w-3 h-3" />
                                    <span className={hasRequiredKey ? 'text-primary' : 'text-muted-foreground'}>
                                      {crate.requiredKey}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleUnlockCrate(crate.id, crate.reward)}
                                    disabled={!hasRequiredKey || unlockCrate.isPending}
                                  >
                                    {unlockCrate.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : hasRequiredKey ? (
                                      <>
                                        <Unlock className="w-4 h-4 mr-1" />
                                        Unlock
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="w-4 h-4 mr-1" />
                                        Locked
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                              {opened && (
                                <Badge variant="secondary" className="w-full justify-center">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Opened
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Missing import for Coins icon
import { Coins } from 'lucide-react';
