import { useGetAllDungeonMaps, useGetCallerUserProfile, useStartQuest, useCompleteQuest, useUnlockCrate } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Lock, Unlock, Key, MapPin, Scroll } from 'lucide-react';
import { useState } from 'react';

export function DungeonPage() {
  const { data: dungeons, isLoading: dungeonsLoading } = useGetAllDungeonMaps();
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
                                <CardTitle className="text-base">{quest.name}</CardTitle>
                                {completed && (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-sm">{quest.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Reward:</span>
                                <span className="font-semibold text-primary">{Number(quest.rewardCurrency)} Gold</span>
                              </div>
                              {!completed && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleStartQuest(quest.id)}
                                    disabled={startQuest.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Start Quest
                                  </Button>
                                  <Button
                                    onClick={() => handleCompleteQuest(quest.id)}
                                    disabled={completeQuest.isPending}
                                    size="sm"
                                    className="flex-1"
                                  >
                                    {completeQuest.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      'Complete'
                                    )}
                                  </Button>
                                </div>
                              )}
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
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Treasure Crates</h3>
                  </div>

                  {dungeon.availableCrates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No crates available in this dungeon.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dungeon.availableCrates.map((crate) => {
                        const opened = isCrateOpened(crate.id);
                        const hasRequiredKey = hasKey(crate.requiredKey);
                        return (
                          <Card key={Number(crate.id)} className={opened ? 'border-primary/50' : 'border-primary/20'}>
                            <CardHeader>
                              <div className="flex items-center justify-center py-4">
                                <img
                                  src={
                                    opened
                                      ? '/assets/generated/crate-open.dim_512x512.png'
                                      : '/assets/generated/crate-locked.dim_512x512.png'
                                  }
                                  alt={opened ? 'Open crate' : 'Locked crate'}
                                  className="w-24 h-24 object-contain"
                                />
                              </div>
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-base">{crate.name}</CardTitle>
                                {opened && (
                                  <Badge variant="default" className="bg-green-600">
                                    <Unlock className="w-3 h-3 mr-1" />
                                    Opened
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-sm">{crate.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{crate.location}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Key className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Required Key:</span>
                                </div>
                                <Badge variant={hasRequiredKey ? 'default' : 'outline'}>
                                  {crate.requiredKey}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Reward:</span>
                                <span className="font-semibold text-primary">{Number(crate.reward)} Gold</span>
                              </div>
                              {!opened && (
                                <Button
                                  onClick={() => handleUnlockCrate(crate.id, crate.reward)}
                                  disabled={unlockCrate.isPending || !hasRequiredKey}
                                  className="w-full"
                                  variant={hasRequiredKey ? 'default' : 'outline'}
                                >
                                  {unlockCrate.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Unlock className="w-4 h-4 mr-2" />
                                  )}
                                  {hasRequiredKey ? 'Unlock Crate' : 'Key Required'}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Keys Info */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="/assets/generated/dungeon-key.dim_256x256.png" alt="Keys" className="w-8 h-8" />
                    <h4 className="font-semibold">Your Keys</h4>
                  </div>
                  {collectedKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">You don't have any keys yet. Complete quests to earn keys!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {collectedKeys.map((key, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          <Key className="w-3 h-3 mr-1" />
                          {key}
                        </Badge>
                      ))}
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
