import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Camera, Mail, Pencil, ShieldCheck, Trash2, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/api/user.api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  // save profile
  const handleSave = async () => {
    setSaving(true);

    try {
      await userApi.updateMe({ fullName });
      await refreshProfile();
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  // upload picture
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      await userApi.uploadProfilePicture(file);
      await refreshProfile();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not upload picture");
    } finally {
      setUploading(false);
    }
  };

  // remove picture
  const handleRemovePicture = async () => {
    try {
      await userApi.deleteProfilePicture();
      await refreshProfile();
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove picture");
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20 px-5 py-5 sm:px-6">
            <CardTitle className="text-xl font-bold">My Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-7 px-5 py-6 sm:px-6">
            {/* profile */}
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md ring-1 ring-border sm:h-28 sm:w-28">
                  <AvatarImage src={user?.profilePicture?.url} />
                  <AvatarFallback className="bg-muted text-2xl font-semibold">
                    {user?.fullName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera size={15} />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="truncate text-lg font-bold">{user?.fullName}</p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {user?.email}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="secondary" className="capitalize">
                    {user?.role}
                  </Badge>

                  {user?.isEmailVerified ? (
                    <Badge variant="success">
                      <ShieldCheck size={11} className="mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                </div>

                {user?.profilePicture?.url && (
                  <button
                    onClick={handleRemovePicture}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 transition hover:text-red-600 hover:underline"
                  >
                    <Trash2 size={12} />
                    Remove picture
                  </button>
                )}
              </div>
            </div>

            {/* account details */}
            <div className="space-y-5 border-t border-border pt-6">
              <div className="space-y-2">
                <Label>Full Name</Label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      className="h-10 pl-10"
                      disabled={!editing}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  {editing ? (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="h-10 sm:min-w-20"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  ) : (
                   <Button
  type="button"
  variant="outline"
  onClick={() => setEditing(true)}
  className="h-10 w-full shrink-0 text-foreground sm:w-10"
>
  <Pencil
    className="h-4 w-4 shrink-0 text-foreground"
    strokeWidth={2.5}
  />
  <span className="sm:hidden">Edit</span>
</Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    className="h-10 pl-10"
                    disabled
                    value={user?.email || ""}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
