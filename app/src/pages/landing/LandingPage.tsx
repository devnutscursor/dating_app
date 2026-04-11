import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, MessageCircle, Video, Shield, Check, Star, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coinPacks, mockUsers } from '@/data/mockData';

const features = [
  {
    icon: Users,
    title: 'Find Your Match',
    description: 'Browse through thousands of verified profiles and find someone special.',
  },
  {
    icon: MessageCircle,
    title: 'Instant Messaging',
    description: 'Chat in real-time with your matches. Free messaging for everyone.',
  },
  {
    icon: Video,
    title: 'Video Calls',
    description: 'Connect face-to-face with secure video calling feature.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your privacy and security are our top priorities.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Create Profile',
    description: 'Sign up and create your profile in minutes. Add photos and tell us about yourself.',
  },
  {
    step: '02',
    title: 'Browse Matches',
    description: 'Use our advanced filters to find people who match your preferences.',
  },
  {
    step: '03',
    title: 'Start Chatting',
    description: 'Send messages and connect with people who interest you.',
  },
  {
    step: '04',
    title: 'Meet Up',
    description: 'Take it to the next level with video calls or plan to meet in person.',
  },
];

const testimonials = [
  {
    name: 'Sarah & Mike',
    text: 'We met on MemberDate and instantly connected. Now we\'re happily married!',
    rating: 5,
  },
  {
    name: 'Emily & John',
    text: 'The platform made it so easy to find someone who shares my interests.',
    rating: 5,
  },
  {
    name: 'Lisa & David',
    text: 'Great experience! The video call feature helped us get to know each other better.',
    rating: 5,
  },
];

const faqs = [
  {
    question: 'Is messaging free?',
    answer: 'Yes! Basic messaging is completely free for all users. You can chat with your matches without any charges.',
  },
  {
    question: 'How do coins work?',
    answer: 'Coins are used for premium features like unlocking private photos/videos, video calls, and sending gifts.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security measures to protect your personal information.',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account at any time from your profile settings.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const verifiedMembers = mockUsers.filter((user) => user.gender === 'female').slice(0, 6);
  const heroGallery = mockUsers.filter((user) => user.gender === 'female').slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/65 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-3xl tracking-wide text-amber-200">MemberDate</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-amber-50/75 hover:text-amber-100 transition-colors">Features</a>
              <a href="#how-it-works" className="text-amber-50/75 hover:text-amber-100 transition-colors">How It Works</a>
              <a href="#pricing" className="text-amber-50/75 hover:text-amber-100 transition-colors">Pricing</a>
              <a href="#faq" className="text-amber-50/75 hover:text-amber-100 transition-colors">FAQ</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-amber-200/40 bg-transparent text-amber-100 hover:bg-amber-100/10 hover:text-amber-50">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-amber-200 text-gray-950 hover:bg-amber-100">Create your profile</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 py-2">Features</a>
              <a href="#how-it-works" className="block text-gray-600 py-2">How It Works</a>
              <a href="#pricing" className="block text-gray-600 py-2">Pricing</a>
              <a href="#faq" className="block text-gray-600 py-2">FAQ</a>
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link to="/login" className="block w-full">
                  <Button variant="outline" className="w-full border-amber-200/40 bg-transparent text-amber-100 hover:bg-amber-100/10 hover:text-amber-50">Sign in</Button>
                </Link>
                <Link to="/register" className="block w-full">
                  <Button className="w-full bg-amber-200 text-gray-950 hover:bg-amber-100">Create your profile</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0b0b0b] px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_left,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="max-w-7xl mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm text-amber-100/80 backdrop-blur-sm">
                <Check className="h-4 w-4 text-amber-200" />
                100% verified members
              </div>
              <h1 className="font-serif text-5xl leading-[0.95] text-amber-200 sm:text-6xl lg:text-7xl">
                Date Free
                <br />
                With
                <br />
                Real People
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-amber-50/78">
                Connection with 100% verified singles, in real-time. Verified by the latest real-time and secure facial
                and biometric verification technologies.
              </p>
              <p className="mt-5 max-w-xl text-base leading-7 text-amber-50/60">
                No fake profiles. No bots. Just genuine and deep connections with people who are eager to meet you,
                right now.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="min-w-[240px] rounded-full border border-amber-200/40 bg-amber-200/10 px-8 text-lg text-amber-50 backdrop-blur-sm hover:bg-amber-200/20">
                    Discover Your Connection
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="min-w-[240px] rounded-full border-amber-200/30 bg-transparent px-8 text-lg text-amber-100 hover:bg-white/5 hover:text-amber-50">
                    Start Verified Now
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-amber-50/65">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-200" />
                  <span>Free messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-200" />
                  <span>Verified profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-200" />
                  <span>Secure platform</span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[520px]">
              <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm" />
              <div className="absolute inset-4 grid grid-cols-2 gap-4 overflow-hidden rounded-[1.75rem]">
                {heroGallery.map((member, index) => (
                  <div
                    key={member.id}
                    className={`relative overflow-hidden rounded-[1.5rem] ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <img
                      src={member.profilePicture}
                      alt={member.name}
                      className={`h-full w-full object-cover ${
                        index === 0 ? 'blur-[1px] brightness-75' : 'blur-[3px] brightness-50'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-white/10 bg-black/55 p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h3 className="font-serif text-3xl text-amber-100">Recently Verified Members</h3>
                  <div className="hidden items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm text-amber-100 md:flex">
                    <Users className="h-4 w-4" />
                    Live feed
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {verifiedMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${
                        index !== 2 ? 'blur-[1.5px]' : ''
                      }`}
                    >
                      <img src={member.profilePicture} alt={member.name} className="aspect-[3/4] w-full object-cover" />
                      <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MemberDate?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a safe and fun platform for you to meet new people and find meaningful connections.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to find your match.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-green-100 mb-4">{step.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Coin Packs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Purchase coins to unlock premium features and enhance your experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {coinPacks.map((pack) => (
              <div 
                key={pack.id} 
                className={`bg-white rounded-2xl p-6 shadow-sm ${
                  pack.isPopular ? 'ring-2 ring-green-500 relative' : ''
                }`}
              >
                {pack.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{pack.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900">${pack.price}</span>
                  {pack.originalPrice && (
                    <span className="text-gray-400 line-through">${pack.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">C</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{pack.coins}</span>
                  <span className="text-gray-500">coins</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${pack.isPopular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  variant={pack.isPopular ? 'default' : 'outline'}
                >
                  Purchase
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from couples who found love on MemberDate.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Find Your Match?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of singles already finding love on MemberDate.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">MemberDate</span>
              </div>
              <p className="text-gray-400">
                Find your perfect match today. Safe, secure, and fun dating platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Log in</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Sign up</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                <li><Link to="/dmca" className="hover:text-white transition-colors">DMCA</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/rules" className="hover:text-white transition-colors">Community Rules</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 MemberDate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
