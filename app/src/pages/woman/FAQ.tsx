import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Shield, Lock, TrendingUp } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact';

const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    icon: HelpCircle,
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click on the "Sign up" button on the homepage and fill in your details. You\'ll need to verify your email before you can start using the platform.',
      },
      {
        question: 'Is messaging free?',
        answer: 'Yes! Basic messaging is completely free for all users. You can chat with your matches without any charges.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to your profile settings and click on "Delete Account". Please note that this action is irreversible.',
      },
    ],
  },
  {
    id: 'earnings',
    title: 'Earnings & Payouts',
    icon: TrendingUp,
    faqs: [
      {
        question: 'How do I earn coins?',
        answer: 'You can earn coins through video calls (10 coins/minute), receiving gifts from users, and unlocking private content.',
      },
      {
        question: 'How do I withdraw my earnings?',
        answer: 'Go to the Payouts section, enter your USDT TRC20 wallet address, and request a withdrawal. There is a 5% processing fee.',
      },
      {
        question: 'When will I receive my payout?',
        answer: 'Payouts are processed within 24-48 hours after your request is approved.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Privacy',
    icon: Shield,
    faqs: [
      {
        question: 'Is my data secure?',
        answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information.',
      },
      {
        question: 'How do I block someone?',
        answer: 'In any chat, click the menu button and select "Block User". They will no longer be able to contact you.',
      },
      {
        question: 'How do I report inappropriate behavior?',
        answer: 'Click on the menu in any chat and select "Report User". Our moderation team will review your report.',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content & Media',
    icon: Lock,
    faqs: [
      {
        question: 'How do I upload photos/videos?',
        answer: 'Go to your profile and click "Add Photo" or "Add Video". You can set privacy settings and prices for private content.',
      },
      {
        question: 'What content is allowed?',
        answer: 'All content must comply with our community guidelines. Explicit content is reviewed by our moderation team.',
      },
      {
        question: 'How do I set prices for private content?',
        answer: 'When uploading media, select "Private" and set your desired unlock price in coins.',
      },
    ],
  },
];

export default function WomanFAQ() {
  const [openCategory, setOpenCategory] = useState<string | null>('general');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500">Find answers to your questions</p>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Need more help?</h3>
            <p className="text-white/80">Email us at {SUPPORT_EMAIL}</p>
          </div>
          <a
            href={SUPPORT_MAILTO}
            className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4">
        {faqCategories.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategory === category.id;

          return (
            <div key={category.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenCategory(isOpen ? null : category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-900">{category.title}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {category.faqs.map((faq, index) => {
                    const faqId = `${category.id}-${index}`;
                    const isFaqOpen = openFaq === faqId;

                    return (
                      <div key={faqId} className="border-b border-gray-100 last:border-none">
                        <button
                          onClick={() => setOpenFaq(isFaqOpen ? null : faqId)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-700">{faq.question}</span>
                          {isFaqOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                          )}
                        </button>
                        {isFaqOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
