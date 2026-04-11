import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, User, ChevronDown, Inbox } from 'lucide-react';
import { getAdminProfile } from '../lib/profile.types';

interface NavbarProps {
  onNavigateToDashboard?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToEventRequests?: () => void;
  showBackToDashboard?: boolean;
  currentPage?: 'dashboard' | 'detail' | 'profile' | 'event-requests';
}

export function Navbar({
  onNavigateToDashboard,
  onNavigateToProfile,
  onNavigateToEventRequests,
  showBackToDashboard = false,
  currentPage = 'dashboard'
}: NavbarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profile = getAdminProfile();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Wed Partners
            </h1>
            <div className="flex items-center gap-2">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'text-wed-primary font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Πίνακας Ελέγχου
                </button>
              )}
              {onNavigateToEventRequests && (
                <button
                  onClick={onNavigateToEventRequests}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPage === 'event-requests'
                      ? 'text-wed-primary font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  Αιτήματα Χώρου
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-wed-accent-lighter flex items-center justify-center overflow-hidden shrink-0">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-wed-accent" />
                  )}
                </div>
                <span className="hidden sm:inline">
                  {profile.name || 'Προφίλ'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.name || 'Διαχειριστής'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.email || 'Δεν έχει οριστεί email'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToProfile?.();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Προβολή & Επεξεργασία Προφίλ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
