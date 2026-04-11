import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Shield, CreditCard, Lock } from 'lucide-react';

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
    id: 'coins',
    title: 'Coins & Payments',
    icon: CreditCard,
    faqs: [
      {
        question: 'What are coins used for?',
        answer: 'Coins are used for premium features like unlocking private photos/videos, video calls, sending gifts, and boosting your profile visibility.',
      },
      {
        question: 'How do I purchase coins?',
        answer: 'Go to "My Wallet" and select a coin pack. We accept various payment methods including credit cards and PayPal.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are handled on a case-by-case basis. Please contact our support team for assistance.',
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
    id: 'features',
    title: 'Features',
    icon: Lock,
    faqs: [
      {
        question: 'How do video calls work?',
        answer: 'Click the video icon in any chat to start a video call. Video calls are charged per minute using coins.',
      },
      {
        question: 'What is profile boost?',
        answer: 'Profile boost increases your visibility, making your profile appear more often in search results for 24 hours.',
      },
      {
        question: 'How do I unlock private content?',
        answer: 'Click on the lock icon on any private photo or video. You\'ll be prompted to pay the unlock price in coins.',
      },
    ],
  },
];

export default function ManFAQ() {
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
            <p className="text-white/80">Our support team is here to assist you</p>
          </div>
          <button className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-white/90 transition-colors">
            Contact Us
          </button>
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
