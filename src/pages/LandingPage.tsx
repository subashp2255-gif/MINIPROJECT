import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Snowflake,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

export const LandingPage: React.FC = () => {
  const { language, setLanguage, setRole } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  return (
    <div className="w-full min-h-screen bg-[#F7F4EC] text-[#1C2420] flex flex-col">
      {/* Top Public Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DFE4DC] px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <AppLogo size={36} showSubtitle={true} />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#5B6660]">
            <Link to="/discovery" className="hover:text-[#134E35] transition-colors">
              {isTa ? 'அறைகளைக் கண்டறிக' : 'Find Cold Storage'}
            </Link>
            <a href="#how-it-works" className="hover:text-[#134E35] transition-colors">
              {isTa ? 'செயல்படும் விதம்' : 'How It Works'}
            </a>
            <a href="#about" className="hover:text-[#134E35] transition-colors">
              {isTa ? 'எங்களை பற்றி' : 'About'}
            </a>
            <Link to="/ai-arbitrage" className="hover:text-[#134E35] transition-colors flex items-center gap-1 text-[#C8923A]">
              <Sparkles size={14} />
              <span>{isTa ? 'விலை கணிப்பு' : 'AI Arbitrage'}</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Tamil / English Toggle */}
            <div className="h-8 p-0.5 bg-[#EEF6ED] rounded-full flex items-center border border-[#DFE4DC]">
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2 h-7 rounded-full text-xs font-bold transition-all ${
                  language === 'ta' ? 'bg-[#14532D] text-white shadow-xs' : 'text-[#5B6660]'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 h-7 rounded-full text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-[#14532D] text-white shadow-xs' : 'text-[#5B6660]'
                }`}
              >
                EN
              </button>
            </div>

            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl border border-[#C0C9BF] text-xs font-bold text-[#14532D] hover:bg-white transition-all"
            >
              {isTa ? 'உள்நுழைக' : 'Login'}
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all shadow-xs"
            >
              {isTa ? 'தொடங்குக' : 'Get Started'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-16 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F5EE] border border-[#AFF2C2] text-xs font-bold text-[#14532D]">
          <Zap size={14} className="text-[#C8923A]" />
          <span>{isTa ? 'தமிழ்நாடு வேளாண் குளிர்பதன வலையமைப்பு' : 'Decentralized Solar Cold Chain Network'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F3D2E] tracking-tight max-w-3xl mx-auto leading-tight">
          {isTa
            ? 'அறுவடைக்கு உரிய விலை கிடைக்கும் வரை பாதுகாப்பான குளிர்சாதன சேமிப்பு'
            : 'AI-Powered Rural Cold Storage Booking & Real-Time Crop Inventory'}
        </h1>

        <p className="text-sm sm:text-base text-[#5B6660] max-w-2xl mx-auto leading-relaxed">
          {isTa
            ? 'மண்டி விலைச் சரிவினால் ஏற்படும் நஷ்டத்தைத் தவிர்த்து, சோலார் குளிர்பதன அறைகளை முன்பதிவு செய்யுங்கள். விவசாயிகள் மற்றும் கிடங்கு உரிமையாளர்களுக்கான முழுமையான மென்பொருள்.'
            : 'Eliminate distress selling during harvest gluts. Reserve verified solar chambers, track physical crop inventory with digital scale gate passes, and maximize Mandi profit.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setRole('farmer');
              navigate('/discovery');
            }}
            className="h-12 px-6 rounded-2xl bg-[#14532D] text-white text-sm font-bold flex items-center gap-2 hover:bg-[#0F3D2E] shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <span>{isTa ? 'குளிர்சாதன அறையைத் தேடுக' : 'Find Cold Storage'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('owner');
              navigate('/owner/dashboard');
            }}
            className="h-12 px-6 rounded-2xl bg-white border border-[#C0C9BF] text-[#14532D] text-sm font-bold flex items-center gap-2 hover:bg-[#EEF6ED] transition-all cursor-pointer shadow-xs"
          >
            <Scale size={16} className="text-[#C8923A]" />
            <span>{isTa ? 'கிடங்கு மேலாண்மை (உரிமையாளர்)' : 'Warehouse Owner Console'}</span>
          </button>
        </div>

        {/* Live APMC Price Ticker */}
        <div className="pt-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-[#DFE4DC] shadow-sm text-left">
            <div className="flex items-center justify-between text-xs font-bold text-[#5B6660] border-b border-[#EEF6ED] pb-2 mb-3">
              <span className="flex items-center gap-1.5 text-[#14532D]">
                <TrendingUp size={16} className="text-[#14532D]" />
                <span>{isTa ? 'ஒட்டன்சத்திரம் மண்டி இன்றைய விலை நிலவரம்' : 'Oddanchatram APMC Spot vs. 7-Day Storage Forecast'}</span>
              </span>
              <span className="text-[11px] text-[#C8923A]">● Live Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block font-medium">{isTa ? 'தக்காளி' : 'Tomato'}</span>
                <span className="text-base font-bold text-[#14532D]">₹24 <span className="text-[10px] text-[#5B6660]">/kg</span></span>
                <span className="text-[10px] font-bold text-[#1e5e3a] block mt-0.5">↑ ₹38 (7d proj.)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block font-medium">{isTa ? 'உருளைக்கிழங்கு' : 'Potato'}</span>
                <span className="text-base font-bold text-[#14532D]">₹28 <span className="text-[10px] text-[#5B6660]">/kg</span></span>
                <span className="text-[10px] font-bold text-[#1e5e3a] block mt-0.5">↑ ₹36 (7d proj.)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block font-medium">{isTa ? 'வெங்காயம்' : 'Onion'}</span>
                <span className="text-base font-bold text-[#14532D]">₹42 <span className="text-[10px] text-[#5B6660]">/kg</span></span>
                <span className="text-[10px] font-bold text-[#1e5e3a] block mt-0.5">↑ ₹56 (7d proj.)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4EC]">
                <span className="text-[#5B6660] block font-medium">{isTa ? 'பச்சை மிளகாய்' : 'Chillies'}</span>
                <span className="text-base font-bold text-[#14532D]">₹65 <span className="text-[10px] text-[#5B6660]">/kg</span></span>
                <span className="text-[10px] font-bold text-[#1e5e3a] block mt-0.5">↑ ₹88 (7d proj.)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Independent Modules Highlight */}
      <section className="px-4 py-10 bg-white border-y border-[#DFE4DC]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8923A]">
              {isTa ? 'இரண்டு சுதந்திரமான மேலாண்மை அமைப்புகள்' : 'Dual Independent Core Modules'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">
              {isTa ? 'விவசாய முன்பதிவு & கிடங்கு இருப்பு மேலாண்மை' : 'Engineered for Real Agricultural Logistics'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            {/* Module 1: Cold Storage Booking */}
            <div className="p-6 rounded-3xl bg-[#F4FBF3] border border-[#AFF2C2] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#14532D] text-white flex items-center justify-center">
                  <Snowflake size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#0F3D2E]">
                  1. {isTa ? 'குளிர்சாதன அறை முன்பதிவு மேலாண்மை' : 'Cold Storage Booking Management'}
                </h3>
                <p className="text-xs text-[#5B6660] leading-relaxed">
                  {isTa
                    ? 'விவசாயிகள் தங்களுக்குத் தேவையான கால அளவிற்கு அறைகளைத் தேடி, கொள்ளளவைச் சரிபார்த்து, உடனடி டிஜிட்டல் கேட் பாஸ் மற்றும் 4-இலக்க PIN உடன் இடங்களை முன்பதிவு செய்யலாம்.'
                    : 'Farmers discover solar cold storage hubs, check multi-day capacity availability, calculate transparent daily rates, and reserve chamber crates with instant digital gate passes.'}
                </p>
                <ul className="text-xs space-y-1.5 text-[#1C2420] pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#14532D]" />
                    <span>{isTa ? 'நேர வரம்பு அடிப்படையிலான இட ஒதுக்கீடு' : 'Multi-day reservation availability engine'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#14532D]" />
                    <span>{isTa ? 'QR குறியீடு மற்றும் 4 இலக்க கேட் பாஸ் PIN' : 'Automated gate pass QR & weighing PIN'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#14532D]" />
                    <span>{isTa ? 'முன்பதிவு மட்டுமே உடல் இருப்பை மாற்றாது' : 'Strict: Bookings never alter physical stock'}</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRole('farmer');
                  navigate('/discovery');
                }}
                className="w-full h-11 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isTa ? 'முன்பதிவு செய்ய' : 'Explore Facilities'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Module 2: Normal Inventory Management */}
            <div className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#E7D7BE] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#C8923A] text-white flex items-center justify-center">
                  <Scale size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#4A3319]">
                  2. {isTa ? 'சுதந்திரமான கிடங்கு இருப்பு மேலாண்மை' : 'Normal Inventory Management'}
                </h3>
                <p className="text-xs text-[#5B6660] leading-relaxed">
                  {isTa
                    ? 'முன்பதிவு இல்லாமலேயே நேரடி சரக்கு வருகை (walk-in stock), சப்ளையர் வரவு, அறை மாற்றங்கள், மீட்பு மற்றும் சேத தணிக்கை ஆகியவற்றை முழுமையாக நிர்வகிக்கலாம்.'
                    : 'Storage owners manage physical stock independently. Record walk-in farm intake without any booking ID, track chamber relocations, withdrawals, damage audits, and immutable transaction logs.'}
                </p>
                <ul className="text-xs space-y-1.5 text-[#1C2420] pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#C8923A]" />
                    <span>{isTa ? 'முன்பதிவு இன்றியே சரக்கு பதிவு சாத்தியம்' : 'Zero booking prerequisite for walk-ins'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#C8923A]" />
                    <span>{isTa ? 'அறைகளுக்கு இடையேயான இடமாற்றம்' : 'Safe inter-chamber stock transfers'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#C8923A]" />
                    <span>{isTa ? 'எதிர்மறை இருப்பு மற்றும் இழப்புத் தடுப்பு' : 'Non-negative stock & complete audit trail'}</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRole('owner');
                  navigate('/owner/inventory');
                }}
                className="w-full h-11 rounded-xl bg-[#C8923A] text-white text-xs font-bold hover:bg-[#b07d2c] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isTa ? 'சரக்கிருப்பு மேலாண்மை' : 'Open Inventory Dashboard'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="px-4 py-12 max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
            {isTa ? 'எளிய 4 படிகள்' : 'Step-by-Step Flow'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">
            {isTa ? 'அக்ரிசின்க் எவ்வாறு செயல்படுகிறது?' : 'How AgriSync Powers Farm Logistics'}
          </h2>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-5 rounded-2xl border border-[#DFE4DC] shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#E7F5EE] text-[#14532D] font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="text-sm font-bold text-[#14532D]">{isTa ? 'கண்டுபிடி' : '1. Discover'}</h4>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'அருகிலுள்ள சூரிய மின் குளிர்சாதன மையத்தைத் தேர்ந்தெடுத்து விலையை ஒப்பிடுங்கள்.' : 'Search certified cold storage hubs by village, distance, and temperature type.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE4DC] shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#E7F5EE] text-[#14532D] font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="text-sm font-bold text-[#14532D]">{isTa ? 'முன்பதிவு செய்' : '2. Reserve'}</h4>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'கால அவகாசத்தை உள்ளிட்டு, இடப்பற்றாக்குறை இல்லாத உத்தரவாதமான முன்பதிவைப் பெறுங்கள்.' : 'Select days and crates. Atomic availability engine locks capacity safely.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE4DC] shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#E7F5EE] text-[#14532D] font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="text-sm font-bold text-[#14532D]">{isTa ? 'எடை சரிபார்த்தல்' : '3. Weigh & Slot'}</h4>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'வாயிலில் டிஜிட்டல் எடை தராசில் சரிபார்த்து உண்மையான இருப்பை மட்டும் சேமிக்கலாம்.' : 'Present gate pass PIN. Intake scale weighs actual produce into chamber slots.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE4DC] shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#E7F5EE] text-[#14532D] font-bold text-xs flex items-center justify-center">4</span>
            <h4 className="text-sm font-bold text-[#14532D]">{isTa ? 'மீட்பு & விற்பனை' : '4. Mandi Arbitrage'}</h4>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'AI விலை உயர்வு கணிக்கும்போது பகுதி பகுதியாக மீட்டு அதிக லாபத்திற்கு விற்கலாம்.' : 'Liquidate batches when market wholesale rates surge for maximum net return.'}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="mt-auto bg-white border-t border-[#DFE4DC] px-4 py-8 text-center text-xs text-[#5B6660]">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 font-bold text-[#14532D] text-base">
            <AppLogo size={24} showText={false} />
            <span>AgriSync Platform</span>
          </div>
          <p>
            Tamil Nadu Agricultural Marketing Board &amp; APMC Agro Logistics Cluster Integration. Oddanchatram • Dindigul • Palani • Madurai.
          </p>
          <p className="text-[11px] text-[#8C9690]">
            © {new Date().getFullYear()} AgriSync. Non-negotiable architectural separation between bookings and physical inventory.
          </p>
        </div>
      </footer>
    </div>
  );
};
