"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { Subscription, LicensingTier } from "@/lib/types/product";

interface SubscriptionManagerProps {
  productId: string;
  onSubscriptionChange?: (subscription: Subscription | null) => void;
}

export function SubscriptionManager({ productId, onSubscriptionChange }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [licensingTiers, setLicensingTiers] = useState<LicensingTier[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch subscriptions and licensing tiers on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions
      const subsResponse = await apiClient.get(`/api/subscriptions/user`);
      if (subsResponse?.data?.ok) {
        setSubscriptions(subsResponse.data.subscriptions || []);
      }
      
      // Fetch licensing tiers
      const tiersResponse = await apiClient.get(`/api/subscriptions/licensing/${productId}`);
      if (tiersResponse?.data?.ok) {
        setLicensingTiers(tiersResponse.data.licensingTiers || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (planType: "monthly" | "yearly" | "lifetime") => {
    try {
      setLoading(true);
      
      const response = await apiClient.post("/api/subscriptions", {
        productId,
        planType,
        autoRenew: false,
      });

      if (response?.data?.ok) {
        setSubscriptions(prev => [...prev, response.data.subscription]);
        onSubscriptionChange?.(response.data.subscription);
      }

      toast.success("Subscription created successfully!");
    } catch (error) {
      console.error("Failed to create subscription:", error);
      toast.error("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLicensingTier = async (tierData: {
    name: string;
    price: string;
    licenseType: "personal" | "commercial" | "enterprise" | "custom";
    features: string[];
    limitations?: string[];
    duration?: string;
    supportLevel: "basic" | "standard" | "premium" | "enterprise";
  }) => {
    try {
      setLoading(true);
      
      const response = await apiClient.post(`/api/subscriptions/licensing`, {
        productId,
        ...tierData,
      });

      if (response?.data?.ok) {
        setLicensingTiers(prev => [...prev, response.data.licensingTier]);
      }

      toast.success("Licensing tier created successfully!");
    } catch (error) {
      console.error("Failed to create licensing tier:", error);
      toast.error("Failed to create licensing tier");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      
      const response = await apiClient.patch(`/api/subscriptions/${subscriptionId}/cancel`);
      
      if (response?.data?.ok) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub._id === subscriptionId ? { ...sub, status: "cancelled" } : sub
          )
        );
      }

      toast.success("Subscription cancelled successfully!");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLicensingTier = async (tierId: string, tierData: Partial<LicensingTier>) => {
    try {
      setLoading(true);
      
      const response = await apiClient.patch(`/api/subscriptions/licensing/${tierId}`, tierData);
      
      if (response?.data?.ok) {
        setLicensingTiers(prev => 
          prev.map(tier => 
            tier._id === tierId ? { ...tier, ...tierData } : tier
          )
        );
      }

      toast.success("Licensing tier updated successfully!");
    } catch (error) {
      console.error("Failed to update licensing tier:", error);
      toast.error("Failed to update licensing tier");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLicensingTier = async (tierId: string) => {
    try {
      setLoading(true);
      
      const response = await apiClient.delete(`/api/subscriptions/licensing/${tierId}`);
      
      if (response?.data?.ok) {
        setLicensingTiers(prev => prev.filter(tier => tier._id !== tierId));
      }

      toast.success("Licensing tier deleted successfully!");
    } catch (error) {
      console.error("Failed to delete licensing tier:", error);
      toast.error("Failed to delete licensing tier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription & Licensing</CardTitle>
        <CardDescription>
          Manage product subscriptions and licensing tiers
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="licensing">Licensing Tiers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Subscriptions</h3>
              <div className="space-y-2">
                {subscriptions.length === 0 ? (
                  <p className="text-muted-foreground">No active subscriptions</p>
                ) : (
                  <div className="space-y-2">
                    {subscriptions.map((subscription) => (
                      <div key={subscription._id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{subscription.planType}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${subscription.status === "active" ? "Active" : subscription.status}
                            </p>
                            <p className="text-sm">
                              ${new Date(subscription.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                              ${subscription.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">₹{subscription.price}</p>
                          <p className="text-xs text-muted-foreground">{subscription.features.join(", ")}</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription._id)}
                            disabled={subscription.status !== "active"}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="licensing" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Licensing Tiers</h3>
              <div className="space-y-2">
                {licensingTiers.length === 0 ? (
                  <p className="text-muted-foreground">No licensing tiers configured</p>
                ) : (
                  <div className="space-y-2">
                    {licensingTiers.map((tier) => (
                      <div key={tier._id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{tier.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {tier.supportLevel}
                            </p>
                            <p className="text-xs text-muted-foreground">{tier.licenseType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">₹{tier.price}</p>
                            <p className="text-xs text-muted-foreground">{tier.features.join(", ")}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateLicensingTier(tier._id, { name: tier.name })}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLicensingTier(tier._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
