import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Thermometer,
  ArrowLeft,
  Wrench,
  Droplets,
} from 'lucide-react';

export const StorageLocationsPage: React.FC = () => {
  const { facilities, batches, language, showToast } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const facility = facilities[0];
  const [chambers, setChambers] = useState(facility.chambers);

  const toggleMaintenance = (chamberId: string) => {
    setChambers((prev) =>
      prev.map((c) => {
        if (c.id === chamberId) {
          const nextState = !c.isMaintenance;
          showToast(
            nextState
              ? `${c.name} placed under maintenance. Capacity blocked.`
              : `${c.name} maintenance completed. Returned to active service.`,
            nextState ? 'warning' : 'success'
          );
          return {
            ...c,
            isMaintenance: nextState,
            maintenanceReason: nextState ? 'Sensor calibration & descaling' : undefined,
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/owner/inventory')}
              className="w-9 h-9 rounded-xl bg-white border border-[#DFE4DC] flex items-center justify-center text-[#14532D] hover:bg-[#F7F4EC]"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
                {isTa ? 'அறைகள் & சேமிப்பு இடங்கள்' : 'Storage Locations & Chambers'}
              </h1>
              <p className="text-xs text-[#5B6660]">
                {isTa ? 'குளிர்சாதன அறைகளின் விவரக்குறிப்புகள், வெப்பநிலை & பராமரிப்பு நிலை' : 'Configure chamber capacities, climate telemetry envelopes, and maintenance locks'}
              </p>
            </div>
          </div>
        </div>

        {/* Chambers List */}
        <div className="grid sm:grid-cols-2 gap-4">
          {chambers.map((cham) => {
            const chamBatches = batches.filter(
              (b) => b.chamberName.includes(cham.name.split(' ')[0]) && b.status === 'in_storage'
            );
            const occupiedKg = chamBatches.reduce((acc, b) => acc + b.currentStockKg, 0);
            const util = Math.round((occupiedKg / cham.totalCapacityKg) * 100);

            return (
              <div
                key={cham.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs space-y-4 transition-all ${
                  cham.isMaintenance ? 'border-amber-300 bg-amber-50/20' : 'border-[#DFE4DC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#161D18]">{cham.name}</h3>
                    <span className="text-[11px] font-semibold text-[#5B6660] capitalize">
                      {cham.type.replace('_', ' ')} Storage
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      cham.isMaintenance
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-[#AFF2C2] text-[#00210F]'
                    }`}
                  >
                    {cham.isMaintenance ? 'MAINTENANCE' : 'ACTIVE'}
                  </span>
                </div>

                {/* Telemetry Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F4FBF3] border border-[#AFF2C2]/60 flex items-center gap-2">
                    <Thermometer size={16} className="text-[#14532D]" />
                    <div>
                      <span className="text-[10px] text-[#5B6660] block">Chamber Temp</span>
                      <span className="font-bold text-[#14532D]">{cham.currentTemp}°C</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E7D7BE] flex items-center gap-2">
                    <Droplets size={16} className="text-[#C8923A]" />
                    <div>
                      <span className="text-[10px] text-[#5B6660] block">Humidity (RH)</span>
                      <span className="font-bold text-[#C8923A]">{cham.humidity}%</span>
                    </div>
                  </div>
                </div>

                {/* Physical Capacity Progress */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#5B6660]">Physical Occupancy:</span>
                    <span className="text-[#14532D] font-bold">
                      {occupiedKg} / {cham.totalCapacityKg} kg ({util}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${util > 80 ? 'bg-amber-500' : 'bg-[#14532D]'}`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>

                {cham.isMaintenance && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-1.5">
                    <Wrench size={14} className="flex-shrink-0" />
                    <span>{cham.maintenanceReason || 'Sensors being recalibrated.'}</span>
                  </div>
                )}

                {/* Maintenance Button */}
                <div className="pt-2 border-t border-[#DFE4DC] flex items-center justify-between">
                  <span className="text-[11px] text-[#5B6660]">
                    Capacity: {cham.totalCapacityCrates} Crates
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMaintenance(cham.id)}
                    className={`h-8 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cham.isMaintenance
                        ? 'bg-[#14532D] text-white'
                        : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    {cham.isMaintenance ? 'Mark Active' : 'Toggle Maintenance'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
