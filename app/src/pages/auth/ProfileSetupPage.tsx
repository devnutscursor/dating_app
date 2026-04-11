import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Camera, MapPin, HeartHandshake, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { datingGoals, countries, interestTags } from '@/config/design';

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    photo: null as string | null,
    country: '',
    city: '',
    datingGoal: '',
    aboutMe: '',
    lookingFor: '',
    interests: [] as string[],
  });

  const handlePhotoUpload = () => {
    // Mock photo upload
    setProfileData({ 
      ...profileData, 
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' 
    });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = profileData.interests.includes(interest)
      ? profileData.interests.filter(i => i !== interest)
      : [...profileData.interests, interest];
    setProfileData({ ...profileData, interests: newInterests });
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete profile setup - redirect to home
      window.location.href = '/man/home';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Your Photo</h2>
              <p className="text-gray-500">Profiles with photos get 10x more matches</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handlePhotoUpload}
                className="relative w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors overflow-hidden"
              >
                {profileData.photo ? (
                  <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                  </div>
                )}
              </button>
            </div>

            <div className="text-center">
              <button className="text-green-500 hover:text-green-600 text-sm font-medium">
                Skip for now
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Where Are You From?</h2>
              <p className="text-gray-500">Help us find matches near you</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Country
                </label>
                <select
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">What Are You Looking For?</h2>
              <p className="text-gray-500">Select your dating goal</p>
            </div>

            <div className="space-y-2">
              {datingGoals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setProfileData({ ...profileData, datingGoal: goal.value })}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    profileData.datingGoal === goal.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <HeartHandshake className={`w-5 h-5 ${
                    profileData.datingGoal === goal.value ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">{goal.label}</span>
                  {profileData.datingGoal === goal.value && (
                    <Check className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h2>
              <p className="text-gray-500">Add your interests and bio</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                <textarea
                  value={profileData.aboutMe}
                  onChange={(e) => setProfileData({ ...profileData, aboutMe: e.target.value })}
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
                <textarea
                  value={profileData.lookingFor}
                  onChange={(e) => setProfileData({ ...profileData, lookingFor: e.target.value })}
                  placeholder="What are you looking for in a partner?"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interestTags.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">MemberDate</span>
          </Link>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 px-6"
            >
              {step === 4 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
