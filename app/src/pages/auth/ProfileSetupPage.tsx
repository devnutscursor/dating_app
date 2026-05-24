import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, MapPin, HeartHandshake, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { datingGoals, countries, interestTags } from '@/config/design';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { apiPatch, apiUploadFile } from '@/lib/api';
import type { User } from '@/types';

const PROFILE_SETUP_DRAFT_KEY = 'memberdate_profile_setup_draft';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    photo: null as string | null,
    country: '',
    city: '',
    datingGoal: '',
    aboutMe: '',
    lookingFor: '',
    interests: [] as string[],
  });

  useEffect(() => {
    if (authLoading) return;
    if (user?.emailVerificationRequired) {
      navigate('/verify-email', { replace: true, state: { email: user.email } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_SETUP_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { step?: number; profileData?: typeof profileData };
      if (parsed.profileData) {
        setProfileData((prev) => ({ ...prev, ...parsed.profileData }));
      }
      if (typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 4) {
        setStep(parsed.step);
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_SETUP_DRAFT_KEY, JSON.stringify({ step, profileData }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [step, profileData]);

  const openPhotoPicker = () => photoInputRef.current?.click();

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoUploading(true);
    try {
      const data = await apiUploadFile<{ url: string }>('/uploads/image', file);
      setProfileData((p) => ({ ...p, photo: data.url }));
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const newInterests = profileData.interests.includes(interest)
      ? profileData.interests.filter((i) => i !== interest)
      : [...profileData.interests, interest];
    setProfileData({ ...profileData, interests: newInterests });
  };

  const completeProfile = async () => {
    if (!profileData.aboutMe.trim() || !profileData.lookingFor.trim()) {
      toast.error('Please fill in About Me and Looking For');
      return;
    }
    if (profileData.interests.length === 0) {
      toast.error('Select at least one interest');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        country: profileData.country,
        city: profileData.city.trim(),
        datingGoal: profileData.datingGoal,
        aboutMe: profileData.aboutMe.trim(),
        lookingFor: profileData.lookingFor.trim(),
        interests: profileData.interests,
        profileSetupComplete: true,
      };
      if (profileData.photo) {
        payload.profilePicture = profileData.photo;
        if (user?.role === 'female') {
          const existing = user?.photos ?? [];
          const dup = existing.some((p) => p.url === profileData.photo);
          if (!dup) {
            payload.photos = [
              ...existing.map((p) => ({
                id: p.id,
                url: p.url,
                thumbnail: p.thumbnail,
                isPublic: p.isPublic,
                isUnlocked: p.isUnlocked,
                unlockPrice: p.unlockPrice,
              })),
              { url: profileData.photo, isPublic: true, isUnlocked: false },
            ];
          }
        }
      }
      const { user: updated } = await apiPatch<{ user: User }>('/users/me', payload);
      await refreshUser();
      try {
        localStorage.removeItem(PROFILE_SETUP_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      toast.success('Profile saved');
      navigate(updated.role === 'female' ? '/woman/home' : '/man/home', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 2) {
      if (!profileData.country || !profileData.city.trim()) {
        toast.error('Please select your country and enter your city');
        return;
      }
    }
    if (step === 3) {
      if (!profileData.datingGoal) {
        toast.error('Please choose a dating goal');
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    void completeProfile();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Add Your Photo</h2>
              <p className="text-gray-500">Profiles with photos get more attention — upload from your device</p>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPhotoSelected(e)}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={openPhotoPicker}
                disabled={photoUploading}
                className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 transition-colors hover:border-green-500 disabled:opacity-60"
              >
                {profileData.photo ? (
                  <img src={profileData.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                    <span className="text-sm text-gray-500">{photoUploading ? 'Uploading…' : 'Choose photo'}</span>
                  </div>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-medium text-green-500 hover:text-green-600"
              >
                Skip for now
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Where Are You From?</h2>
              <p className="text-gray-500">Help us find matches near you</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Country
                </label>
                <select
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.flag} {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="Enter your city"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">What Are You Looking For?</h2>
              <p className="text-gray-500">Select your dating goal</p>
            </div>

            <div className="space-y-2">
              {datingGoals.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setProfileData({ ...profileData, datingGoal: goal.value })}
                  className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    profileData.datingGoal === goal.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <HeartHandshake
                    className={`h-5 w-5 ${
                      profileData.datingGoal === goal.value ? 'text-green-500' : 'text-gray-400'
                    }`}
                  />
                  <span className="font-medium">{goal.label}</span>
                  {profileData.datingGoal === goal.value && <Check className="ml-auto h-5 w-5 text-green-500" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Tell Us About Yourself</h2>
              <p className="text-gray-500">Bio and interests (required)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">About Me *</label>
                <textarea
                  value={profileData.aboutMe}
                  onChange={(e) => setProfileData({ ...profileData, aboutMe: e.target.value })}
                  placeholder="Tell others about yourself..."
                  rows={3}
                  required
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Looking For *</label>
                <textarea
                  value={profileData.lookingFor}
                  onChange={(e) => setProfileData({ ...profileData, lookingFor: e.target.value })}
                  placeholder="What are you looking for in a partner?"
                  rows={2}
                  required
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Interests * (pick at least one)</label>
                <div className="flex flex-wrap gap-2">
                  {interestTags.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        profileData.interests.includes(interest)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex">
            <BrandLogo size="sm" tone="dark" />
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          {renderStep()}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="text-gray-500 hover:text-gray-700">
                Back
              </button>
            ) : (
              <div />
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={saving || photoUploading}
              className="bg-green-500 px-6 hover:bg-green-600"
            >
              {step === 4 ? (saving ? 'Saving…' : 'Complete') : 'Next'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
