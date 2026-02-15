import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, UserMinus, Users, Heart, Info } from 'lucide-react';
import {
  useFollowUser,
  useUnfollowUser,
  useGetFollowing,
  useGetFollowers,
  useGetFriends,
} from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';

export function SocialPage() {
  const [principalInput, setPrincipalInput] = useState('');
  const [error, setError] = useState('');

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { data: following, isLoading: followingLoading } = useGetFollowing();
  const { data: followers, isLoading: followersLoading } = useGetFollowers();
  const { data: friends, isLoading: friendsLoading } = useGetFriends();

  const validatePrincipal = (input: string): Principal | null => {
    try {
      return Principal.fromText(input);
    } catch {
      return null;
    }
  };

  const handleFollow = async () => {
    setError('');
    const principal = validatePrincipal(principalInput);
    if (!principal) {
      setError('Invalid Principal ID format');
      return;
    }
    await followMutation.mutateAsync(principal.toString());
    setPrincipalInput('');
  };

  const handleUnfollow = async (principalText: string) => {
    const principal = validatePrincipal(principalText);
    if (!principal) return;
    await unfollowMutation.mutateAsync(principal.toString());
  };

  const handleUnfollowFromFollowing = async (principalText: string) => {
    const principal = validatePrincipal(principalText);
    if (!principal) return;
    await unfollowMutation.mutateAsync(principal.toString());
  };

  const formatPrincipal = (principal: Principal) => {
    const text = principal.toString();
    if (text.length <= 16) return text;
    return `${text.slice(0, 8)}...${text.slice(-8)}`;
  };

  const isFollowing = (principal: Principal) => {
    return following?.some((p) => p.toString() === principal.toString()) || false;
  };

  const isFriend = (principal: Principal) => {
    return friends?.some((p) => p.toString() === principal.toString()) || false;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Social</h1>
          <p className="text-muted-foreground">Connect with other players</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Follow a Player
          </CardTitle>
          <CardDescription>Enter a player's Principal ID to follow them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID</Label>
            <Input
              id="principal"
              placeholder="e.g., aaaaa-aa..."
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                setError('');
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            onClick={handleFollow}
            disabled={!principalInput.trim() || followMutation.isPending}
            className="w-full"
          >
            {followMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Following...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Follow Player
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Followers</CardTitle>
              <CardDescription>
                {followers?.length || 0} player{followers?.length !== 1 ? 's' : ''} following you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !followers || followers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No followers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <div key={follower.toString()}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-mono text-sm">{formatPrincipal(follower)}</p>
                            {isFriend(follower) && (
                              <Badge variant="secondary" className="mt-1">
                                <Heart className="w-3 h-3 mr-1" />
                                Friend
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!isFollowing(follower) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollow()}
                            disabled={followMutation.isPending}
                          >
                            Follow Back
                          </Button>
                        )}
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Following</CardTitle>
              <CardDescription>
                You're following {following?.length || 0} player{following?.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !following || following.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Not following anyone yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {following.map((followee) => (
                    <div key={followee.toString()}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-mono text-sm">{formatPrincipal(followee)}</p>
                            {isFriend(followee) && (
                              <Badge variant="secondary" className="mt-1">
                                <Heart className="w-3 h-3 mr-1" />
                                Friend
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnfollowFromFollowing(followee.toString())}
                          disabled={unfollowMutation.isPending}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </Button>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Friends are players who follow each other. Follow someone back to become friends!
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Your Friends
              </CardTitle>
              <CardDescription>
                {friends?.length || 0} mutual friend{friends?.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {friendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !friends || friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No friends yet</p>
                  <p className="text-sm mt-2">Follow players and have them follow you back to become friends!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.toString()}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-mono text-sm">{formatPrincipal(friend)}</p>
                            <Badge variant="secondary" className="mt-1">
                              <Heart className="w-3 h-3 mr-1" />
                              Friend
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnfollow(friend.toString())}
                          disabled={unfollowMutation.isPending}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </Button>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
