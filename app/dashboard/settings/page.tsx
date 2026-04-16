"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Bell, Shield, Trash2, Save } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  
  // Use navigation guard
  const { goBack } = useNavigationGuard({
    allowedBackPaths: ["/dashboard", "/projects", "/"]
  });

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    
    try {
      const response = await fetch("/api/users/me", {
        method: "DELETE",
      });
      
      if (response.ok) {
        await signOut({ callbackUrl: "/" });
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => goBack("/dashboard")}
            className="inline-flex items-center gap-2 text-ink-300 hover:text-volt transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Settings
            </h1>
            <p className="text-ink-300">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-volt" />
              <h2 className="font-display text-xl font-semibold text-white">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-volt/20 rounded-full flex items-center justify-center">
                    <User size={24} className="text-volt" />
                  </div>
                )}
                <div>
                  <h3 className="text-white font-semibold">{session?.user?.name || "User"}</h3>
                  <p className="text-ink-300 text-sm">{session?.user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={session?.user?.name || ""}
                    className="input w-full"
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={session?.user?.email || ""}
                    className="input w-full"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-volt" />
              <h2 className="font-display text-xl font-semibold text-white">Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Voice Guidance</h3>
                  <p className="text-ink-400 text-sm">Enable AI voice readout during sessions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-ink-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-volt"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Auto-advance Steps</h3>
                  <p className="text-ink-400 text-sm">Automatically move to next step when AI detects completion</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-ink-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-volt"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Camera Quality</h3>
                  <p className="text-ink-400 text-sm">Higher quality improves AI accuracy but uses more data</p>
                </div>
                <select className="input w-32">
                  <option value="high">High</option>
                  <option value="medium" selected>Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-volt" />
              <h2 className="font-display text-xl font-semibold text-white">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Data Collection</h3>
                  <p className="text-ink-400 text-sm">Allow anonymous usage analytics to improve the service</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-ink-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-volt"></div>
                </label>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Export Data</h3>
                <p className="text-ink-400 text-sm mb-3">Download all your session data and project history</p>
                <button className="btn-ghost px-4 py-2 text-sm">
                  Download Data
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 size={20} className="text-red-500" />
              <h2 className="font-display text-xl font-semibold text-white">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Delete Account</h3>
                <p className="text-ink-400 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ink-300 mb-2">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="input w-full max-w-xs"
                      placeholder="DELETE"
                    />
                  </div>
                  
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "DELETE"}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={() => {
                setSaving(true);
                setTimeout(() => setSaving(false), 1000);
              }}
              disabled={saving}
              className="btn-primary px-6 py-3 font-semibold"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}