import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SinglePost from './pages/SinglePost';
import DownloadFlow from './pages/DownloadFlow';
import DownloadTimer from './pages/DownloadTimer';
import FeatureRequests from './pages/FeatureRequests';
import ChangePassword from './pages/ChangePassword';
import Notifications from './pages/Notifications';
import UserActivity from './pages/UserActivity';
import WhatsAppChat from './components/WhatsAppChat';
import AdBlockDetector from './components/AdBlockDetector';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import Support from './pages/Support';
import Legal from './pages/Legal';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import DmcaDisclaimer from './pages/legal/DmcaDisclaimer';
import AboutUs from './pages/legal/AboutUs';
import Sitemap from './pages/legal/Sitemap';
import KidsModeGuard from './components/KidsModeGuard';
import AllCategories from './pages/AllCategories';
import Premium from './pages/Premium';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import NexoriaSound from './pages/NexoriaSound';
import SoundQueue from './pages/SoundQueue';
import AuraLeaderboard from './pages/AuraLeaderboard';
import AuraBattle from './pages/AuraBattle';
import AuraSurgeBanner from './components/AuraSurgeBanner';

// Admin Sound
import SoundDashboard from './pages/Admin/Sound/SoundDashboard';
import SoundSongs from './pages/Admin/Sound/SoundSongs';
import SoundAddSong from './pages/Admin/Sound/SoundAddSong';
import SoundPlaylists from './pages/Admin/Sound/SoundPlaylists';
import SoundCategories from './pages/Admin/Sound/SoundCategories';

// MovieBox Routes (Regular Imports)
import MovieBoxLayout from './components/MovieBoxLayout';
import MovieBox from './pages/MovieBox';
import MovieDetail from './pages/MovieDetail';
import MovieCategory from './pages/MovieCategory';
import MovieSearch from './pages/MovieSearch';
import WatchParty from './pages/WatchParty';
import MovieBrowse from './pages/MovieBrowse';


// New Components
import CyberpunkParticles from './components/CyberpunkParticles';
import useKonamiCode from './hooks/useKonamiCode';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Games from './pages/Games';
import NexoriaArena from './pages/NexoriaArena';

import { useEffect, Suspense, lazy } from 'react';
import { useGetSettingsQuery } from './features/settings/settingsApiSlice';

// Admin routes (Lazy Loaded)
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));       
const AdminPosts = lazy(() => import('./pages/Admin/AdminPosts'));          
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories'));
const AdminComments = lazy(() => import('./pages/Admin/AdminComments'));    
const AdminRatings = lazy(() => import('./pages/Admin/AdminRatings'));      
const MovieSettings = lazy(() => import('./pages/Admin/MovieSettings'));
const AdminModeration = lazy(() => import('./pages/Admin/AdminModeration'));
const AdminDownloads = lazy(() => import('./pages/Admin/AdminDownloads'));
const CreatePost = lazy(() => import('./pages/Admin/CreatePost'));
const AdminUsers = lazy(() => import('./pages/Admin/Users'));

const AdminSettings = lazy(() => import('./pages/Admin/Settings'));
// Legacy Admin Contact Messages removed, replaced by SupportCenter
const AdminAdblockAnalytics = lazy(() => import('./pages/Admin/AdminAdblockAnalytics'));
const AdminActivityLogs = lazy(() => import('./pages/Admin/AdminActivityLogs'));
const AdminLoginActivityLogs = lazy(() => import('./pages/Admin/AdminLoginActivityLogs'));
const AdminPremiumRequests = lazy(() => import('./pages/Admin/AdminPremiumRequests'));
const AdminReports = lazy(() => import('./pages/Admin/AdminReports'));
const AdminLiveMonitor = lazy(() => import('./pages/Admin/LiveMonitor'));

// Super Admin UI (Lazy Loaded)
const SuperAdminLayout = lazy(() => import('./components/SuperAdminLayout'));
const SuperDashboard = lazy(() => import('./pages/SuperAdmin/SuperDashboard'));
const ManageUsers = lazy(() => import('./pages/SuperAdmin/ManageUsers'));
const ManageAdmins = lazy(() => import('./pages/SuperAdmin/ManageAdmins'));
const RolesPermissions = lazy(() => import('./pages/SuperAdmin/RolesPermissions'));
const SiteSettings = lazy(() => import('./pages/SuperAdmin/SiteSettings'));
const SponsoredContent = lazy(() => import('./pages/SuperAdmin/SponsoredContentManager'));
const DatabaseManagement = lazy(() => import('./pages/SuperAdmin/DatabaseManagement'));
const SuperAnalytics = lazy(() => import('./pages/SuperAdmin/SuperAnalytics'));
const SecurityLogs = lazy(() => import('./pages/SuperAdmin/SecurityLogs'));
const ManagePlans = lazy(() => import('./pages/SuperAdmin/ManagePlans'));
const ManagePremiumUsers = lazy(() => import('./pages/SuperAdmin/ManagePremiumUsers'));
const SuperPremiumRequests = lazy(() => import('./pages/SuperAdmin/PremiumRequests'));
const SuperPurchaseRequests = lazy(() => import('./pages/SuperAdmin/PurchaseRequests'));
const FooterManagement = lazy(() => import('./pages/SuperAdmin/FooterManagement'));
const SupportCenter = lazy(() => import('./pages/SuperAdmin/SupportCenter'));
const HeroDisplayManager = lazy(() => import('./pages/SuperAdmin/HeroDisplayManager'));
const SystemNoticesManager = lazy(() => import('./pages/SuperAdmin/SystemNoticesManager'));
const SEOManager = lazy(() => import('./pages/SuperAdmin/SEOManager'));
const CouponManager = lazy(() => import('./pages/SuperAdmin/CouponManager'));
const ReviewModeration = lazy(() => import('./pages/SuperAdmin/ReviewModeration'));
const AppRequestModeration = lazy(() => import('./pages/SuperAdmin/AppRequestModeration'));
const UserRequestsAdmin = lazy(() => import('./pages/SuperAdmin/UserRequestsAdmin'));
const PushCampaigns = lazy(() => import('./pages/SuperAdmin/PushCampaigns'));
const TrashBin = lazy(() => import('./pages/SuperAdmin/TrashBin'));
const AuraRecalculate = lazy(() => import('./pages/SuperAdmin/AuraRecalculate'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

// MovieBox Admin Routes (Lazy Loaded)
const AdminMovieManagement = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MoviesList'));
const AdminMovieCategoryManager = lazy(() => import('./pages/SuperAdmin/MovieCategoryManager'));
const AdminMovieAnalytics = lazy(() => import('./pages/SuperAdmin/MovieAnalytics'));
const AdminMoviePremiumRequests = lazy(() => import('./pages/SuperAdmin/MoviePremiumRequests'));
const AdminAddMovie = lazy(() => import('./pages/SuperAdmin/MovieAdmin/AddMovie'));
const AdminMovieReviews = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MovieReviewsAdmin'));
const AdminMovieRatings = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MovieRatingsAdmin'));
const AdminMovieReports = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MovieReportsAdmin'));
const AdminMovieWatchHistory = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MovieWatchHistoryAdmin'));
const AdminMovieApprovalQueue = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MovieApprovalQueue'));
const AdminMovieSeriesManager = lazy(() => import('./pages/SuperAdmin/MovieAdmin/MovieSeriesManager'));

// Games Admin Routes
const AdminGamesList = lazy(() => import('./pages/SuperAdmin/GameAdmin/GamesList'));
const AdminAddGame = lazy(() => import('./pages/SuperAdmin/GameAdmin/AddGame'));
const AdminEditGame = lazy(() => import('./pages/SuperAdmin/GameAdmin/EditGame'));

// Loader component for suspense fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0F172A]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading module...</p>
    </div>
  </div>
);



const ComingSoonPage = ({ title, description, emoji }) => (
  <div className="p-4 sm:p-8 min-h-[70vh] flex flex-col items-center justify-center text-center relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
    
    <div className="bg-[#111]/40 backdrop-blur-3xl border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover:shadow-purple-500/20 group transform hover:-translate-y-2">
      <div className="text-6xl md:text-8xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 inline-block drop-shadow-2xl">{emoji}</div>
      <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-6 tracking-tight drop-shadow-lg">{title}</h1>
      <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">{description}</p>
      
      <div className="relative inline-block group/btn cursor-wait">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-md opacity-50 group-hover/btn:opacity-100 transition-opacity animate-pulse"></div>
        <div className="relative px-8 py-4 bg-black/50 backdrop-blur-md text-white font-bold text-lg rounded-xl border border-white/10 flex items-center gap-3">
          🚀 <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Launching Soon</span>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};

  // Initialize Easter Egg Hook
  useKonamiCode();

  useEffect(() => {
    if (settings.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.favicon]);

  return (
    <Router>
      <AuraSurgeBanner />
      <Toaster position="top-right" />
      <KidsModeGuard>
        <Suspense fallback={<PageLoader />}>
          <GlobalMusicPlayer />
          <CyberpunkParticles />
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/moviebox/watch-party/:slug" element={<WatchParty />} />
            </Route>

            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="forgotpassword" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="support" element={<Support />} />
              <Route path="contact" element={<Support />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-of-service" element={<TermsOfService />} />
              <Route path="dmca" element={<DmcaDisclaimer />} />
              <Route path="about-us" element={<AboutUs />} />
              <Route path="sitemap" element={<Sitemap />} />
              <Route path="legal/:pageSlug" element={<Legal />} />

              {/* Protected Routes inside Layout */}
              <Route element={<PrivateRoute />}>
                <Route index element={<Home />} />
                <Route path="/post/:slug" element={<SinglePost />} />
                <Route path="/download-timer" element={<DownloadTimer />} />
                <Route path="/apps" element={<CategoryPage type="App" />} />
                <Route path="requests" element={<FeatureRequests />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/sound" element={<NexoriaSound />} />
                <Route path="/sound/queue" element={<SoundQueue />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="categories" element={<AllCategories />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="post/:slug" element={<SinglePost />} />
                <Route path="download/:slug" element={<DownloadFlow />} />
                <Route path="premium" element={<Premium />} />
                
                {/* User Dashboard Routes */}
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="activity" element={<UserActivity />} />
              </Route>
            </Route>

          {/* MovieBox Public Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="moviebox" element={<MovieBoxLayout />}>
              <Route index element={<Navigate to="games" replace />} />
              <Route path="movie/:slug" element={<MovieDetail />} />
              <Route path="category/:slug" element={<MovieCategory />} />
              <Route path="search" element={<MovieSearch />} />
              
              {/* Dynamic type browsing */}
              <Route path="tv-shows" element={<MovieBrowse type="tv-shows" />} />
              <Route path="movies" element={<MovieBrowse type="movies" />} />
              <Route path="animation" element={<MovieBrowse type="animation" />} />
              <Route path="most-watched" element={<MovieBrowse type="most-watched" />} />
              <Route path="games" element={<Games />} />
              <Route path="app" element={<ComingSoonPage title="Nexoria Play App" description="Experience the ultimate streaming on your mobile device. Download our official app for seamless entertainment." emoji="📱" />} />
              <Route path="tv-apk" element={<ComingSoonPage title="Nexoria Play TV" description="Bring the cinema to your living room. Install our optimized TV APK for Android TV and Firestick." emoji="📺" />} />
              <Route path="fm-download" element={<Navigate to="/sound" replace />} />
            </Route>
          </Route>
          
          <Route path="nexoria-arena" element={<NexoriaArena />} />
          <Route path="/aura" element={<AuraLeaderboard />} />
          <Route path="/aura/battle" element={<AuraBattle />} />




          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/create" element={<CreatePost />} />
            <Route path="posts/edit/:id" element={<CreatePost />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="ratings" element={<AdminRatings />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="downloads" element={<AdminDownloads />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="contact" element={<SupportCenter />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="adblock-analytics" element={<AdminAdblockAnalytics />} />
            <Route path="activity-logs" element={<AdminActivityLogs />} />
            <Route path="login-activity" element={<AdminLoginActivityLogs />} />
            <Route path="premium-requests" element={<AdminPremiumRequests />} />
            <Route path="live-monitor" element={<AdminLiveMonitor />} />
          </Route>

            {/* Super Admin Protected Routes */}
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="roles" element={<RolesPermissions />} />
            <Route path="settings" element={<SiteSettings />} />
            {/* Sponsored Content — safe alias, legacy /ads also kept */}
            <Route path="ads" element={<SponsoredContent />} />
            <Route path="sponsored-content" element={<SponsoredContent />} />
            <Route path="database" element={<DatabaseManagement />} />
            <Route path="analytics" element={<SuperAnalytics />} />
            <Route path="security-logs" element={<SecurityLogs />} />
            <Route path="manage-plans" element={<ManagePlans />} />
            <Route path="premium-users" element={<ManagePremiumUsers />} />
            <Route path="apps" element={<AdminPosts />} />
            <Route path="apps/create" element={<CreatePost />} />
            <Route path="apps/edit/:id" element={<CreatePost />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="premium-requests" element={<SuperPremiumRequests />} />
            <Route path="purchase-requests" element={<SuperPurchaseRequests />} />
            <Route path="movie-settings" element={<MovieSettings />} />
            <Route path="footer-management" element={<FooterManagement />} />
            <Route path="support-center" element={<SupportCenter />} />
            {/* Hero Displays — safe alias, legacy /banners also kept */}
            <Route path="banners" element={<HeroDisplayManager />} />
            <Route path="hero-displays" element={<HeroDisplayManager />} />
            {/* System Notices — safe alias, legacy /announcements also kept */}
            <Route path="announcements" element={<SystemNoticesManager />} />
            <Route path="system-notices" element={<SystemNoticesManager />} />
            <Route path="seo" element={<SEOManager />} />
            <Route path="coupons" element={<CouponManager />} />
            <Route path="reviews" element={<ReviewModeration />} />
            <Route path="app-requests" element={<AppRequestModeration />} />
            <Route path="user-requests" element={<UserRequestsAdmin />} />
            <Route path="push-campaigns" element={<PushCampaigns />} />
            <Route path="trash-bin" element={<TrashBin />} />
            <Route path="aura-recalc" element={<AuraRecalculate />} />
            
            {/* Nexoria Sound Admin */}
            <Route path="sound/dashboard" element={<SoundDashboard />} />
            <Route path="sound/songs" element={<SoundSongs />} />
            <Route path="sound/add-song" element={<SoundAddSong />} />
            <Route path="sound/playlists" element={<SoundPlaylists />} />
            <Route path="sound/categories" element={<SoundCategories />} />
            
            {/* MovieBox SuperAdmin Routes */}
            <Route path="movies/analytics" element={<AdminMovieAnalytics />} />
            <Route path="movie-categories" element={<AdminMovieCategoryManager />} />
            
            {/* Movies Admin Routes */}
            <Route path="movies" element={<AdminMovieManagement type="Movie" />} />
            <Route path="movies/add" element={<AdminAddMovie type="Movie" />} />
            <Route path="movies/reviews" element={<AdminMovieReviews type="Movie" />} />
            <Route path="movies/ratings" element={<AdminMovieRatings type="Movie" />} />
            <Route path="movies/reports" element={<AdminMovieReports type="Movie" />} />
            <Route path="movies/watch-history" element={<AdminMovieWatchHistory />} />
            <Route path="movies/approval-queue" element={<AdminMovieApprovalQueue type="Movie" />} />
            
            {/* TV Shows Admin Routes */}
            <Route path="tv-shows" element={<AdminMovieManagement type="Web Series" />} />
            <Route path="tv-shows/add" element={<AdminAddMovie type="Web Series" />} />
            <Route path="tv-shows/seasons" element={<AdminMovieSeriesManager type="Web Series" />} />
            <Route path="tv-shows/episodes" element={<AdminMovieSeriesManager type="Web Series" />} />
            <Route path="tv-shows/reviews" element={<AdminMovieReviews type="Web Series" />} />
            <Route path="tv-shows/ratings" element={<AdminMovieRatings type="Web Series" />} />
            <Route path="tv-shows/reports" element={<AdminMovieReports type="Web Series" />} />
            <Route path="tv-shows/approval-queue" element={<AdminMovieApprovalQueue type="Web Series" />} />
            
            {/* Animation Admin Routes */}
            <Route path="animation" element={<AdminMovieManagement type="Animation" />} />
            <Route path="animation/add" element={<AdminAddMovie type="Animation" />} />
            <Route path="animation/seasons" element={<AdminMovieSeriesManager type="Animation" />} />
            <Route path="animation/episodes" element={<AdminMovieSeriesManager type="Animation" />} />
            <Route path="animation/reviews" element={<AdminMovieReviews type="Animation" />} />
            <Route path="animation/ratings" element={<AdminMovieRatings type="Animation" />} />
            <Route path="animation/reports" element={<AdminMovieReports type="Animation" />} />
            <Route path="animation/approval-queue" element={<AdminMovieApprovalQueue type="Animation" />} />

            <Route path="movies/premium-requests" element={<AdminMoviePremiumRequests />} />

            {/* Games Admin Routes */}
            <Route path="games" element={<AdminGamesList />} />
            <Route path="games/add" element={<AdminAddGame />} />
            <Route path="games/edit/:id" element={<AdminEditGame />} />
          </Route>
        </Routes>
      </Suspense>
      <WhatsAppChat />
      <AdBlockDetector />
    </KidsModeGuard>
  </Router>
  );
}

export default App;
