import { useEffect, useState } from 'react';
import { Save, Coins, Video, Shield, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiGet, apiPatch } from '@/lib/api';

interface PlatformSettings {
  coinPricing: {
    photoUnlock: number;
    videoUnlock: number;
    audioCallPerMinute: number;
    videoCallPerMinute: number;
    messagePriority: number;
    profileBoost: number;
    messageCost: number;
  };
  videoCall: {
    minDuration: number;
    maxDuration: number;
    quality: 'sd' | 'hd' | 'fhd';
  };
  security: {
    requireVerification: boolean;
    autoBlockReports: number;
    contentModeration: boolean;
  };
  notifications: {
    emailAdmins: boolean;
    newUserAlerts: boolean;
    reportAlerts: boolean;
  };
}

const DEFAULTS: PlatformSettings = {
  coinPricing: {
    photoUnlock: 100,
    videoUnlock: 500,
    audioCallPerMinute: 5,
    videoCallPerMinute: 10,
    messagePriority: 5,
    profileBoost: 100,
    messageCost: 0,
  },
  videoCall: { minDuration: 1, maxDuration: 120, quality: 'hd' },
  security: { requireVerification: true, autoBlockReports: 0, contentModeration: true },
  notifications: { emailAdmins: false, newUserAlerts: false, reportAlerts: false },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ settings: PlatformSettings }>('/admin/settings');
        setSettings((prev) => ({ ...prev, ...data.settings }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiPatch<{ settings: PlatformSettings }>('/admin/settings', settings);
      setSettings((prev) => ({ ...prev, ...data.settings }));
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const setPricing = (key: keyof PlatformSettings['coinPricing'], value: number) =>
    setSettings((s) => ({ ...s, coinPricing: { ...s.coinPricing, [key]: value } }));

  const setVideoCall = <K extends keyof PlatformSettings['videoCall']>(key: K, value: PlatformSettings['videoCall'][K]) =>
    setSettings((s) => ({ ...s, videoCall: { ...s.videoCall, [key]: value } }));

  const setSecurity = <K extends keyof PlatformSettings['security']>(key: K, value: PlatformSettings['security'][K]) =>
    setSettings((s) => ({ ...s, security: { ...s.security, [key]: value } }));

  const setNotif = (key: keyof PlatformSettings['notifications'], value: boolean) =>
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure platform settings</p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving} className="gap-2 bg-green-500 hover:bg-green-600">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {/* Coin Pricing */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
            <Coins className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Coin Pricing</h2>
            <p className="text-sm text-gray-500">Set coin costs for features</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              { key: 'photoUnlock', label: 'Photo Unlock', hint: 'Default when woman sets no individual price' },
              { key: 'videoUnlock', label: 'Video Unlock', hint: 'Default when woman sets no individual price' },
              { key: 'audioCallPerMinute', label: 'Voice Call (per min)', hint: 'Deducted from man every 60 s' },
              { key: 'videoCallPerMinute', label: 'Video Chat (per min)', hint: 'Deducted from man every 60 s' },
              { key: 'messageCost', label: 'Message cost (coins)', hint: 'Set to 0 for free messaging' },
            ] as { key: keyof PlatformSettings['coinPricing']; label: string; hint: string }[]
          ).map(({ key, label, hint }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                min={0}
                value={settings.coinPricing[key]}
                onChange={(e) => setPricing(key, Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-400">{hint}</p>
            </div>
          ))}

          {/* Profile Boost — implement in a future release
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Profile Boost</label>
            <input
              type="number"
              min={0}
              value={settings.coinPricing.profileBoost}
              onChange={(e) => setPricing('profileBoost', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-400">Coin cost for profile boost (coming soon)</p>
          </div>
          */}
        </div>
      </div>

      {/* Video Call Settings */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Video Call Settings</h2>
            <p className="text-sm text-gray-500">Configure video call options</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Duration (min)</label>
            <input
              type="number"
              min={1}
              value={settings.videoCall.maxDuration}
              onChange={(e) => setVideoCall('maxDuration', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-400">Call ends automatically at this duration</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Video Quality</label>
            <select
              value={settings.videoCall.quality}
              onChange={(e) => setVideoCall('quality', e.target.value as 'sd' | 'hd' | 'fhd')}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="sd">SD (480p)</option>
              <option value="hd">HD (720p)</option>
              <option value="fhd">Full HD (1080p)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-500">Configure security options</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={settings.security.requireVerification}
              onChange={(e) => setSecurity('requireVerification', e.target.checked)}
              className="h-5 w-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Require Email Verification</p>
              <p className="text-sm text-gray-500">Users must verify email before using the platform</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={settings.security.contentModeration}
              onChange={(e) => setSecurity('contentModeration', e.target.checked)}
              className="h-5 w-5 text-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Enable Content Moderation</p>
              <p className="text-sm text-gray-500">New female profile photos/videos require moderator approval</p>
            </div>
          </label>

          <div className="rounded-xl bg-gray-50 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Auto-block after reports</label>
            <input
              type="number"
              min={0}
              value={settings.security.autoBlockReports}
              onChange={(e) => setSecurity('autoBlockReports', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Set to 0 to disable auto-blocking. Number of reports before a user is automatically suspended.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500">Configure admin notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          {(
            [
              { key: 'emailAdmins', label: 'Email Admins', desc: 'Send email copies to all admin accounts for the alerts below' },
              { key: 'newUserAlerts', label: 'New User Alerts', desc: 'Alert when someone registers (bell; email if Email Admins is on)' },
              { key: 'reportAlerts', label: 'Report Alerts', desc: 'Alert when a member submits a report (bell; email if Email Admins is on)' },
            ] as { key: keyof PlatformSettings['notifications']; label: string; desc: string }[]
          ).map(({ key, label, desc }) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={settings.notifications[key]}
                onChange={(e) => setNotif(key, e.target.checked)}
                className="h-5 w-5 text-green-500"
              />
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
