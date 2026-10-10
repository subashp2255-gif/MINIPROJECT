import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ServiceSelectionPage: React.FC = () => {
  const { setServiceMode, language, toggleLanguage } = useApp();
  const navigate = useNavigate();

  const handleSelectService = (mode: 'cold' | 'inventory') => {
    setServiceMode(mode);
    if (mode === 'cold') {
      navigate('/farmer/home');
    } else {
      navigate('/central/inventory');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fbf3] text-[#161d18] flex flex-col justify-between p-4 sm:p-6 md:p-10 max-w-4xl mx-auto">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#1e5e3a]/15 flex items-center justify-center text-[#1e5e3a]">
            <span className="material-symbols-outlined text-[26px]">warehouse</span>
          </div>
          <div>
            <h1 className="font-headline text-lg sm:text-xl font-bold text-[#1e5e3a] leading-tight">
              {language === 'ta' ? 'ஸ்மார்ட் கிராமப்புற சேமிப்பு' : 'Smart Rural Storage'}
            </h1>
            <p className="text-xs text-[#404941]">
              {language === 'ta' ? 'தமிழ்நாடு வேளாண் குளிர்பதன கட்டமைப்பு' : 'Tamil Nadu Agro Cold & Inventory Network'}
            </p>
          </div>
        </div>

        {/* Bilingual Toggle */}
        <button
          onClick={toggleLanguage}
          className="h-9 px-2 bg-[#e9f0e8] rounded-full flex items-center gap-1 border border-[#c0c9bf]/30 shadow-xs"
        >
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all ${
              language === 'en' ? 'bg-[#1e5e3a] text-white' : 'text-[#404941]'
            }`}
          >
            EN
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all ${
              language === 'ta' ? 'bg-[#1e5e3a] text-white' : 'text-[#404941]'
            }`}
          >
            தமிழ்
          </span>
        </button>
      </div>

      {/* Main Selection Area */}
      <div className="my-auto py-8 space-y-6">
        <div className="text-center max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#aff2c2] text-[#00210f] text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#1e5e3a] animate-pulse"></span>
            {language === 'ta' ? 'சேவையைத் தேர்ந்தெடுக்கவும்' : 'Select Agricultural Service'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161d18] tracking-tight">
            {language === 'ta'
              ? 'உங்கள் தேவைகேற்ப சேவையை அணுகுங்கள்'
              : 'Empowering Grassroots Post-Harvest Operations'}
          </h2>
          <p className="text-sm text-[#404941] mt-2">
            {language === 'ta'
              ? 'குளிர்பதன கிடங்கு முன்பதிவு அல்லது மத்திய சரக்கிருப்பு மேலாண்மையை தேர்வு செய்க.'
              : 'Choose between decentralized solar cold storage chambers or centralized multi-crop farm inventory.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-4">
          {/* Service Option 1: Cold Storage */}
          <div
            onClick={() => handleSelectService('cold')}
            className="group relative bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#1e5e3a] transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md"
          >
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#eef6ed] text-[#1e5e3a] flex items-center justify-center group-hover:bg-[#1e5e3a] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#86f8c2]/40 text-[#006c49] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px]">ac_unit</span>
              </div>
              <h3 className="text-xl font-bold text-[#161d18] mb-1">
                {language === 'ta' ? 'குளிர்பதன சேமிப்பு' : 'Cold Storage'}
              </h3>
              <p className="text-xs text-[#006c49] font-bold mb-3 uppercase tracking-wider">
                {language === 'ta' ? 'முன்பதிவு & இருப்பு கண்காணிப்பு' : 'Chambers & Booking Engine'}
              </p>
              <ul className="space-y-2 text-xs text-[#404941]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'அருகிலுள்ள சூரிய மின் அறைகள் தேடல்' : 'Discover nearby solar cold facilities'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'உடனடி இட ஒதுக்கீடு & டிஜிட்டல் நுழைவுச் சீட்டு' : 'Instant capacity booking & QR gate pass'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'நேரலை வெப்பநிலை & ஈரப்பதம் கண்காணிப்பு' : 'Live IoT chamber temperature & humidity'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'AI மண்டி விலை கணிப்பு & லாப பகுப்பாய்வு' : 'AI price forecast & arbitrage profits'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dde4dd]">
              <button className="w-full h-12 rounded-xl bg-[#1e5e3a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs group-hover:bg-[#16462b] transition-colors">
                <span>{language === 'ta' ? 'குளிர்பதனத்தை அணுகவும்' : 'Enter Cold Storage'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Service Option 2: Inventory Management */}
          <div
            onClick={() => handleSelectService('inventory')}
            className="group relative bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#1e5e3a] transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md"
          >
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#eef6ed] text-[#1e5e3a] flex items-center justify-center group-hover:bg-[#1e5e3a] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#ffdcc6] text-[#612d00] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px]">inventory_2</span>
              </div>
              <h3 className="text-xl font-bold text-[#161d18] mb-1">
                {language === 'ta' ? 'மத்திய சரக்கிருப்பு' : 'Central Inventory'}
              </h3>
              <p className="text-xs text-[#844000] font-bold mb-3 uppercase tracking-wider">
                {language === 'ta' ? 'பண்ணை சரக்கு & இயக்க பதிவேடு' : 'Batch Tracking & Stock Reconciliation'}
              </p>
              <ul className="space-y-2 text-xs text-[#404941]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'தனித்துவமான தொகுதி எண்கள் (#TN-DDG)' : 'Track unique batch IDs with verified weights'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'வாயில் அளவீடு & பகுதி திரும்பப் பெறுதல்' : 'Gate weighing & partial withdrawal ledger'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'சேத மற்றும் முரண்பாடு எச்சரிக்கைகள்' : 'Discrepancy notices & audit trails'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006c49]">check_circle</span>
                  <span>{language === 'ta' ? 'QR விரைவு தேடல் & சரக்கு அறிக்கைகள்' : 'QR code lookup & exportable reports'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dde4dd]">
              <button className="w-full h-12 rounded-xl bg-[#e9f0e8] text-[#1e5e3a] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1e5e3a] hover:text-white transition-colors">
                <span>{language === 'ta' ? 'சரக்கிருப்பை அணுகவும்' : 'Manage Inventory'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer support strip */}
      <div className="text-center py-4 text-xs text-[#707971] border-t border-[#dde4dd]">
        <span>Smart Rural Storage • Government of Tamil Nadu Agri Marketing Collaboration</span>
      </div>
    </div>
  );
};
