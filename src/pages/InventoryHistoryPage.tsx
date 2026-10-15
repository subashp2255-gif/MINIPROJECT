import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Download, ArrowLeft, Search, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export const InventoryHistoryPage: React.FC = () => {
  const { movements, language, showToast } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = movements.filter((m) => {
    const matchesSearch =
      m.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      (m.receiptNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.authorizedBy.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportCsv = () => {
    const headers = 'ReceiptNumber,BatchCode,Type,QuantityKg,QuantityCrates,AuthorizedBy,Reason,Timestamp\n';
    const rows = movements
      .map(
        (m) =>
          `"${m.receiptNumber || m.id}","${m.batchCode}","${m.type}",${m.quantityKg},${m.quantityCrates},"${m.authorizedBy}","${m.reason}","${m.timestamp}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriSync_Movement_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Inventory audit trail exported to CSV!', 'success');
  };

  return (
    <div className="w-full pb-32 text-[#1C2420]">
      <div className="px-4 pt-3 space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                {isTa ? 'சரக்கு நகர்வு தணிக்கை வரலாறு' : 'Inventory Movement Audit Ledger'}
              </h1>
              <p className="text-xs text-[#5B6660]">
                {isTa ? 'வரவு, மீட்பு, இடமாற்றம் & சேத திருத்தங்களின் முழுமையான பட்டியல்' : 'Immutable append-only audit trail of every physical stock operation'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-3.5 rounded-xl bg-white border border-[#DFE4DC] text-[#14532D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F7F4EC] transition-colors"
          >
            <Download size={15} />
            <span>Export Movement Ledger</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-[#5B6660]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch code, receipt #, reason, operator..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-white focus:border-[#14532D] outline-hidden"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'intake', 'partial_withdrawal', 'full_dispatch', 'chamber_relocation', 'spoilage_writeoff'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 h-10 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  typeFilter === t
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'bg-white text-[#5B6660] hover:bg-[#EEF6ED] border border-[#DFE4DC]'
                }`}
              >
                {t === 'all' ? 'All' : t.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-[#DFE4DC] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF6ED] text-[#161D18] border-b border-[#DDE4DD]">
                <tr>
                  <th className="p-3.5 font-bold">Receipt / Date</th>
                  <th className="p-3.5 font-bold">Batch ID</th>
                  <th className="p-3.5 font-bold">Operation Type</th>
                  <th className="p-3.5 font-bold">Quantity</th>
                  <th className="p-3.5 font-bold">Authorized By</th>
                  <th className="p-3.5 font-bold">Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DD]">
                {filtered.map((m) => {
                  const isIntake = m.type === 'intake';
                  const isWithdrawal = m.type === 'partial_withdrawal' || m.type === 'full_dispatch';
                  const isTransfer = m.type === 'chamber_relocation';
                  const isWriteoff = m.type === 'spoilage_writeoff';

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#1C2420] block">
                          {m.receiptNumber || m.id}
                        </span>
                        <span className="text-[10px] text-[#5B6660]">
                          {new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-[#14532D]">
                        {m.batchCode}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isIntake
                              ? 'bg-[#AFF2C2] text-[#00210F]'
                              : isWithdrawal
                              ? 'bg-[#FDFBF7] border border-[#E7D7BE] text-[#C8923A]'
                              : isTransfer
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isIntake && <ArrowDownLeft size={12} />}
                          {isWithdrawal && <ArrowUpRight size={12} />}
                          {isTransfer && <RefreshCw size={12} />}
                          {isWriteoff && <AlertTriangle size={12} />}
                          <span>{m.type.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>

                      <td className="p-3.5 font-bold">
                        <span className={isIntake ? 'text-[#14532D]' : isWithdrawal ? 'text-[#C8923A]' : 'text-[#1C2420]'}>
                          {isIntake ? '+' : isWithdrawal ? '-' : ''}{m.quantityKg} kg
                        </span>
                        <span className="text-[10px] text-[#5B6660] block font-normal">
                          {m.quantityCrates} crates
                        </span>
                      </td>

                      <td className="p-3.5 font-medium text-[#1C2420]">
                        {m.authorizedBy}
                      </td>

                      <td className="p-3.5 text-[#5B6660] max-w-xs truncate">
                        {m.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
