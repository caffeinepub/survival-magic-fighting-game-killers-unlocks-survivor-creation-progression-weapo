import { useGetCallerUserProfile, useStartCombat, usePerformAttack, usePerformMagicAttack, useGetAllBots, useStartBotCombat, useAttackBot, useGetBotCombatStatus } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sword, Sparkles, Trophy, Skull, Info, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Bot as BotType } from '../backend';

const ENEMIES = [
  { name: 'Goblin Scout', health: 50n, attack: 10n, defense: 5n, speed: 8n, magic: 2n, goldReward: 100n, expReward: 50n },
  { name: 'Dark Mage', health: 80n, attack: 15n, defense: 8n, speed: 6n, magic: 20n, goldReward: 200n, expReward: 100n },
  { name: 'Shadow Assassin', health: 100n, attack: 25n, defense: 10n, speed: 15n, magic: 5n, goldReward: 300n, expReward: 150n },
  { name: 'Corrupted Knight', health: 150n, attack: 30n, defense: 20n, speed: 5n, magic: 10n, goldReward: 500n, expReward: 250n },
];

const BOSSES = [
  { name: 'Jason', health: 200n, attack: 35n, defense: 25n, speed: 10n, magic: 15n, goldReward: 5_000n, expReward: 1_000n },
  { name: 'Coolkidd', health: 250n, attack: 40n, defense: 30n, speed: 12n, magic: 20n, goldReward: 10_000n, expReward: 2_000n },
  { name: '1x1x1x1', health: 300n, attack: 45n, defense: 35n, speed: 15n, magic: 25n, goldReward: 25_000n, expReward: 5_000n },
  { name: 'Noli', health: 350n, attack: 50n, defense: 40n, speed: 18n, magic: 30n, goldReward: 50_000n, expReward: 10_000n },
  { name: 'Spydersammy', health: 400n, attack: 55n, defense: 45n, speed: 20n, magic: 35n, goldReward: 75_000n, expReward: 15_000n },
  { name: 'Doodle', health: 450n, attack: 60n, defense: 50n, speed: 22n, magic: 40n, goldReward: 100_000n, expReward: 20_000n },
  { name: 'Arkey', health: 500n, attack: 65n, defense: 55n, speed: 25n, magic: 45n, goldReward: 150_000n, expReward: 30_000n },
  { name: 'Caylus', health: 550n, attack: 70n, defense: 60n, speed: 28n, magic: 50n, goldReward: 200_000n, expReward: 40_000n },
  { name: 'Steak', health: 600n, attack: 75n, defense: 65n, speed: 30n, magic: 55n, goldReward: 250_000n, expReward: 50_000n },
  { name: 'Cruz', health: 650n, attack: 80n, defense: 70n, speed: 32n, magic: 60n, goldReward: 300_000n, expReward: 60_000n },
  { name: 'King Arkey', health: 700n, attack: 85n, defense: 75n, speed: 35n, magic: 65n, goldReward: 400_000n, expReward: 80_000n },
  { name: '67 Kid', health: 750n, attack: 90n, defense: 80n, speed: 38n, magic: 70n, goldReward: 450_000n, expReward: 90_000n },
  { name: 'Zeus', health: 1000n, attack: 100n, defense: 100n, speed: 50n, magic: 100n, goldReward: 500_000n, expReward: 100_000n },
];

export function GameplayPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: bots, isLoading: botsLoading } = useGetAllBots();
  const { data: botCombatStatus } = useGetBotCombatStatus();
  const startCombat = useStartCombat();
  const performAttack = usePerformAttack();
  const performMagicAttack = usePerformMagicAttack();
  const startBotCombat = useStartBotCombat();
  const attackBot = useAttackBot();

  const [currentEnemy, setCurrentEnemy] = useState<any>(null);
  const [combatDetails, setCombatDetails] = useState<any>(null);
  const [isFighting, setIsFighting] = useState(false);

  const [currentBot, setCurrentBot] = useState<BotType | null>(null);
  const [isBotFighting, setIsBotFighting] = useState(false);

  const hasActiveSurvivor = !!profile?.activeSurvivor;

  useEffect(() => {
    if (botCombatStatus?.combatOngoing) {
      setIsBotFighting(true);
    } else if (botCombatStatus && !botCombatStatus.combatOngoing) {
      setIsBotFighting(false);
      setCurrentBot(null);
    }
  }, [botCombatStatus]);

  const handleStartCombat = async (enemy: any) => {
    try {
      setCurrentEnemy(enemy);
      const result = await startCombat.mutateAsync(enemy);
      setCombatDetails(result);
      setIsFighting(true);
    } catch (error) {
      setCurrentEnemy(null);
      setIsFighting(false);
    }
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    try {
      const result = await performAttack.mutateAsync(currentEnemy);
      setCombatDetails(result);
      if (result.result) {
        setIsFighting(false);
        setCurrentEnemy(null);
      }
    } catch (error) {
      setIsFighting(false);
      setCurrentEnemy(null);
    }
  };

  const handleMagicAttack = async () => {
    if (!currentEnemy) return;
    try {
      const result = await performMagicAttack.mutateAsync(currentEnemy);
      setCombatDetails(result);
      if (result.result) {
        setIsFighting(false);
        setCurrentEnemy(null);
      }
    } catch (error) {
      setIsFighting(false);
      setCurrentEnemy(null);
    }
  };

  const handleStartBotCombat = async (bot: BotType) => {
    try {
      setCurrentBot(bot);
      await startBotCombat.mutateAsync(bot.id);
      setIsBotFighting(true);
    } catch (error) {
      setCurrentBot(null);
      setIsBotFighting(false);
    }
  };

  const handleBotAttack = async () => {
    if (!currentBot) return;
    try {
      await attackBot.mutateAsync();
    } catch (error) {
      setIsBotFighting(false);
      setCurrentBot(null);
    }
  };

  const formatNumber = (num: bigint) => Number(num).toLocaleString();

  const playerHealthPercent = combatDetails
    ? (Number(combatDetails.playerHealth) / Number(combatDetails.playerStats.stats.health)) * 100
    : 100;
  const enemyHealthPercent = combatDetails
    ? (Number(combatDetails.enemyHealth) / Number(combatDetails.enemyStats.health)) * 100
    : 100;

  const botPlayerHealthPercent = botCombatStatus
    ? (Number(botCombatStatus.playerHealth) / Number(botCombatStatus.playerActiveSurvivor.stats.health)) * 100
    : 100;
  const botEnemyHealthPercent =
    botCombatStatus && currentBot ? (Number(botCombatStatus.botHealth) / (Number(currentBot.difficulty) * 100)) * 100 : 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Sword className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Combat Arena</h1>
          <p className="text-muted-foreground">Test your skills against enemies and bosses</p>
        </div>
      </div>

      {!hasActiveSurvivor && (
        <Alert className="border-primary/50 bg-primary/10">
          <Info className="h-4 w-4" />
          <AlertDescription>You need to select an active survivor before you can enter combat.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="enemies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enemies">Regular Enemies</TabsTrigger>
          <TabsTrigger value="bosses">Boss Fights</TabsTrigger>
          <TabsTrigger value="bots">AI Bots</TabsTrigger>
        </TabsList>

        <TabsContent value="enemies" className="space-y-6">
          {isFighting && combatDetails ? (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="w-5 h-5" />
                  Battle in Progress
                </CardTitle>
                <CardDescription>Fighting {currentEnemy?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Your Health</span>
                      <span>
                        {formatNumber(combatDetails.playerHealth)} / {formatNumber(combatDetails.playerStats.stats.health)}
                      </span>
                    </div>
                    <Progress value={playerHealthPercent} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{currentEnemy?.name}</span>
                      <span>
                        {formatNumber(combatDetails.enemyHealth)} / {formatNumber(combatDetails.enemyStats.health)}
                      </span>
                    </div>
                    <Progress value={enemyHealthPercent} className="h-3" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleAttack} disabled={performAttack.isPending} className="flex-1">
                    {performAttack.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Attacking...
                      </>
                    ) : (
                      <>
                        <Sword className="mr-2 h-4 w-4" />
                        Physical Attack
                      </>
                    )}
                  </Button>
                  <Button onClick={handleMagicAttack} disabled={performMagicAttack.isPending} variant="secondary" className="flex-1">
                    {performMagicAttack.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Casting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Magic Attack
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {ENEMIES.map((enemy) => (
                <Card key={enemy.name} className="border-border hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{enemy.name}</span>
                      <Badge variant="outline">Level {Number(enemy.attack)}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Rewards: {formatNumber(enemy.goldReward)} gold, {formatNumber(enemy.expReward)} EXP
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>HP: {formatNumber(enemy.health)}</div>
                      <div>ATK: {formatNumber(enemy.attack)}</div>
                      <div>DEF: {formatNumber(enemy.defense)}</div>
                      <div>SPD: {formatNumber(enemy.speed)}</div>
                    </div>
                    <Button
                      onClick={() => handleStartCombat(enemy)}
                      disabled={!hasActiveSurvivor || startCombat.isPending}
                      className="w-full"
                    >
                      {startCombat.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        'Start Combat'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bosses" className="space-y-6">
          {isFighting && combatDetails ? (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skull className="w-5 h-5" />
                  Boss Battle in Progress
                </CardTitle>
                <CardDescription>Fighting {currentEnemy?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Your Health</span>
                      <span>
                        {formatNumber(combatDetails.playerHealth)} / {formatNumber(combatDetails.playerStats.stats.health)}
                      </span>
                    </div>
                    <Progress value={playerHealthPercent} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{currentEnemy?.name}</span>
                      <span>
                        {formatNumber(combatDetails.enemyHealth)} / {formatNumber(combatDetails.enemyStats.health)}
                      </span>
                    </div>
                    <Progress value={enemyHealthPercent} className="h-3" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleAttack} disabled={performAttack.isPending} className="flex-1">
                    {performAttack.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Attacking...
                      </>
                    ) : (
                      <>
                        <Sword className="mr-2 h-4 w-4" />
                        Physical Attack
                      </>
                    )}
                  </Button>
                  <Button onClick={handleMagicAttack} disabled={performMagicAttack.isPending} variant="secondary" className="flex-1">
                    {performMagicAttack.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Casting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Magic Attack
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BOSSES.map((boss) => (
                <Card key={boss.name} className="border-primary/30 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        {boss.name}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Rewards: {formatNumber(boss.goldReward)} gold, {formatNumber(boss.expReward)} EXP
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>HP: {formatNumber(boss.health)}</div>
                      <div>ATK: {formatNumber(boss.attack)}</div>
                      <div>DEF: {formatNumber(boss.defense)}</div>
                      <div>SPD: {formatNumber(boss.speed)}</div>
                    </div>
                    <Button
                      onClick={() => handleStartCombat(boss)}
                      disabled={!hasActiveSurvivor || startCombat.isPending}
                      className="w-full"
                      variant="default"
                    >
                      {startCombat.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        'Challenge Boss'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bots" className="space-y-6">
          {botsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isBotFighting && botCombatStatus ? (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Bot Battle in Progress
                </CardTitle>
                <CardDescription>Fighting {botCombatStatus.botName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Your Health</span>
                      <span>
                        {formatNumber(botCombatStatus.playerHealth)} /{' '}
                        {formatNumber(botCombatStatus.playerActiveSurvivor.stats.health)}
                      </span>
                    </div>
                    <Progress value={botPlayerHealthPercent} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{botCombatStatus.botName}</span>
                      <span>
                        {formatNumber(botCombatStatus.botHealth)} / {currentBot ? Number(currentBot.difficulty) * 100 : 0}
                      </span>
                    </div>
                    <Progress value={botEnemyHealthPercent} className="h-3" />
                  </div>
                </div>

                <Button onClick={handleBotAttack} disabled={attackBot.isPending || !botCombatStatus.combatOngoing} className="w-full">
                  {attackBot.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Attacking...
                    </>
                  ) : (
                    <>
                      <Sword className="mr-2 h-4 w-4" />
                      Attack Bot
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots && bots.length > 0 ? (
                bots.map((bot) => (
                  <Card key={bot.id} className="border-primary/30 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-primary" />
                          {bot.name}
                        </span>
                        <Badge variant="outline">Difficulty {Number(bot.difficulty)}</Badge>
                      </CardTitle>
                      <CardDescription>{bot.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bot.url && (
                          <div className="w-full h-32 bg-muted rounded-md overflow-hidden">
                            <img src={bot.url} alt={bot.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Rewards: {formatNumber(bot.rewardCurrency)} gold, {formatNumber(bot.rewardExp)} EXP
                          </p>
                        </div>
                        <Button
                          onClick={() => handleStartBotCombat(bot)}
                          disabled={!hasActiveSurvivor || startBotCombat.isPending}
                          className="w-full"
                        >
                          {startBotCombat.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            'Challenge Bot'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No AI bots available</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
