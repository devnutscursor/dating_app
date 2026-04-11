import { useState } from 'react';
import { Save, Coins, Video, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    coinPricing: {
      photoUnlock: 10,
      videoUnlock: 50,
      videoCallPerMinute: 10,
      messagePriority: 5,
      profileBoost: 100,
    },
    videoCall: {
      minDuration: 1,
      maxDuration: 120,
      quality: 'hd',
    },
    security: {
      requireVerification: true,
      autoBlockReports: 3,
      contentModeration: true,
    },
    notifications: {
      emailAdmins: true,
      newUserAlerts: false,
      reportAlerts: true,
    },
  });

  const handleSave = () => {
    // Save settings
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure platform settings</p>
        </div>
        <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      {/* Coin Pricing */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Coin Pricing</h2>
            <p className="text-sm text-gray-500">Set coin costs for features</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo Unlock</label>
            <input
              type="number"
              value={settings.coinPricing.photoUnlock}
              onChange={(e) => setSettings({
                ...settings,
                coinPricing: { ...settings.coinPricing, photoUnlock: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Unlock</label>
            <input
              type="number"
              value={settings.coinPricing.videoUnlock}
              onChange={(e) => setSettings({
                ...settings,
                coinPricing: { ...settings.coinPricing, videoUnlock: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Call (per min)</label>
            <input
              type="number"
              value={settings.coinPricing.videoCallPerMinute}
              onChange={(e) => setSettings({
                ...settings,
                coinPricing: { ...settings.coinPricing, videoCallPerMinute: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Priority</label>
            <input
              type="number"
              value={settings.coinPricing.messagePriority}
              onChange={(e) => setSettings({
                ...settings,
                coinPricing: { ...settings.coinPricing, messagePriority: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Boost</label>
            <input
              type="number"
              value={settings.coinPricing.profileBoost}
              onChange={(e) => setSettings({
                ...settings,
                coinPricing: { ...settings.coinPricing, profileBoost: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Video Call Settings */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Video Call Settings</h2>
            <p className="text-sm text-gray-500">Configure video call options</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Duration (min)</label>
            <input
              type="number"
              value={settings.videoCall.minDuration}
              onChange={(e) => setSettings({
                ...settings,
                videoCall: { ...settings.videoCall, minDuration: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (min)</label>
            <input
              type="number"
              value={settings.videoCall.maxDuration}
              onChange={(e) => setSettings({
                ...settings,
                videoCall: { ...settings.videoCall, maxDuration: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Quality</label>
            <select
              value={settings.videoCall.quality}
              onChange={(e) => setSettings({
                ...settings,
                videoCall: { ...settings.videoCall, quality: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="sd">SD (480p)</option>
              <option value="hd">HD (720p)</option>
              <option value="fhd">Full HD (1080p)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-500">Configure security options</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.requireVerification}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, requireVerification: e.target.checked }
              })}
              className="w-5 h-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Require Email Verification</p>
              <p className="text-sm text-gray-500">Users must verify email before using platform</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.contentModeration}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, contentModeration: e.target.checked }
              })}
              className="w-5 h-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Enable Content Moderation</p>
              <p className="text-sm text-gray-500">All uploads require approval before being visible</p>
            </div>
          </label>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-block after reports</label>
            <input
              type="number"
              value={settings.security.autoBlockReports}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, autoBlockReports: Number(e.target.value) }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">Number of reports before auto-blocking user</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500">Configure admin notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.emailAdmins}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, emailAdmins: e.target.checked }
              })}
              className="w-5 h-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Email Admins</p>
              <p className="text-sm text-gray-500">Send email notifications to admin team</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.newUserAlerts}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, newUserAlerts: e.target.checked }
              })}
              className="w-5 h-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">New User Alerts</p>
              <p className="text-sm text-gray-500">Notify when new users sign up</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.reportAlerts}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, reportAlerts: e.target.checked }
              })}
              className="w-5 h-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Report Alerts</p>
              <p className="text-sm text-gray-500">Notify when new reports are submitted</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
