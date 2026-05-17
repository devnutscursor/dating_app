import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DefaultChatRedirect from '@/components/DefaultChatRedirect';

// Landing Pages
import LandingPage from '@/pages/landing/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import ProfileSetupPage from '@/pages/auth/ProfileSetupPage';

// Man User Pages
import ManLayout from '@/layouts/ManLayout';
import ManHome from '@/pages/man/Home';
import ManChatDetail from '@/pages/man/ChatDetail';
import ManLikes from '@/pages/man/Likes';
import ManOnline from '@/pages/man/Online';
import ManFAQ from '@/pages/man/FAQ';
import ManWallet from '@/pages/man/Wallet';
import ManProfile from '@/pages/man/Profile';
import ProfileEditPage from '@/pages/profile/ProfileEditPage';
import ManSwipes from '@/pages/man/Swipes';
import ManViewProfile from '@/pages/man/ViewProfile';

// Woman User Pages
import WomanLayout from '@/layouts/WomanLayout';
import WomanHome from '@/pages/woman/Home';
import WomanChatDetail from '@/pages/woman/ChatDetail';
import WomanLikes from '@/pages/woman/Likes';
import WomanOnline from '@/pages/woman/Online';
import WomanFAQ from '@/pages/woman/FAQ';
import WomanWallet from '@/pages/woman/Wallet';
import WomanProfile from '@/pages/woman/Profile';
import WomanSwipes from '@/pages/woman/Swipes';
import WomanViewProfile from '@/pages/woman/ViewProfile';
import WomanPayouts from '@/pages/woman/Payouts';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminContent from '@/pages/admin/Content';
import AdminReports from '@/pages/admin/Reports';
import AdminTransactions from '@/pages/admin/Transactions';
import AdminPayouts from '@/pages/admin/Payouts';
import AdminSettings from '@/pages/admin/Settings';

// Moderator Pages
import ModeratorLayout from '@/layouts/ModeratorLayout';
import ModeratorDashboard from '@/pages/moderator/Dashboard';
import ModeratorContent from '@/pages/moderator/Content';
import ModeratorReports from '@/pages/moderator/Reports';
import ModeratorVerifications from '@/pages/moderator/Verifications';
import ModeratorSupportChatPage from '@/pages/moderator/ModeratorSupportChat';

// Shared Pages
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import RefundPage from '@/pages/legal/RefundPage';
import DMCAPage from '@/pages/legal/DMCAPage';
import RulesPage from '@/pages/legal/RulesPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />

          {/* Man User Routes */}
          <Route
            path="/man"
            element={
              <ProtectedRoute allowedRoles={['male']}>
                <ManLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/man/home" replace />} />
            <Route path="home" element={<ManHome />} />
            <Route path="chats" element={<DefaultChatRedirect area="man" />} />
            <Route path="chats/:chatId" element={<ManChatDetail />} />
            <Route path="likes" element={<ManLikes />} />
            <Route path="online" element={<ManOnline />} />
            <Route path="faq" element={<ManFAQ />} />
            <Route path="wallet" element={<ManWallet />} />
            <Route path="profile" element={<ManProfile />} />
            <Route path="profile/edit" element={<ProfileEditPage />} />
            <Route path="swipes" element={<ManSwipes />} />
            <Route path="view-profile/:userId" element={<ManViewProfile />} />
          </Route>

          {/* Woman User Routes */}
          <Route
            path="/woman"
            element={
              <ProtectedRoute allowedRoles={['female']}>
                <WomanLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/woman/home" replace />} />
            <Route path="home" element={<WomanHome />} />
            <Route path="chats" element={<DefaultChatRedirect area="woman" />} />
            <Route path="chats/:chatId" element={<WomanChatDetail />} />
            <Route path="likes" element={<WomanLikes />} />
            <Route path="online" element={<WomanOnline />} />
            <Route path="faq" element={<WomanFAQ />} />
            <Route path="wallet" element={<WomanWallet />} />
            <Route path="profile" element={<WomanProfile />} />
            <Route path="profile/edit" element={<ProfileEditPage />} />
            <Route path="swipes" element={<WomanSwipes />} />
            <Route path="view-profile/:userId" element={<WomanViewProfile />} />
            <Route path="payouts" element={<WomanPayouts />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="payouts" element={<AdminPayouts />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Moderator Routes */}
          <Route
            path="/moderator"
            element={
              <ProtectedRoute allowedRoles={['moderator']}>
                <ModeratorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/moderator/dashboard" replace />} />
            <Route path="dashboard" element={<ModeratorDashboard />} />
            <Route path="content" element={<ModeratorContent />} />
            <Route path="reports" element={<ModeratorReports />} />
            <Route path="support/:chatId" element={<ModeratorSupportChatPage />} />
            <Route path="verifications" element={<ModeratorVerifications />} />
          </Route>

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          <Route path="/rules" element={<RulesPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
