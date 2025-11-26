"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getUserPreferencesAction,
  updateUserPreferencesAction,
} from "@/actions/preferences";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ProfilePreferences() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailyReminder: true,
    reminderTime: "09:00",
    soundEffects: true,
    autoPlayAudio: false,
    showTranslations: true,
    interfaceLanguage: "en",
    translationLanguage: "vi",
  });

  useEffect(() => {
    async function fetchPreferences() {
      const result = await getUserPreferencesAction();
      if (result.success && result.data && result.data.preferences) {
        setPreferences({
          emailNotifications:
            result.data.preferences.emailNotifications ?? true,
          pushNotifications: result.data.preferences.pushNotifications ?? false,
          dailyReminder: result.data.preferences.dailyReminder ?? true,
          reminderTime: result.data.preferences.reminderTime ?? "09:00",
          soundEffects: result.data.preferences.soundEffects ?? true,
          autoPlayAudio: result.data.preferences.autoPlayAudio ?? false,
          showTranslations: result.data.preferences.showTranslations ?? true,
          interfaceLanguage: result.data.preferences.interfaceLanguage ?? "en",
          translationLanguage:
            result.data.preferences.translationLanguage ?? "vi",
        });
      }
      setIsLoading(false);
    }
    fetchPreferences();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateUserPreferencesAction(preferences);
    setIsSaving(false);

    if (result.success) {
      toast.success("Preferences saved successfully");
    } else {
      toast.error(result.error || "Failed to save preferences");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive updates and reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive progress updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about due reviews and streaks
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-reminder">Daily Study Reminder</Label>
              <p className="text-sm text-muted-foreground">
                Remind me to study every day
              </p>
            </div>
            <Switch
              id="daily-reminder"
              checked={preferences.dailyReminder}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, dailyReminder: checked })
              }
            />
          </div>

          {preferences.dailyReminder && (
            <div className="flex items-center justify-between pl-6">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <Select
                value={preferences.reminderTime}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, reminderTime: value })
                }
              >
                <SelectTrigger id="reminder-time" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="21:00">9:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>Customize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-effects">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for correct/incorrect answers
              </p>
            </div>
            <Switch
              id="sound-effects"
              checked={preferences.soundEffects}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, soundEffects: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-play-audio">Auto-play Audio</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play pronunciation audio
              </p>
            </div>
            <Switch
              id="auto-play-audio"
              checked={preferences.autoPlayAudio}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, autoPlayAudio: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-translations">Show Translations</Label>
              <p className="text-sm text-muted-foreground">
                Display translations by default
              </p>
            </div>
            <Switch
              id="show-translations"
              checked={preferences.showTranslations}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, showTranslations: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Language Settings</CardTitle>
          <CardDescription>
            Choose your interface and translation languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="interface-language">Interface Language</Label>
            <Select
              value={preferences.interfaceLanguage}
              onValueChange={(value) =>
                setPreferences({ ...preferences, interfaceLanguage: value })
              }
            >
              <SelectTrigger id="interface-language" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="translation-language">Translation Language</Label>
            <Select
              value={preferences.translationLanguage}
              onValueChange={(value) =>
                setPreferences({ ...preferences, translationLanguage: value })
              }
            >
              <SelectTrigger id="translation-language" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
