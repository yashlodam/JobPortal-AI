/**
 * src/Pages/recruiter/RecruiterSettingsPage.jsx
 *
 * Recruiter Settings Page (Profile, Security, Preferences, Notification Settings).
 */

import React, { useState } from "react";
import { User, Lock, Bell, Sliders, Save, CheckCircle } from "lucide-react";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { useAppSelector } from "../../State/Store";
import { useToast } from "../../components/ui/ToastNotification";

export default function RecruiterSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAppSelector((state) => state.auth);

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    toast.success("Recruiter settings updated successfully!");
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password & Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <RecruiterLayout
      title="Recruiter Settings"
      subtitle="Manage your personal profile, credentials, and notification preferences."
      breadcrumbs={[{ label: "Settings" }]}
    >
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <Card className="p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || "John Doe"}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-xs text-heading placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email || "recruiter@example.com"}
                  disabled
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-xs text-muted opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Job Title</label>
                <input
                  type="text"
                  defaultValue="Senior Technical Recruiter"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-xs text-heading placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-xs text-heading placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-xs text-heading placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <label className="flex items-center justify-between text-xs text-heading font-semibold cursor-pointer">
                <span>Email me when a new candidate applies</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary" />
              </label>
              <label className="flex items-center justify-between text-xs text-heading font-semibold cursor-pointer">
                <span>Notify me 15 minutes before scheduled interviews</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary" />
              </label>
              <label className="flex items-center justify-between text-xs text-heading font-semibold cursor-pointer">
                <span>Weekly hiring pipeline summary report</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary" />
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-between">
            {saved && (
              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Settings saved successfully
              </span>
            )}
            <button
              type="submit"
              className="ml-auto flex items-center gap-2 rounded-xl gradient-bg-signature px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Card>
    </RecruiterLayout>
  );
}
