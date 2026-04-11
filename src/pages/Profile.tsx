import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building2, MapPin, ArrowLeft, Save, Camera, ImagePlus, X } from 'lucide-react';
import { getAdminProfile, saveAdminProfile, type AdminProfile } from '../lib/profile.types';

interface ProfileProps {
  onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const [profile, setProfile] = useState<AdminProfile>(getAdminProfile());
  const [saved, setSaved] = useState(false);
  const [venuePhotoUrl, setVenuePhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const venuePhotosInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(getAdminProfile());
  }, []);

  const handleChange = (field: keyof AdminProfile, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        handleChange('avatarUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVenuePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((p) => ({
          ...p,
          venuePhotos: [...(p.venuePhotos || []), reader.result as string]
        }));
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVenuePhotoAddUrl = () => {
    if (venuePhotoUrl.trim()) {
      setProfile((p) => ({
        ...p,
        venuePhotos: [...(p.venuePhotos || []), venuePhotoUrl.trim()]
      }));
      setVenuePhotoUrl('');
      setSaved(false);
    }
  };

  const handleVenuePhotoRemove = (index: number) => {
    setProfile((p) => ({
      ...p,
      venuePhotos: (p.venuePhotos || []).filter((_, i) => i !== index)
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveAdminProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-wed-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Πίσω</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-wed-primary to-wed-primary-light px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Προφίλ Διαχειριστή</h1>
                <p className="text-white/90 text-sm">Διαχειριστείτε τις πληροφορίες του λογαριασμού σας</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-6">
            <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Φωτογραφία Προφίλ</label>
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={profile.avatarUrl || ''}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    placeholder="URL φωτογραφίας"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                  <p className="text-xs text-gray-500">Επιλέξτε αρχείο ή επικολλήστε URL εικόνας</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Όνομα</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Το όνομά σας"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Τηλέφωνο</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+30 210 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Όνομα Επιχείρησης</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Όνομα της επιχείρησής σας"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Διεύθυνση Επιχείρησης</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={profile.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  placeholder="Διεύθυνση γραφείου ή χώρου"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent resize-none"
                />
              </div>
            </div>
            </div>

            <div className="space-y-6 lg:border-l lg:border-gray-200 lg:pl-6">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Φωτογραφίες Χώρου</label>
              <p className="text-xs text-gray-500 mb-3">Φωτογραφίες που θα βλέπουν οι πελάτες σας (χώρος, δείγματα δουλειάς κ.λπ.)</p>
              <div className="space-y-2 mb-3">
                <button
                  type="button"
                  onClick={() => venuePhotosInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  Προσθήκη αρχείου
                </button>
                <input
                  ref={venuePhotosInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVenuePhotoAdd}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={venuePhotoUrl}
                    onChange={(e) => setVenuePhotoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleVenuePhotoAddUrl())}
                    placeholder="URL φωτογραφίας"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                  <button
                    type="button"
                    onClick={handleVenuePhotoAddUrl}
                    className="px-3 py-2 text-sm font-medium text-wed-primary bg-wed-accent-lighter rounded-lg hover:bg-wed-accent-light transition-colors shrink-0"
                  >
                    Προσθήκη
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(profile.venuePhotos || []).map((url, index) => (
                  <div key={index} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleVenuePhotoRemove(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Αφαίρεση"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ακύρωση
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-wed-primary rounded-lg hover:bg-wed-primary-light transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
