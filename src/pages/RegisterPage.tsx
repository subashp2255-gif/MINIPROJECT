import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import { User, Phone, ArrowRight, CheckSquare, Square, RefreshCw } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerUser, language, setLanguage, showToast } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [role, setRole] = useState<UserRole>('farmer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [village, setVillage] = useState('Oddanchatram');
  const [district, setDistrict] = useState('Dindigul');
  const state = 'Tamil Nadu';
  const [prefLang, setPrefLang] = useState<'en' | 'ta'>('en');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setErrorMsg(isTa ? 'தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg(isTa ? 'சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!village.trim() || !district.trim()) {
      setErrorMsg(isTa ? 'கிராமம் மற்றும் மாவட்டத்தை உள்ளிடவும்.' : 'Please specify your village and district.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg(isTa ? 'சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கவும்.' : 'Please accept the terms and privacy policy.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const fullLocation = `${village.trim()}, ${district.trim()}, ${state}`;

    setTimeout(() => {
      registerUser(name.trim(), phone.trim(), role, fullLocation);
      setLanguage(prefLang);
      localStorage.setItem('srs_onboarded', 'true');
      localStorage.setItem('srs_user_phone', phone.trim());
      setIsSubmitting(false);

      showToast(isTa ? 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Account registered successfully!', 'success');

      if (role === 'farmer') {
        navigate('/farmer/home');
      } else if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-[#F4FBF3] flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE4DC] shadow-lg space-y-6">
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#0F3D2E]/10 p-1 flex items-center justify-center shadow-xs">
              <img src="/agrisync-icon.png" alt="AgriSync" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#134E35]">AgriSync</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
            {isTa ? 'புதிய கணக்கை உருவாக்கவும்' : 'Create Farmer / Owner Account'}
          </h1>
          <p className="text-xs text-[#5B6660]">
            {isTa ? 'உரிய பாத்திரத்தைத் தேர்ந்தெடுத்து உங்கள் விவரங்களை உள்ளிடவும்' : 'Join the rural agro-storage grid in Tamil Nadu'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#404941]">
            {isTa ? 'உங்கள் பங்கு (Role)' : 'Select Your Role'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                role === 'farmer'
                  ? 'bg-[#E7F5EE] border-[#14532D] text-[#14532D]'
                  : 'bg-[#F7F4EC] border-[#DFE4DC] text-[#5B6660] hover:bg-white'
              }`}
            >
              <div className="font-bold text-xs">{isTa ? 'விவசாயி' : 'Farmer'}</div>
              <div className="text-[10px] text-[#5B6660]">
                {isTa ? 'குளிர்சாதனம் & தானிய இருப்பு' : 'Book Storage & Dry Inventory'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                role === 'owner'
                  ? 'bg-[#E7F5EE] border-[#14532D] text-[#14532D]'
                  : 'bg-[#F7F4EC] border-[#DFE4DC] text-[#5B6660] hover:bg-white'
              }`}
            >
              <div className="font-bold text-xs">{isTa ? 'கிடங்கு உரிமையாளர்' : 'Storage Owner'}</div>
              <div className="text-[10px] text-[#5B6660]">
                {isTa ? 'இருப்பு & அறை மேலாண்மை' : 'Manage Chambers & Batches'}
              </div>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'முழுப் பெயர்' : 'Full Name'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTa ? 'எ.கா. முருகன் செல்வராஜ்' : 'e.g. Murugan Selvaraj'}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          {/* Verified Phone */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'மொபைல் எண்' : 'Mobile Phone Number'}
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98421 77301"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          {/* Location: Village & District */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">
                {isTa ? 'கிராமம் / ஊர்' : 'Village / Town'}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Oddanchatram"
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#404941]">
                {isTa ? 'மாவட்டம்' : 'District'}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Dindigul"
                className="w-full h-11 px-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'விருப்பமான மொழி' : 'Preferred Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPrefLang('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  prefLang === 'en'
                    ? 'bg-[#14532D] text-white border-[#14532D]'
                    : 'bg-[#F7F4EC] text-[#5B6660] border-[#DFE4DC]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPrefLang('ta')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  prefLang === 'ta'
                    ? 'bg-[#14532D] text-white border-[#14532D]'
                    : 'bg-[#F7F4EC] text-[#5B6660] border-[#DFE4DC]'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div
            onClick={() => setAgreedTerms(!agreedTerms)}
            className="flex items-start gap-2 pt-1 cursor-pointer select-none"
          >
            <div className="mt-0.5 text-[#14532D]">
              {agreedTerms ? <CheckSquare size={16} /> : <Square size={16} />}
            </div>
            <span className="text-[11px] text-[#5B6660] leading-tight">
              {isTa
                ? 'வேளாண் சேமிப்பக சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை நான் ஒப்புக்கொள்கிறேன்.'
                : 'I consent to the Agricultural Storage Terms of Service & Privacy Policy.'}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isTa ? 'கணக்கை உருவாக்கு' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#5B6660]">
          {isTa ? 'ஏற்கனவே கணக்கு உள்ளதா? ' : 'Already registered? '}
          <Link to="/login" className="font-bold text-[#14532D] hover:underline">
            {isTa ? 'இங்கே உள்நுழையவும்' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
};
