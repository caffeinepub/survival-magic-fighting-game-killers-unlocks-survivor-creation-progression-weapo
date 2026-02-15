import { useGetAllAnnouncements, useCreateAnnouncement, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Bell, Calendar, User } from 'lucide-react';
import { useState } from 'react';

export function AnnouncementsPage() {
  const { data: announcements, isLoading } = useGetAllAnnouncements();
  const { data: profile } = useGetCallerUserProfile();
  const createAnnouncement = useCreateAnnouncement();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin = profile?.hasAdminPanel || false;

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    await createAnnouncement.mutateAsync({ title, message });
    setTitle('');
    setMessage('');
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with the latest news and updates</p>
        </div>
      </div>

      {isAdmin && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Admin: Create Announcement
            </CardTitle>
            <CardDescription>Post a new announcement for all players</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter announcement message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={handleCreateAnnouncement}
              disabled={!title.trim() || !message.trim() || createAnnouncement.isPending}
              className="w-full"
            >
              {createAnnouncement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Announcement'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            {announcements?.length || 0} announcement{announcements?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {!announcements || announcements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements
                  .sort((a, b) => Number(b.timestamp - a.timestamp))
                  .map((announcement, index) => (
                    <div key={announcement.id}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-primary">{announcement.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                            <Calendar className="w-4 h-4" />
                            {formatDate(announcement.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{announcement.message}</p>
                      </div>
                      {index < announcements.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
