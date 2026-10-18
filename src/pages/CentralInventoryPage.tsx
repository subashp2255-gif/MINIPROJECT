import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CentralInventoryPage: React.FC = () => {
  const { batches, movements, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'batches' | 'movements'>('batches');

  const filteredBatches = batches.filter(
    (b) =>
      b.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      b.cropName.toLowerCase().includes(search.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'BatchCode,Crop,Farmer,Facility,Chamber,StockKg,Status,IntakeDate\n' +
      batches.map((b) => `${b.batchCode},${b.cropName},${b.farmerName},${b.facilityName},${b.chamberName},${b.currentStockKg},${b.status},${b.intakeDate}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SRS_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported inventory ledger to CSV!', 'success');
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-32 bg-[#F4FBF3] min-h-screen">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Header & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#14532D]">
              Central Inventory Management
            </h1>
            <p className="text-xs text-[#526055]">
              Authoritative agricultural batch tracking &amp; audit trails
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="h-11 px-4 rounded-xl bg-[#EEF6ED] text-[#14532D] text-xs font-bold flex items-center gap-2 hover:bg-[#e3eae2] border border-[#DFE4DC] transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Ledger CSV</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-[#dde4dd] pb-2">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'batches'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#526055] hover:bg-[#EEF6ED]'
            }`}
          >
            Active Crop Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'movements'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-[#526055] hover:bg-[#EEF6ED]'
            }`}
          >
            Movement Audit Trails ({movements.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#526055]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch ID, crop name, or farmer..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-xl border border-[#c0c9bf] text-xs font-medium focus:border-[#14532D] outline-hidden shadow-2xs"
          />
        </div>

        {/* Batches Table / Cards */}
        {activeTab === 'batches' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#dfe4dc] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eef6ed] text-[#161d18] border-b border-[#dde4dd]">
                  <tr>
                    <th className="p-3.5 font-bold">Batch ID</th>
                    <th className="p-3.5 font-bold">Produce / Grade</th>
                    <th className="p-3.5 font-bold">Farmer</th>
                    <th className="p-3.5 font-bold">Chamber</th>
                    <th className="p-3.5 font-bold">Current Stock</th>
                    <th className="p-3.5 font-bold">Telemetry</th>
                    <th className="p-3.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde4dd]">
                  {filteredBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#006c49]">{b.batchCode}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#161d18]">{b.cropName}</div>
                        <div className="text-[10px] text-[#404941]">{b.grade}</div>
                      </td>
                      <td className="p-3.5 font-medium">{b.farmerName}</td>
                      <td className="p-3.5">
                        <div className="text-[#161d18] font-semibold">{b.facilityName}</div>
                        <div className="text-[10px] text-[#404941]">{b.chamberName}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[#1e5e3a]">
                        {b.currentStockKg} kg
                        <span className="text-[10px] text-[#404941] font-normal block">
                          {b.currentStockCrates} crates
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#eef6ed] text-[#1e5e3a] font-bold text-[11px]">
                          {b.currentTemp}°C • {b.currentHumidity}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'in_storage'
                              ? 'bg-[#86f8c2] text-[#00734e]'
                              : b.status === 'in_transit'
                              ? 'bg-[#ffdcc6] text-[#844000]'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {b.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Movements Audit Trail Table */}
        {activeTab === 'movements' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#dfe4dc] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eef6ed] text-[#161d18] border-b border-[#dde4dd]">
                  <tr>
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Batch ID</th>
                    <th className="p-3.5 font-bold">Movement Type</th>
                    <th className="p-3.5 font-bold">Quantity</th>
                    <th className="p-3.5 font-bold">Authorized By</th>
                    <th className="p-3.5 font-bold">Audit Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde4dd]">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 text-[#404941]">
                        {new Date(m.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#006c49]">{m.batchCode}</td>
                      <td className="p-3.5 font-bold uppercase text-[#161d18]">
                        {m.type.replace('_', ' ')}
                      </td>
                      <td className="p-3.5 font-bold text-[#1e5e3a]">
                        {m.quantityKg} kg ({m.quantityCrates} crates)
                      </td>
                      <td className="p-3.5 text-[#404941]">{m.authorizedBy}</td>
                      <td className="p-3.5 font-mono text-[10px] text-gray-500">{m.receiptNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
