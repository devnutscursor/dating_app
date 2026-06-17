import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Video, Shield, Check, Star, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coinPacks, mockUsers } from '@/data/mockData';
import BrandLogo from '@/components/BrandLogo';

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
  const memberFeedPhotos = useMemo(() => {
    const urls = mockUsers.map((u) => u.profilePicture).filter(Boolean) as string[];
    return urls.length ? urls : [];
  }, []);
  const marqueeTrack = useMemo(
    () => (memberFeedPhotos.length ? [...memberFeedPhotos, ...memberFeedPhotos] : []),
    [memberFeedPhotos]
  );
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/65 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="inline-flex">
              <BrandLogo size="sm" tone="amber" />
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
          <div className="md:hidden border-t border-white/10 bg-[#111111]/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-amber-50/75">Features</a>
              <a href="#how-it-works" className="block py-2 text-amber-50/75">How It Works</a>
              <a href="#pricing" className="block py-2 text-amber-50/75">Pricing</a>
              <a href="#faq" className="block py-2 text-amber-50/75">FAQ</a>
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/width_896.webp')" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,210,30,0.12),transparent_34%),linear-gradient(90deg,rgba(11,11,11,0.92)_0%,rgba(11,11,11,0.72)_42%,rgba(11,11,11,0.3)_100%)]" />
        <div className="max-w-7xl mx-auto">
          <div className="relative flex flex-col gap-8 lg:min-h-[680px] lg:flex-row lg:items-center lg:justify-between">
            <div className="relative z-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm text-amber-100/80 backdrop-blur-sm">
                <Check className="h-4 w-4 text-amber-200" />
                100% verified members
              </div>
              <h1
                className="font-serif text-4xl leading-[0.9] sm:text-[52px] lg:text-[5.25rem]"
                style={{ color: '#fde68a' }}
              >
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

            <div className="relative z-10 w-full max-w-xl shrink-0 lg:w-[44%] lg:max-w-xl">
              <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-3 shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl antialiased sm:p-4">
                <div className="relative z-20 mb-3 flex items-center justify-between gap-3 sm:mb-4">
                  <h3 className="font-serif text-lg text-white sm:text-xl">Recently Verified Members</h3>
                  <div className="hidden items-center gap-1.5 rounded-full border border-[#ffd21e]/30 bg-[#ffd21e]/10 px-3 py-1.5 text-xs text-[#ffe680] md:flex">
                    <Users className="h-3 w-3" />
                    Live feed
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#141414]/95 to-transparent sm:w-14" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#141414]/95 to-transparent sm:w-14" />
                  <div className="flex w-max gap-3 py-0.5 motion-reduce:animate-none animate-member-feed-marquee will-change-transform">
                    {marqueeTrack.map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className={`relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.35)] sm:h-[5.25rem] sm:w-[5.25rem] ${
                          index % 7 !== 3 ? 'opacity-75 blur-[1px]' : 'opacity-100 blur-0 ring-1 ring-amber-200/35'
                        }`}
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover antialiased [image-rendering:auto]"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                        <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/95 shadow">
                          <Check className="h-2.5 w-2.5 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-200 mb-4">
              Why Choose MemberDate?
            </h2>
            <p className="text-lg text-amber-50/65 max-w-2xl mx-auto">
              We provide a safe and fun platform for you to meet new people and find meaningful connections.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform hover:-translate-y-1">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-200/10">
                  <feature.icon className="w-7 h-7 text-amber-200" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-amber-100">{feature.title}</h3>
                <p className="text-amber-50/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#090909]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-200 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-amber-50/65 max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to find your match.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-4 text-6xl font-bold text-amber-200/15">{step.step}</div>
                <h3 className="mb-2 text-xl font-semibold text-amber-100">{step.title}</h3>
                <p className="text-amber-50/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-200 mb-4">
              Coin Packs
            </h2>
            <p className="text-lg text-amber-50/65 max-w-2xl mx-auto">
              Purchase coins with cryptocurrency to unlock premium features and enhance your experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {coinPacks.map((pack) => (
              <div 
                key={pack.id} 
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ${
                  pack.isPopular ? 'ring-2 ring-amber-200/60 relative' : ''
                }`}
              >
                {pack.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-200 px-4 py-1 text-sm font-medium text-gray-950">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-xl font-semibold text-amber-100">{pack.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">${pack.price}</span>
                  {pack.originalPrice && (
                    <span className="text-amber-50/35 line-through">${pack.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/10">
                    <span className="font-bold text-amber-200">C</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{pack.coins}</span>
                  <span className="text-amber-50/55">coins</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-amber-50/60">
                      <Check className="w-4 h-4 text-amber-200" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${pack.isPopular ? 'bg-amber-200 text-gray-950 hover:bg-amber-100' : 'border-amber-200/30 bg-transparent text-amber-100 hover:bg-white/5'}`}
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
      <section className="py-20 bg-[#090909]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-200 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-amber-50/65 max-w-2xl mx-auto">
              Hear from couples who found love on MemberDate.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-200 fill-amber-200" />
                  ))}
                </div>
                <p className="mb-4 text-amber-50/65">"{testimonial.text}"</p>
                <p className="font-semibold text-amber-100">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-200 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-amber-50/65">
              Got questions? We've got answers.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
                >
                  <span className="font-medium text-amber-100">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-100/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-amber-100/60" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-amber-50/65">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#090909]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-8 py-14 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
          <h2 className="font-serif text-3xl sm:text-4xl text-amber-200 mb-4">
            Ready to Find Your Match?
          </h2>
          <p className="text-lg text-amber-50/65 mb-8">
            Join thousands of singles already finding love on MemberDate.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-amber-200 text-gray-950 hover:bg-amber-100 text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrandLogo size="sm" tone="amber" />
              </div>
              <p className="text-amber-50/50">
                Find your perfect match today. Safe, secure, and fun dating platform.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-amber-100">Quick Links</h4>
              <ul className="space-y-2 text-amber-50/50">
                <li><Link to="/login" className="transition-colors hover:text-amber-100">Log in</Link></li>
                <li><Link to="/register" className="transition-colors hover:text-amber-100">Sign up</Link></li>
                <li><a href="#features" className="transition-colors hover:text-amber-100">Features</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-amber-100">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-amber-100">Legal</h4>
              <ul className="space-y-2 text-amber-50/50">
                <li><Link to="/terms" className="transition-colors hover:text-amber-100">Terms of Service</Link></li>
                <li><Link to="/privacy" className="transition-colors hover:text-amber-100">Privacy Policy</Link></li>
                <li><Link to="/refund" className="transition-colors hover:text-amber-100">Refund Policy</Link></li>
                <li><Link to="/dmca" className="transition-colors hover:text-amber-100">DMCA</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-amber-100">Support</h4>
              <ul className="space-y-2 text-amber-50/50">
                <li><Link to="/rules" className="transition-colors hover:text-amber-100">Community Rules</Link></li>
                <li><a href="#faq" className="transition-colors hover:text-amber-100">FAQ</a></li>
                <li><a href="#" className="transition-colors hover:text-amber-100">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-amber-50/40">
            <p>&copy; 2026 MemberDate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
