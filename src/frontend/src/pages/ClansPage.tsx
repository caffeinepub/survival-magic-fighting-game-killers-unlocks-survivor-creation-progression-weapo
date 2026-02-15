import { useState } from 'react';
import { useGetClanMarketplace, useGetActiveWhyDontYouJoins, useAddWhyDontYouJoin, useCreateClanFromListing, useJoinClan, useJoinRandomClan } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Users, Plus, UserPlus, Sparkles } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export function ClansPage() {
  const { identity } = useInternetIdentity();
  const { data: clans, isLoading: clansLoading } = useGetClanMarketplace();
  const { data: joinListings, isLoading: listingsLoading } = useGetActiveWhyDontYouJoins();
  const addListing = useAddWhyDontYouJoin();
  const createClan = useCreateClanFromListing();
  const joinClan = useJoinClan();
  const joinRandom = useJoinRandomClan();

  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listingName, setListingName] = useState('');
  const [listingDescription, setListingDescription] = useState('');
  const [listingImageUrl, setListingImageUrl] = useState('');

  const [showCreateClan, setShowCreateClan] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<bigint | null>(null);
  const [clanName, setClanName] = useState('');

  const isLoading = clansLoading || listingsLoading;

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addListing.mutateAsync({
        name: listingName,
        description: listingDescription,
        imageUrl: listingImageUrl || 'https://via.placeholder.com/150',
      });
      setListingName('');
      setListingDescription('');
      setListingImageUrl('');
      setShowCreateListing(false);
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  const handleCreateClan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingId) return;
    try {
      await createClan.mutateAsync({
        whyJoinId: selectedListingId,
        clanName,
      });
      setClanName('');
      setShowCreateClan(false);
      setSelectedListingId(null);
    } catch (error) {
      console.error('Failed to create clan:', error);
    }
  };

  const handleJoinClan = async (clanId: bigint) => {
    try {
      await joinClan.mutateAsync(clanId);
    } catch (error) {
      console.error('Failed to join clan:', error);
    }
  };

  const handleJoinRandom = async () => {
    try {
      await joinRandom.mutateAsync();
    } catch (error) {
      console.error('Failed to join random clan:', error);
    }
  };

  const openCreateClanDialog = (listingId: bigint) => {
    setSelectedListingId(listingId);
    setShowCreateClan(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Users className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Clans</h1>
            <p className="text-muted-foreground">Join forces with other players</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateListing(!showCreateListing)} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {showCreateListing && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Create Clan Listing</CardTitle>
            <CardDescription>Create a listing to find clan members or start a new clan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="listingName">Listing Name</Label>
                <Input
                  id="listingName"
                  value={listingName}
                  onChange={(e) => setListingName(e.target.value)}
                  placeholder="Enter listing name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listingDescription">Description</Label>
                <Textarea
                  id="listingDescription"
                  value={listingDescription}
                  onChange={(e) => setListingDescription(e.target.value)}
                  placeholder="Describe your clan or what you're looking for"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listingImageUrl">Image URL (optional)</Label>
                <Input
                  id="listingImageUrl"
                  value={listingImageUrl}
                  onChange={(e) => setListingImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addListing.isPending}>
                  {addListing.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Listing
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateListing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showCreateClan && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Create Clan</CardTitle>
            <CardDescription>Give your new clan a name</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clanName">Clan Name</Label>
                <Input
                  id="clanName"
                  value={clanName}
                  onChange={(e) => setClanName(e.target.value)}
                  placeholder="Enter clan name"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createClan.isPending}>
                  {createClan.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Clan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateClan(false);
                    setSelectedListingId(null);
                    setClanName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Clan Listings</h2>
            <Button onClick={handleJoinRandom} disabled={joinRandom.isPending || !joinListings?.length} size="sm">
              {joinRandom.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Join Random
            </Button>
          </div>
          {joinListings && joinListings.length > 0 ? (
            <div className="space-y-3">
              {joinListings.map((listing) => (
                <Card key={Number(listing.id)} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{listing.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{listing.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {Number(listing.memberCount)} members
                          </Badge>
                          {listing.leader.toString() === myPrincipal && (
                            <Badge variant="default" className="text-xs">
                              Your Listing
                            </Badge>
                          )}
                        </div>
                      </div>
                      {listing.leader.toString() !== myPrincipal && (
                        <Button
                          onClick={() => openCreateClanDialog(listing.id)}
                          disabled={createClan.isPending}
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Create Clan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-muted">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active clan listings yet. Create one to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Clans</h2>
          {clans && clans.length > 0 ? (
            <div className="space-y-3">
              {clans.map((clan) => (
                <Card key={Number(clan.id)} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{clan.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {Number(clan.memberCount)} members
                          </Badge>
                          {clan.founder.toString() === myPrincipal && (
                            <Badge variant="default" className="text-xs">
                              Founder
                            </Badge>
                          )}
                          {clan.members.some((m) => m.toString() === myPrincipal) && (
                            <Badge variant="secondary" className="text-xs">
                              Member
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!clan.members.some((m) => m.toString() === myPrincipal) && (
                        <Button
                          onClick={() => handleJoinClan(clan.id)}
                          disabled={joinClan.isPending}
                          size="sm"
                        >
                          {joinClan.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Join
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-muted">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No clans exist yet. Be the first to create one!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
