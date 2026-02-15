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
  useGetFollowers,
  useGetFollowing,
  useGetFriends,
} from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';

export function SocialPage() {
  const [principalInput, setPrincipalInput] = useState('');
  const [inputError, setInputError] = useState('');

  const { data: followers = [], isLoading: followersLoading } = useGetFollowers();
  const { data: following = [], isLoading: followingLoading } = useGetFollowing();
  const { data: friends = [], isLoading: friendsLoading } = useGetFriends();

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const validatePrincipal = (input: string): Principal | null => {
    try {
      const principal = Principal.fromText(input.trim());
      setInputError('');
      return principal;
    } catch (error) {
      setInputError('Invalid Principal ID format');
      return null;
    }
  };

  const handleFollow = async () => {
    const principal = validatePrincipal(principalInput);
    if (!principal) return;

    await followMutation.mutateAsync(principal);
    setPrincipalInput('');
  };

  const handleUnfollow = async () => {
    const principal = validatePrincipal(principalInput);
    if (!principal) return;

    await unfollowMutation.mutateAsync(principal);
    setPrincipalInput('');
  };

  const handleUnfollowDirect = async (principal: Principal) => {
    await unfollowMutation.mutateAsync(principal);
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Social
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect with other players and build your network
        </p>
      </div>

      <Separator className="my-8" />

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Manage Connections</CardTitle>
          <CardDescription>Follow or unfollow players by entering their Principal ID</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-muted bg-muted/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Principal IDs are unique identifiers for users on the Internet Computer. Ask other players for their
              Principal ID to connect with them.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID</Label>
            <Input
              id="principal"
              placeholder="Enter Principal ID (e.g., aaaaa-aa)"
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                setInputError('');
              }}
              className={inputError ? 'border-destructive' : ''}
            />
            {inputError && <p className="text-sm text-destructive">{inputError}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleFollow}
              disabled={!principalInput.trim() || isLoading}
              className="flex-1"
            >
              {followMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Following...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button
              onClick={handleUnfollow}
              disabled={!principalInput.trim() || isLoading}
              variant="outline"
              className="flex-1"
            >
              {unfollowMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unfollowing...
                </>
              ) : (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unfollow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">
            <Heart className="w-4 h-4 mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="followers">
            <Users className="w-4 h-4 mr-2" />
            Followers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Friends
                <Badge variant="outline">{friends.length}</Badge>
              </CardTitle>
              <CardDescription>
                Players who follow you and you follow back (mutual follows)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {friendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No friends yet</p>
                  <p className="text-xs mt-1">Follow other players to build your network</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{friend.toString()}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnfollowDirect(friend)}
                        disabled={unfollowMutation.isPending}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followers" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Followers
                  <Badge variant="outline">{followers.length}</Badge>
                </CardTitle>
                <CardDescription>Players who follow you</CardDescription>
              </CardHeader>
              <CardContent>
                {followersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No followers yet</p>
                    <p className="text-xs mt-1">Share your Principal ID with others</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {followers.map((follower) => (
                      <div
                        key={follower.toString()}
                        className="p-3 rounded-lg border border-border bg-card/50"
                      >
                        <p className="text-sm font-mono truncate">{follower.toString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Following
                  <Badge variant="outline">{following.length}</Badge>
                </CardTitle>
                <CardDescription>Players you follow</CardDescription>
              </CardHeader>
              <CardContent>
                {followingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Not following anyone yet</p>
                    <p className="text-xs mt-1">Start following players above</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {following.map((followee) => (
                      <div
                        key={followee.toString()}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate">{followee.toString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnfollowDirect(followee)}
                          disabled={unfollowMutation.isPending}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
