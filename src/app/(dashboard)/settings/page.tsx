"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Shield, Download, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and settings.</p>
      </div>

      <div className="grid gap-8">
        {/* Appearance Settings */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">Select your preferred visual theme.</p>
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === "light" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === "dark" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive weekly updates and alerts via email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive in-app notifications for important activity.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy & Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <h3 className="font-medium">Public Profile</h3>
                <p className="text-sm text-muted-foreground">Make your basic profile information visible to other users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={publicProfile} onChange={() => setPublicProfile(!publicProfile)} />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
            </div>
          </div>
        </section>

        {/* Export Data */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Data & Export
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">You can download a full archive of your family trees and account data.</p>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Request Data Archive
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-500 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-red-500/80">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="outline" className="w-full sm:w-auto text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30">
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-6 border-t border-border mt-8">
        <Button size="lg" onClick={handleSave}>Save All Changes</Button>
      </div>
    </div>
  );
}
