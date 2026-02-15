import { useGetCallerUserProfile, usePurchaseAdminPanel, useGetAllShopItems, usePurchaseShopItem } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Crown, Check, Lock } from 'lucide-react';

export function ShopPage() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: shopItems, isLoading: shopItemsLoading } = useGetAllShopItems();
  const purchaseAdminPanel = usePurchaseAdminPanel();
  const purchaseShopItem = usePurchaseShopItem();

  const adminPanelCost = 1_000_000_000n;
  const canAffordAdminPanel = (profile?.currency || 0n) >= adminPanelCost;
  const hasAdminPanel = profile?.hasAdminPanel || false;

  const formatCurrency = (amount: bigint) => {
    return Number(amount).toLocaleString();
  };

  const handlePurchaseAdminPanel = async () => {
    await purchaseAdminPanel.mutateAsync();
  };

  const handlePurchaseShopItem = async (itemId: bigint) => {
    await purchaseShopItem.mutateAsync(itemId);
  };

  const canAffordItem = (price: bigint) => {
    return (profile?.currency || 0n) >= price;
  };

  if (profileLoading || shopItemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">Purchase items and upgrades with your currency</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-6 h-6 text-primary" />
              Admin Panel
            </CardTitle>
            <CardDescription>Unlock powerful administrative features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Grant currency to your account</li>
                <li>Unlock any killer instantly</li>
                <li>Set survivor levels</li>
                <li>Add custom weapons and pets</li>
                <li>Create and manage events</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(adminPanelCost)}</p>
                <p className="text-sm text-muted-foreground">Currency</p>
              </div>
              <Button
                onClick={handlePurchaseAdminPanel}
                disabled={!canAffordAdminPanel || hasAdminPanel || purchaseAdminPanel.isPending}
                size="lg"
              >
                {purchaseAdminPanel.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Purchasing...
                  </>
                ) : hasAdminPanel ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Owned
                  </>
                ) : !canAffordAdminPanel ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Insufficient Funds
                  </>
                ) : (
                  'Purchase'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {shopItems && shopItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Shop Items</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopItems.map((item) => {
                const affordable = canAffordItem(item.price);
                return (
                  <Card key={item.id} className="border-border hover:border-primary/40 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <Badge variant="outline">{item.itemType}</Badge>
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.bonusStat && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Bonus:{' '}
                            {Object.entries(item.bonusStat).map(([key, value]) => {
                              if (key !== '__kind__') return null;
                              return `+${value} ${key}`;
                            })}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-xl font-bold text-primary">{formatCurrency(item.price)}</p>
                          <p className="text-xs text-muted-foreground">Currency</p>
                        </div>
                        <Button
                          onClick={() => handlePurchaseShopItem(item.id)}
                          disabled={!affordable || purchaseShopItem.isPending}
                          size="sm"
                        >
                          {purchaseShopItem.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Buying...
                            </>
                          ) : !affordable ? (
                            <>
                              <Lock className="mr-2 h-3 w-3" />
                              Can't Afford
                            </>
                          ) : (
                            'Purchase'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
