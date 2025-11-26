"use client";

import { useState } from "react";
import { AchievementShowcase } from "@/components/profile/achievement-showcase";
import { ProfileInfo } from "@/components/profile/profile-info";
import ProfilePreferences from "@/components/profile/profile-preferences";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and achievements
        </p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 mt-6">
          <ProfileInfo />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-6">
          <ProfilePreferences />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <AchievementShowcase />
        </TabsContent>
      </Tabs>
    </div>
  );
}
