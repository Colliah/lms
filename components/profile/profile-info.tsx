"use client";

import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfileAction } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

export function ProfileInfo() {
  const { data: session } = authClient.useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || "");

  async function handleSave() {
    setIsSaving(true);
    const result = await updateUserProfileAction({
      displayName,
      bio,
      avatarUrl,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  }

  function handleCancelClick() {
    // Check if there are unsaved changes
    const hasChanges =
      displayName !== (session?.user?.name || "") ||
      bio !== "" ||
      avatarUrl !== (session?.user?.image || "");

    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      handleCancelConfirmed();
    }
  }

  function handleCancelConfirmed() {
    setIsEditing(false);
    setDisplayName(session?.user?.name || "");
    setBio("");
    setAvatarUrl(session?.user?.image || "");
    setShowCancelDialog(false);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {getInitials(displayName || session?.user?.email || "U")}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                onClick={() => {
                  // Placeholder for avatar upload
                  toast.info("Avatar upload coming soon!");
                }}
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Profile Picture
            </p>
            {isEditing ? (
              <Input
                placeholder="Avatar URL (temporary)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="max-w-md"
              />
            ) : (
              <p className="text-sm">{session?.user?.name || "No name set"}</p>
            )}
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          {isEditing ? (
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          ) : (
            <p className="text-sm py-2 px-3 rounded-md bg-muted">
              {displayName || "Not set"}
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <p className="text-sm py-2 px-3 rounded-md bg-muted">
            {session?.user?.email || "Not available"}
          </p>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed here
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          {isEditing ? (
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
              maxLength={500}
            />
          ) : (
            <p className="text-sm py-2 px-3 rounded-md bg-muted min-h-[100px]">
              {bio || "No bio yet"}
            </p>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 characters
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelConfirmed}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard"
        cancelText="Keep editing"
        variant="destructive"
      />
    </Card>
  );
}
