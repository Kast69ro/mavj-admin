import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  fetchOperatorPartners,
  saveOperatorPartner,
  deleteOperatorPartner,
} from '../features/operatorContent/operatorContentApi';
import PartnerModal from '../components/PartnerModal';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';

const fmtPct = (v) => `${Number(Number(v ?? 0).toFixed(2)).toLocaleString('ru-RU')}%`;

// Вкладка «Партнёры»: как делится НАША часть прибыли (после доли оператора и расходов)
const OperatorPartnersPage = () => {
  const dispatch = useDispatch();
  const { operator } = useOutletContext();
  const { code } = operator;

  const [partners, setPartners] = useState([]);
  const [totalPct, setTotalPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { partner } | { partner: null }
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispatch(fetchOperatorPartners(code)).unwrap();
      setPartners(data?.partners || []);
      setTotalPct(Number(data?.total_pct) || 0);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dispatch, code]);

  useEffect(() => {
    setPartners([]);
    setTotalPct(0);
    load();
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteOperatorPartner(confirm.id)).unwrap();
      setConfirm(null);
      load();
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleting(false);
    }
  };

  const filled = Math.min(totalPct, 100);
  const free = Math.max(100 - totalPct, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Партнёры</h3>
          <p className="text-xs text-gray-400 mt-0.5">Деление нашей чистой прибыли по этому оператору</p>
        </div>
        <button
          onClick={() => setModal({ partner: null })}
          disabled={free <= 0}
          title={free <= 0 ? 'Распределено 100%' : undefined}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Добавить партнёра
        </button>
      </div>

      <ErrorBox>{error}</ErrorBox>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-gray-600">
            Распределено <span className="font-semibold text-gray-900">{fmtPct(totalPct)}</span> из 100%
          </span>
          <span className={`text-sm ${free > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
            {free > 0 ? `Свободно ${fmtPct(free)}` : 'Распределено полностью'}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${free > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${filled}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Партнёр</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Доля</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && partners.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">Загрузка…</td></tr>
            )}
            {!loading && !error && partners.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-400">Партнёры не добавлены</td></tr>
            )}
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{fmtPct(p.share_pct)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal({ partner: p })} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => { setDeleteError(null); setConfirm(p); }}
                      title="Удалить"
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <PartnerModal
          partner={modal.partner}
          available={free + Number(modal.partner?.share_pct || 0)}
          onSave={async (data) => {
            await dispatch(saveOperatorPartner({ code, id: modal.partner?.id, ...data })).unwrap();
            load();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title="Удалить партнёра?"
          message={`${confirm.name} (${fmtPct(confirm.share_pct)}) будет удалён. Его доля станет нераспределённой.`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default OperatorPartnersPage;
