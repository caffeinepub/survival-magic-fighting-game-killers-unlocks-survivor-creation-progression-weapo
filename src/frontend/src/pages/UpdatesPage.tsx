import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Sparkles } from 'lucide-react';

interface UpdateEntry {
  id: number;
  title: string;
  date: string;
  version: string;
  description: string;
  features: string[];
}

const updates: UpdateEntry[] = [
  {
    id: 3,
    title: 'Social Features & Updates Hub',
    date: 'February 15, 2026',
    version: 'v1.3.0',
    description: 'Connect with other players and stay informed about the latest game changes.',
    features: [
      'New Social page with Friends and Followers system',
      'Follow and unfollow other players by Principal ID',
      'View your friends list (mutual follows)',
      'Track who follows you and who you follow',
      'Updates page to keep you informed of new features',
    ],
  },
  {
    id: 2,
    title: 'Dungeon Exploration',
    date: 'February 10, 2026',
    version: 'v1.2.0',
    description: 'Venture into mysterious dungeons filled with quests and treasure.',
    features: [
      'New Dungeons page with exploration mechanics',
      'Complete quests to earn currency rewards',
      'Unlock treasure crates with special keys',
      'Collect keys from completed quests',
      'Beautiful dungeon maps and visual feedback',
    ],
  },
  {
    id: 1,
    title: 'Clan System Launch',
    date: 'February 5, 2026',
    version: 'v1.1.0',
    description: 'Team up with other survivors and form powerful clans.',
    features: [
      'Create and join clans with other players',
      'Clan marketplace for recruiting members',
      'Browse active clan listings',
      'Join random clans for quick matchmaking',
      'Track clan membership and founders',
    ],
  },
];

export function UpdatesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          Game Updates
        </h1>
        <p className="text-lg text-muted-foreground">
          Stay up to date with the latest features and improvements
        </p>
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        {updates.map((update) => (
          <Card key={update.id} className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl">{update.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {update.version}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    {update.date}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{update.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-primary">
                  What's New
                </h4>
                <ul className="space-y-2">
                  {update.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-muted bg-muted/20">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            More updates coming soon! Check back regularly for new features and improvements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
