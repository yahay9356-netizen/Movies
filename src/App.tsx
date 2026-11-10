import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Phone,
  Home,
  Search,
  Compass,
  UserCircle,
  Star,
  Heart,
  Clock,
  Bookmark,
  Play,
  ChevronLeft,
  Popcorn,
  LogOut,
  List,
  Folder,
  X,
} from 'lucide-react';
import { MOVIES, AVATARS, Movie } from './data/movies';
import {
  fetchYtsMovies,
  fetchYtsMovieDetails,
  fetchYtsSimilarMovies,
} from './services/ytsApi';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signOutUser } from './firebase';

type Screen =
  | 'onboarding'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'home'
  | 'search'
  | 'browse'
  | 'profile'
  | 'update-profile'
  | 'movie-details';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle?: string;
  primaryButton: string;
  showBack: boolean;
  cardLayout: 'overlay' | 'sheet';
  imageUrl: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: 'Find Your Next Favorite Movie Here',
    subtitle: 'Get access to a huge library of movies to suit all tastes. You will surely like it.',
    primaryButton: 'Explore Now',
    showBack: false,
    cardLayout: 'overlay',
    imageUrl: '/assets/aistudio/Movies_Posters_fe5a6ad6.png',
  },
  {
    id: 1,
    title: 'Discover Movies',
    subtitle: 'Explore a vast collection of movies in all qualities and genres. Find your next favorite film with ease.',
    primaryButton: 'Next',
    showBack: false,
    cardLayout: 'sheet',
    imageUrl: '/assets/aistudio/xl_848228_477d9240_1_b47da6a5.png',
  },
  {
    id: 2,
    title: 'Explore All Genres',
    subtitle: 'Discover movies from every genre, in all available qualities. Find something new and exciting to watch every day.',
    primaryButton: 'Next',
    showBack: true,
    cardLayout: 'sheet',
    imageUrl: '/assets/aistudio/The_Godfather_1_c5e41e7f.png',
  },
  {
    id: 3,
    title: 'Create Watchlists',
    subtitle: 'Save movies to your watchlist to keep track of what you want to watch next. Enjoy films in various qualities and genres.',
    primaryButton: 'Next',
    showBack: true,
    cardLayout: 'sheet',
    imageUrl: '/assets/aistudio/xl_bad-boys-ride-or-die-movie-poster_591dcde0_1_5a4ee2e6.png',
  },
  {
    id: 4,
    title: 'Rate, Review, and Learn',
    subtitle: "Share your thoughts on the movies you've watched. Dive deep into film details and help others discover great movies with your reviews.",
    primaryButton: 'Next',
    showBack: true,
    cardLayout: 'sheet',
    imageUrl: '/assets/aistudio/xl_9419884_887ed6c7_1_973ef26d.png',
  },
  {
    id: 5,
    title: 'Start Watching Now',
    primaryButton: 'Finish',
    showBack: true,
    cardLayout: 'sheet',
    imageUrl: '/assets/aistudio/1917_-_Sam_Mendes_-_Hollywood_War_Film_Classic_English_Movie_Poster_9ef86295-4756-4c71-bb4e-20745c5fbc1a_1_6e58b4d9.png',
  },
];

const LOGO_URL = '/assets/aistudio/325f2e24bac68df23f7c61f7b92e3b9a0a265676_2d185dba.png';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [stepIndex, setStepIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie>(MOVIES[1]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('Action');
  const [profileTab, setProfileTab] = useState<'watchlist' | 'history'>('watchlist');
  const [movies, setMovies] = useState<Movie[]>(MOVIES);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>(MOVIES.slice(0, 4));
  const [userName, setUserName] = useState('John Safwat');
  const [userPhone, setUserPhone] = useState('01200000000');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUid(user.uid);
        try {
          const ref = doc(db, 'users', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data.name) setUserName(data.name);
            if (data.phone) setUserPhone(data.phone);
            if (typeof data.avatarIndex === 'number') setSelectedAvatar(data.avatarIndex);
            if (Array.isArray(data.watchlist)) setWatchlist(data.watchlist);
            if (Array.isArray(data.history)) setHistory(data.history);
          } else {
            const initialName = user.displayName || 'John Safwat';
            setUserName(initialName);
            await setDoc(ref, {
              uid: user.uid,
              name: initialName,
              phone: userPhone,
              avatarIndex: selectedAvatar,
              watchlist: [],
              history: [],
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error('Firestore profile sync error:', err);
        }
      } else {
        setAuthUid(null);
      }
    });
    return () => unsub();
  }, []);

  const syncProfileToFirestore = async (overrides?: {
    name?: string;
    phone?: string;
    avatarIndex?: number;
    watchlist?: string[];
    history?: string[];
  }) => {
    if (!authUid) return;
    try {
      await setDoc(
        doc(db, 'users', authUid),
        {
          uid: authUid,
          name: overrides?.name ?? userName,
          phone: overrides?.phone ?? userPhone,
          avatarIndex: overrides?.avatarIndex ?? selectedAvatar,
          watchlist: overrides?.watchlist ?? watchlist,
          history: overrides?.history ?? history,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Firestore save error:', err);
    }
  };

  useEffect(() => {
    fetchYtsMovies({ limit: 20 })
      .then((data) => {
        if (data.length > 0) setMovies(data);
      })
      .catch(() => {});
  }, []);

  const currentStep = ONBOARDING_STEPS[stepIndex];

  const openMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setSimilarMovies(movies.filter((m) => m.id !== movie.id).slice(0, 4));
    setScreen('movie-details');

    if (/^\d+$/.test(movie.id)) {
      fetchYtsMovieDetails(movie.id)
        .then((details) => {
          if (details) setSelectedMovie(details);
        })
        .catch(() => {});
      fetchYtsSimilarMovies(movie.id)
        .then((sim) => {
          if (sim.length > 0) setSimilarMovies(sim.slice(0, 4));
        })
        .catch(() => {});
    }
  };

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredMovies = MOVIES.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    if (q === 'marvel') {
      return ['black-widow', 'captain-america', 'iron-man-3', 'civil-war', 'avengers', 'doctor-strange', 'endgame'].includes(m.id);
    }
    return (
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-0 sm:p-6 font-sans text-white">
      {/* Mobile Device Frame */}
      <div className="relative w-full h-screen sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:border-[6px] sm:border-[#242424] bg-[#121312] overflow-hidden shadow-2xl flex flex-col">
        {/* ONBOARDING */}
        {screen === 'onboarding' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex-1 flex flex-col justify-end overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#121312]">
                <img
                  src={currentStep.imageUrl}
                  alt={currentStep.title}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121312] via-[#121312]/30 to-transparent" />
              </div>

              {currentStep.cardLayout === 'overlay' ? (
                <div className="relative z-10 px-5 pb-8 pt-12 text-center bg-gradient-to-t from-[#121312] via-[#121312]/90 to-transparent">
                  <h1 className="text-[28px] leading-tight font-bold text-white mb-3">
                    {currentStep.title}
                  </h1>
                  {currentStep.subtitle && (
                    <p className="text-sm leading-relaxed text-white/70 mb-6 px-2">
                      {currentStep.subtitle}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStepIndex((p) => p + 1)}
                    className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-base cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
                  >
                    {currentStep.primaryButton}
                  </button>
                </div>
              ) : (
                <div className="relative z-10 bg-[#121312] rounded-t-[28px] px-5 pt-7 pb-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
                  <h1 className="text-2xl font-bold text-white mb-3">
                    {currentStep.title}
                  </h1>
                  {currentStep.subtitle && (
                    <p className="text-sm leading-relaxed text-white/70 mb-6">
                      {currentStep.subtitle}
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (stepIndex < ONBOARDING_STEPS.length - 1) {
                          setStepIndex((p) => p + 1);
                        } else {
                          setScreen('login');
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-base cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
                    >
                      {currentStep.primaryButton}
                    </button>
                    {currentStep.showBack && (
                      <button
                        type="button"
                        onClick={() => setStepIndex((p) => Math.max(0, p - 1))}
                        className="w-full py-3.5 rounded-xl border border-[#F6BD00] text-[#F6BD00] font-semibold text-base cursor-pointer hover:bg-[#F6BD00]/10 active:scale-[0.99] transition"
                      >
                        Back
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* LOGIN */}
        {screen === 'login' && (
          <div className="flex-1 flex flex-col px-5 pt-14 pb-8 overflow-y-auto">
            <div className="flex justify-center mb-10">
              <img src={LOGO_URL} alt="Movies Logo" className="w-[100px] h-[98px] object-contain" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3.5">
                <Mail className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3.5">
                <Lock className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-white/80 cursor-pointer"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-3 mb-6">
              <button
                type="button"
                onClick={() => setScreen('forgot-password')}
                className="text-xs text-[#F6BD00] font-medium cursor-pointer hover:underline"
              >
                Forget Password ?
              </button>
            </div>

            <button
              type="button"
              onClick={() => setScreen('home')}
              className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-base cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
            >
              Login
            </button>

            <p className="text-center text-xs text-white/80 mt-5">
              Don&apos;t Have Account ?{' '}
              <button
                type="button"
                onClick={() => setScreen('register')}
                className="text-[#F6BD00] font-semibold cursor-pointer hover:underline"
              >
                Create One
              </button>
            </p>

            <div className="flex items-center gap-3 my-6 px-6">
              <div className="h-[1px] flex-1 bg-[#F6BD00]/60" />
              <span className="text-xs text-[#F6BD00] font-medium">OR</span>
              <div className="h-[1px] flex-1 bg-[#F6BD00]/60" />
            </div>

            {authError && (
              <p className="text-xs text-red-400 text-center mb-3">{authError}</p>
            )}

            <button
              type="button"
              onClick={async () => {
                setAuthError(null);
                try {
                  await signInWithGoogle();
                  setScreen('home');
                } catch (err) {
                  setAuthError(
                    err instanceof Error ? err.message : 'Google sign-in failed'
                  );
                }
              }}
              className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-sm flex items-center justify-center gap-2.5 cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
            >
              <span className="font-black text-base">G</span>
              Login With Google
            </button>

            <div className="mt-auto pt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 p-1 rounded-full border border-[#F6BD00]/70 bg-[#1C1D1C]">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition ${
                    lang === 'en' ? 'bg-[#F6BD00] text-[#121312]' : 'text-white/70'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ar')}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition ${
                    lang === 'ar' ? 'bg-[#F6BD00] text-[#121312]' : 'text-white/70'
                  }`}
                >
                  AR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {screen === 'register' && (
          <div className="flex-1 flex flex-col px-5 pt-6 pb-6 overflow-y-auto">
            <div className="relative flex items-center justify-center mb-5">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="absolute left-0 text-[#F6BD00] p-1 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-[#F6BD00]">Register</h2>
            </div>

            {/* Avatar Selector */}
            <div className="flex flex-col items-center mb-5">
              <div className="flex items-center justify-center gap-4">
                {[
                  (selectedAvatar - 1 + AVATARS.length) % AVATARS.length,
                  selectedAvatar,
                  (selectedAvatar + 1) % AVATARS.length,
                ].map((idx, pos) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(idx)}
                    className={`rounded-full overflow-hidden cursor-pointer transition-all ${
                      pos === 1
                        ? 'w-24 h-24 ring-2 ring-[#F6BD00]'
                        : 'w-14 h-14 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={AVATARS[idx]} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <span className="text-xs text-white/80 mt-2">Avatar</span>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3">
                <User className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="text"
                  placeholder="Name"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3">
                <Mail className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3">
                <Lock className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-white/80 cursor-pointer"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3">
                <Lock className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="text-white/80 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3">
                <Phone className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScreen('home')}
              className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-base mt-5 cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
            >
              Create Account
            </button>

            <p className="text-center text-xs text-white/80 mt-4">
              Already Have Account ?{' '}
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-[#F6BD00] font-semibold cursor-pointer hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {screen === 'forgot-password' && (
          <div className="flex-1 flex flex-col px-5 pt-6 pb-8">
            <div className="relative flex items-center justify-center mb-10">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="absolute left-0 text-[#F6BD00] p-1 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-[#F6BD00]">Forget Password</h2>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
              <div className="w-48 h-48 rounded-full bg-[#F6BD00]/15 border border-[#F6BD00]/30 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F6BD00] flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-[#121312]" />
                </div>
                <span className="text-xs text-white/70">Reset your password</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3.5 mt-4 mb-5">
              <Mail className="w-5 h-5 text-white/80 shrink-0" />
              <input
                type="email"
                placeholder="Email"
                className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setScreen('login')}
              className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-base cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
            >
              Verify Email
            </button>
          </div>
        )}

        {/* HOME */}
        {screen === 'home' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-20">
              {/* Hero Carousel */}
              <div className="relative pt-8 pb-4 px-4">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                  style={{ backgroundImage: `url(${MOVIES[featuredIndex].poster})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#121312]/40 via-transparent to-[#121312]" />

                <h2
                  className="relative z-10 text-center text-3xl text-white mb-4"
                  style={{ fontFamily: "'Kaushan Script', cursive" }}
                >
                  Available Now
                </h2>

                <div className="relative z-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFeaturedIndex((p) => (p - 1 + MOVIES.length) % MOVIES.length)
                    }
                    className="w-20 h-44 rounded-2xl overflow-hidden opacity-75 cursor-pointer shrink-0 -ml-6"
                  >
                    <img
                      src={MOVIES[(featuredIndex - 1 + MOVIES.length) % MOVIES.length].poster}
                      alt="Prev"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => openMovie(MOVIES[featuredIndex])}
                    className="relative w-52 h-[300px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 cursor-pointer shrink-0"
                  >
                    <img
                      src={MOVIES[featuredIndex].poster}
                      alt={MOVIES[featuredIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#121312]/80 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs font-semibold">
                      <span>{MOVIES[featuredIndex].rating}</span>
                      <Star className="w-3 h-3 fill-[#F6BD00] text-[#F6BD00]" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeaturedIndex((p) => (p + 1) % MOVIES.length)}
                    className="relative w-20 h-44 rounded-2xl overflow-hidden opacity-75 cursor-pointer shrink-0 -mr-6"
                  >
                    <img
                      src={MOVIES[(featuredIndex + 1) % MOVIES.length].poster}
                      alt="Next"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#121312]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold">
                      <span>{MOVIES[(featuredIndex + 1) % MOVIES.length].rating}</span>
                      <Star className="w-2.5 h-2.5 fill-[#F6BD00] text-[#F6BD00]" />
                    </div>
                  </button>
                </div>

                <h3
                  className="relative z-10 text-center text-4xl text-white mt-4"
                  style={{ fontFamily: "'Kaushan Script', cursive" }}
                >
                  Watch Now
                </h3>
              </div>

              {/* Action Row */}
              <div className="px-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-white">Action</h4>
                  <button
                    type="button"
                    onClick={() => setScreen('search')}
                    className="text-xs text-[#F6BD00] font-medium cursor-pointer hover:underline"
                  >
                    See More →
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {MOVIES.slice(2, 8).map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => openMovie(movie)}
                      className="relative w-32 h-48 rounded-2xl overflow-hidden shrink-0 cursor-pointer group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 left-2 bg-[#121312]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[11px] font-semibold">
                        <span>{movie.rating}</span>
                        <Star className="w-3 h-3 fill-[#F6BD00] text-[#F6BD00]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav active="home" onNavigate={setScreen} />
          </div>
        )}

        {/* SEARCH */}
        {screen === 'search' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-6 pb-3">
              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="bg-transparent w-full text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20">
              {searchQuery.trim() === '' ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                  <div className="w-20 h-20 rounded-2xl bg-[#F6BD00]/15 flex items-center justify-center mb-3">
                    <Popcorn className="w-10 h-10 text-[#F6BD00]" />
                  </div>
                  <p className="text-sm text-white/60">Search for your favorite movies</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {filteredMovies.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => openMovie(movie)}
                      className="relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 left-2 bg-[#121312]/80 px-2 py-0.5 rounded-md flex items-center gap-1 text-xs font-semibold">
                        <span>{movie.rating}</span>
                        <Star className="w-3 h-3 fill-[#F6BD00] text-[#F6BD00]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <BottomNav active="search" onNavigate={setScreen} />
          </div>
        )}

        {/* MOVIE DETAILS */}
        {screen === 'movie-details' && (
          <div className="flex-1 overflow-y-auto pb-8 bg-[#121312]">
            <div className="relative h-[420px]">
              <img
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121312] via-[#121312]/30 to-[#121312]/50" />

              {/* Top Bar */}
              <div className="absolute top-5 left-4 right-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="w-9 h-9 rounded-full bg-[#121312]/60 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWatchlist(selectedMovie.id)}
                  className="w-9 h-9 rounded-full bg-[#121312]/60 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      watchlist.includes(selectedMovie.id)
                        ? 'fill-[#F6BD00] text-[#F6BD00]'
                        : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#F6BD00] border-4 border-white/80 flex items-center justify-center shadow-xl">
                  <Play className="w-7 h-7 fill-white text-white ml-0.5" />
                </div>
              </div>

              {/* Title & Year */}
              <div className="absolute bottom-3 left-4 right-4 text-center">
                <h1 className="text-xl font-bold text-white leading-snug">
                  {selectedMovie.title}
                </h1>
                <p className="text-sm text-white/60 mt-1">{selectedMovie.year}</p>
              </div>
            </div>

            <div className="px-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  setHistory((prev) => [
                    selectedMovie.id,
                    ...prev.filter((id) => id !== selectedMovie.id),
                  ]);
                  setShowPlayer(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#E82626] text-white font-bold text-base cursor-pointer hover:brightness-110 active:scale-[0.99] transition"
              >
                Watch
              </button>

              {showPlayer && (
                <div
                  onClick={() => setShowPlayer(false)}
                  className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[360px] bg-[#1C1D1C] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <span className="text-sm font-bold text-white truncate pr-2">
                        {selectedMovie.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPlayer(false)}
                        className="text-white/70 hover:text-white cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          selectedMovie.trailerCode || 'aWzlQ2N6qqg'
                        }?autoplay=1`}
                        title={selectedMovie.title}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-[#282A28] rounded-xl py-2.5 flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 fill-[#F6BD00] text-[#F6BD00]" />
                  <span className="text-sm font-bold">{selectedMovie.likes}</span>
                </div>
                <div className="bg-[#282A28] rounded-xl py-2.5 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-[#F6BD00]" />
                  <span className="text-sm font-bold">{selectedMovie.duration}</span>
                </div>
                <div className="bg-[#282A28] rounded-xl py-2.5 flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 fill-[#F6BD00] text-[#F6BD00]" />
                  <span className="text-sm font-bold">{selectedMovie.rating}</span>
                </div>
              </div>

              {/* Screen Shots */}
              <h3 className="text-base font-bold text-white mt-6 mb-3">Screen Shots</h3>
              <div className="flex flex-col gap-3">
                {selectedMovie.screenshots.map((shot, i) => (
                  <div key={i} className="w-full h-36 rounded-xl overflow-hidden">
                    <img src={shot} alt="Screenshot" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Similar */}
              <h3 className="text-base font-bold text-white mt-6 mb-3">Similar</h3>
              <div className="grid grid-cols-2 gap-3">
                {similarMovies.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => openMovie(movie)}
                      className="relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 left-2 bg-[#121312]/80 px-2 py-0.5 rounded-md flex items-center gap-1 text-xs font-semibold">
                        <span>{movie.rating}</span>
                        <Star className="w-3 h-3 fill-[#F6BD00] text-[#F6BD00]" />
                      </div>
                    </button>
                  ))}
              </div>

              {/* Summary */}
              <h3 className="text-base font-bold text-white mt-6 mb-2">Summary</h3>
              <p className="text-xs leading-relaxed text-white/75">
                {selectedMovie.summary ||
                  `Experience ${selectedMovie.title} (${selectedMovie.year}), a thrilling ${selectedMovie.genres.join(', ')} feature.`}
              </p>

              {/* Cast */}
              <h3 className="text-base font-bold text-white mt-6 mb-3">Cast</h3>
              <div className="flex flex-col gap-2.5">
                {(
                  selectedMovie.cast || [
                    { name: 'Hayley Atwell', character: 'Captain Carter', avatar: AVATARS[2] },
                    { name: 'Elizabeth Olsen', character: 'Wanda Maximoff', avatar: AVATARS[4] },
                    { name: 'Rachel McAdams', character: 'Dr. Christine Palmer', avatar: AVATARS[6] },
                    { name: 'Charlize Theron', character: 'Clea', avatar: AVATARS[7] },
                  ]
                ).map((actor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-[#282A28] rounded-xl p-2.5"
                  >
                    <img
                      src={actor.avatar}
                      alt={actor.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-white">Name : {actor.name}</p>
                      <p className="text-white/70 mt-0.5">Character : {actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Genres */}
              <h3 className="text-base font-bold text-white mt-6 mb-3">Genres</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {selectedMovie.genres.map((genre) => (
                  <div
                    key={genre}
                    className="bg-[#282A28] rounded-xl py-2 text-center text-xs font-medium text-white/90"
                  >
                    {genre}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* BROWSE */}
        {screen === 'browse' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-6 pb-3">
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {['Action', 'Adventure', 'Animation', 'Sci-Fi', 'Fantasy', 'Drama'].map(
                  (genre) => {
                    const isActive = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-bold shrink-0 cursor-pointer transition ${
                          isActive
                            ? 'bg-[#F6BD00] text-[#121312]'
                            : 'border border-[#F6BD00] text-[#F6BD00] bg-transparent hover:bg-[#F6BD00]/10'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20">
              <div className="grid grid-cols-2 gap-3 pt-1">
                {MOVIES.filter((m) =>
                  selectedGenre === 'Action' ? true : m.genres.includes(selectedGenre)
                ).map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => openMovie(movie)}
                    className="relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute top-2 left-2 bg-[#121312]/80 px-2 py-0.5 rounded-md flex items-center gap-1 text-xs font-semibold">
                      <span>{movie.rating}</span>
                      <Star className="w-3 h-3 fill-[#F6BD00] text-[#F6BD00]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <BottomNav active="browse" onNavigate={setScreen} />
          </div>
        )}

        {/* PROFILE */}
        {screen === 'profile' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-[#212121] px-5 pt-8 pb-4">
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col items-center">
                  <img
                    src={AVATARS[selectedAvatar]}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full object-cover mb-2"
                  />
                  <span className="text-sm font-bold text-white">{userName}</span>
                </div>

                <div className="flex items-center gap-8 pr-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{watchlist.length}</div>
                    <div className="text-xs text-white/80 mt-0.5">Wish List</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{history.length}</div>
                    <div className="text-xs text-white/80 mt-0.5">History</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('update-profile')}
                  className="flex-1 py-2.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-sm cursor-pointer hover:brightness-105 transition"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    setScreen('login');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#E82626] text-white font-semibold text-sm flex items-center gap-1.5 cursor-pointer hover:brightness-110 transition"
                >
                  <span>Exit</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 bg-[#212121] border-b border-white/10">
              <button
                type="button"
                onClick={() => setProfileTab('watchlist')}
                className={`py-3 flex flex-col items-center gap-1 text-xs font-medium cursor-pointer border-b-2 transition ${
                  profileTab === 'watchlist'
                    ? 'border-[#F6BD00] text-white'
                    : 'border-transparent text-white/60'
                }`}
              >
                <List className="w-5 h-5 text-[#F6BD00]" />
                <span>Watch List</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileTab('history')}
                className={`py-3 flex flex-col items-center gap-1 text-xs font-medium cursor-pointer border-b-2 transition ${
                  profileTab === 'history'
                    ? 'border-[#F6BD00] text-white'
                    : 'border-transparent text-white/60'
                }`}
              >
                <Folder className="w-5 h-5 text-[#F6BD00]" />
                <span>History</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-20">
              {(() => {
                const ids = profileTab === 'watchlist' ? watchlist : history;
                const items = MOVIES.filter((m) => ids.includes(m.id));
                if (items.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center opacity-80">
                      <div className="w-20 h-20 rounded-2xl bg-[#F6BD00]/15 flex items-center justify-center mb-3">
                        <Popcorn className="w-10 h-10 text-[#F6BD00]" />
                      </div>
                      <p className="text-sm text-white/60">
                        {profileTab === 'watchlist'
                          ? 'Your Watch List is empty'
                          : 'No watch history yet'}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-3 gap-2.5 pt-4">
                    {items.map((movie) => (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() => openMovie(movie)}
                        className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-[#121312]/80 px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[10px] font-semibold">
                          <span>{movie.rating}</span>
                          <Star className="w-2.5 h-2.5 fill-[#F6BD00] text-[#F6BD00]" />
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            <BottomNav active="profile" onNavigate={setScreen} />
          </div>
        )}

        {/* UPDATE PROFILE */}
        {screen === 'update-profile' && (
          <div className="relative flex-1 flex flex-col px-5 pt-6 pb-8 bg-[#121312]">
            <div className="relative flex items-center justify-center mb-8">
              <button
                type="button"
                onClick={() => setScreen('profile')}
                className="absolute left-0 text-[#F6BD00] p-1 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-[#F6BD00]">Pick Avatar</h2>
            </div>

            <div className="flex justify-center mb-8">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-[#F6BD00]/60 cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={AVATARS[selectedAvatar]}
                  alt="Selected Avatar"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3.5">
                <User className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent w-full text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#282A28] rounded-xl px-4 py-3.5">
                <Phone className="w-5 h-5 text-white/80 shrink-0" />
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="bg-transparent w-full text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScreen('forgot-password')}
              className="text-left text-sm text-white/90 mt-5 cursor-pointer hover:text-[#F6BD00]"
            >
              Reset Password
            </button>

            <div className="mt-auto flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="w-full py-3.5 rounded-xl bg-[#E82626] text-white font-semibold text-base cursor-pointer hover:brightness-110 transition"
              >
                Delete Account
              </button>
              <button
                type="button"
                onClick={async () => {
                  await syncProfileToFirestore();
                  setScreen('profile');
                }}
                className="w-full py-3.5 rounded-xl bg-[#F6BD00] text-[#121312] font-semibold text-base cursor-pointer hover:brightness-105 transition"
              >
                Update Data
              </button>
            </div>

            {/* Pick Avatar Bottom Sheet */}
            {showAvatarPicker && (
              <div
                onClick={() => setShowAvatarPicker(false)}
                className="absolute inset-0 z-20 bg-black/60 flex items-end p-4"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#282A28] rounded-3xl p-4 grid grid-cols-3 gap-3 shadow-2xl"
                >
                  {AVATARS.slice(0, 9).map((avatarUrl, idx) => (
                    <button
                      key={avatarUrl}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(idx);
                        setShowAvatarPicker(false);
                      }}
                      className={`aspect-square rounded-2xl p-1.5 border border-[#F6BD00]/70 cursor-pointer transition ${
                        selectedAvatar === idx
                          ? 'bg-[#F6BD00]/50'
                          : 'bg-transparent hover:bg-[#F6BD00]/15'
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${idx + 1}`}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BottomNav({
  active,
  onNavigate,
}: {
  active: 'home' | 'search' | 'browse' | 'profile';
  onNavigate: (s: Screen) => void;
}) {
  return (
    <div className="absolute bottom-3 left-4 right-4 h-14 bg-[#282A28] rounded-2xl px-6 flex items-center justify-between shadow-xl border border-white/5">
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className={`p-2 cursor-pointer ${active === 'home' ? 'text-[#F6BD00]' : 'text-white/70'}`}
      >
        <Home className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onNavigate('search')}
        className={`p-2 cursor-pointer ${active === 'search' ? 'text-[#F6BD00]' : 'text-white/70'}`}
      >
        <Search className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onNavigate('browse')}
        className={`p-2 cursor-pointer ${active === 'browse' ? 'text-[#F6BD00]' : 'text-white/70'}`}
      >
        <Compass className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onNavigate('profile')}
        className={`p-2 cursor-pointer ${active === 'profile' ? 'text-[#F6BD00]' : 'text-white/70'}`}
      >
        <UserCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
