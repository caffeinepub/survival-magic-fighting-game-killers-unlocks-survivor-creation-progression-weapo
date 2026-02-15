import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Survivor } from '../backend';
import { Heart, Sword, Shield, Zap, Sparkles, TrendingUp } from 'lucide-react';

interface ProgressionPanelProps {
  survivor: Survivor;
}

export function ProgressionPanel({ survivor }: ProgressionPanelProps) {
  const level = Number(survivor.level);
  const exp = Number(survivor.experience);
  const expForNextLevel = level * 100;
  const expProgress = (exp / expForNextLevel) * 100;

  const stats = [
    { label: 'Health', value: Number(survivor.stats.health), icon: Heart, color: 'text-red-500' },
    { label: 'Attack', value: Number(survivor.stats.attack), icon: Sword, color: 'text-orange-500' },
    { label: 'Defense', value: Number(survivor.stats.defense), icon: Shield, color: 'text-blue-500' },
    { label: 'Speed', value: Number(survivor.stats.speed), icon: Zap, color: 'text-yellow-500' },
    { label: 'Magic', value: Number(survivor.stats.magic), icon: Sparkles, color: 'text-purple-500' },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{survivor.name}</CardTitle>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-semibold">
              {exp} / {expForNextLevel}
            </span>
          </div>
          <Progress value={expProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
