import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, Camera, Gift, Trophy, User, Calendar } from 'lucide-react';
import {
  fetchContentOperators,
  fetchPeriodDetail,
  updateOperatorPeriod,
  deleteOperatorPeriod,
  savePrize,
  uploadPrizeImage,
  deletePrize,
  saveWinner,
  uploadWinnerPhoto,
  deleteWinner,
} from '../features/operatorContent/operatorContentApi';
import { formatDateOnly, formatMsisdn, mediaUrl, today } from '../utils/utils';
import { getPeriodPhase } from '../utils/helpers';
import OperatorPeriodModal from '../components/OperatorPeriodModal';
import PrizeModal from '../components/PrizeModal';
import WinnerModal from '../components/WinnerModal';
import ImageUploadModal from '../components/ImageUploadModal';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';

const SectionHeader = ({ icon, title, count, onAdd, addLabel }) => (
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      {icon} {title}
      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{count}</span>
    </h3>
    <button
      onClick={onAdd}
      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
    >
      <Plus size={16} /> {addLabel}
    </button>
  </div>
);

const OperatorPeriodPage = () => {
  const { periodId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { operators, detail, detailLoading, detailError } = useSelector((state) => state.operatorContent);

  const [editPeriodOpen, setEditPeriodOpen] = useState(false);
  const [prizeModal, setPrizeModal] = useState(null); // { prize } | { prize: null }
  const [winnerModal, setWinnerModal] = useState(null); // { winner } | { winner: null }
  const [imageTarget, setImageTarget] = useState(null); // { type: 'prize' | 'winner', item }
  const [confirm, setConfirm] = useState(null); // { type: 'period' | 'prize' | 'winner', item }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (operators.length === 0) dispatch(fetchContentOperators());
  }, [dispatch, operators.length]);

  useEffect(() => {
    dispatch(fetchPeriodDetail(periodId));
  }, [dispatch, periodId]);

  const period = detail?.period;
  const operator = operators.find((o) => o.code === period?.operator);

  const prizes = useMemo(
    () => [...(detail?.prizes || [])].sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id)),
    [detail]
  );
  const winners = useMemo(
    () => [...(detail?.winners || [])].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity) || a.id - b.id),
    [detail]
  );

  const nextSortOrder = prizes.length ? Math.max(...prizes.map((p) => p.sort_order ?? 0)) + 1 : 0;

  const openConfirm = (type, item) => {
    setDeleteError(null);
    setConfirm({ type, item });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      if (confirm.type === 'period') {
        await dispatch(deleteOperatorPeriod(period.id)).unwrap();
        navigate(`/operator-content/${period.operator}`, { replace: true });
        return;
      }
      if (confirm.type === 'prize') {
        await dispatch(deletePrize({ periodId: period.id, id: confirm.item.id })).unwrap();
      } else {
        await dispatch(deleteWinner({ periodId: period.id, id: confirm.item.id })).unwrap();
      }
      setConfirm(null);
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleting(false);
    }
  };

  if (!period) {
    return (
      <div className="space-y-6">
        <Link to="/operator-content" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ChevronLeft size={16} /> Операторы
        </Link>
        {detailLoading && <p className="text-sm text-gray-400">Загрузка…</p>}
        <ErrorBox>{detailError}</ErrorBox>
      </div>
    );
  }

  const phase = getPeriodPhase(period, today());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Link to="/operator-content" className="hover:text-gray-800">Операторы</Link>
        <span>/</span>
        <Link to={`/operator-content/${period.operator}`} className="inline-flex items-center gap-1 hover:text-gray-800">
          <ChevronLeft size={16} /> {operator?.name || period.operator}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-800">{period.name}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${phase.bg} ${phase.color}`}>{phase.text}</span>
          </div>
          <p className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <Calendar size={14} /> {formatDateOnly(period.start_date)} — {formatDateOnly(period.end_date)}
          </p>
          {!period.is_published && (
            <p className="text-xs text-gray-400 mt-1">Черновик — не показывается на сайте оператора</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditPeriodOpen(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Pencil size={16} /> Изменить
          </button>
          <button
            onClick={() => openConfirm('period', period)}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Trash2 size={16} /> Удалить
          </button>
        </div>
      </div>

      <ErrorBox>{detailError}</ErrorBox>

      {/* ===== Призы ===== */}
      <section className="space-y-4">
        <SectionHeader
          icon={<Gift size={20} className="text-amber-500" />}
          title="Призы"
          count={prizes.length}
          addLabel="Добавить приз"
          onAdd={() => setPrizeModal({ prize: null })}
        />

        {prizes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
            Призов пока нет — добавьте первый
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {prizes.map((prize) => (
              <div key={prize.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-gray-50 group">
                  {prize.image_url ? (
                    <img src={mediaUrl(prize.image_url)} alt={prize.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift size={40} className="text-gray-200" />
                    </div>
                  )}
                  <button
                    onClick={() => setImageTarget({ type: 'prize', item: prize })}
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-xs font-medium shadow-sm"
                  >
                    <Camera size={14} /> {prize.image_url ? 'Заменить фото' : 'Загрузить фото'}
                  </button>
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-gray-500 rounded text-xs font-medium shadow-sm">
                    #{prize.sort_order}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-semibold text-gray-800">{prize.title}</h4>
                  {prize.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-3">{prize.description}</p>
                  )}
                  <div className="flex justify-end gap-2 mt-auto pt-3">
                    <button onClick={() => setPrizeModal({ prize })} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => openConfirm('prize', prize)} title="Удалить" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Победители ===== */}
      <section className="space-y-4">
        <SectionHeader
          icon={<Trophy size={20} className="text-emerald-500" />}
          title="Победители"
          count={winners.length}
          addLabel="Добавить победителя"
          onAdd={() => setWinnerModal({ winner: null })}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фото</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Номер</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Место</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Приз</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody>
              {winners.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">Победителей пока нет</td></tr>
              )}
              {winners.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setImageTarget({ type: 'winner', item: w })}
                      title={w.photo_url ? 'Заменить фото' : 'Загрузить фото'}
                      className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center group"
                    >
                      {w.photo_url ? (
                        <img src={mediaUrl(w.photo_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-gray-400" />
                      )}
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Camera size={14} className="text-white" />
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium font-mono whitespace-nowrap">{formatMsisdn(w.msisdn)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {w.place != null ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        w.place === 1 ? 'bg-amber-100 text-amber-800'
                          : w.place === 2 ? 'bg-gray-200 text-gray-700'
                          : w.place === 3 ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {w.place}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {w.prize_title ? (
                      <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-medium">{w.prize_title}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setWinnerModal({ winner: w })} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => openConfirm('winner', w)} title="Удалить" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Модалки ===== */}
      {editPeriodOpen && (
        <OperatorPeriodModal
          period={period}
          onSave={(data) => dispatch(updateOperatorPeriod({ id: period.id, ...data })).unwrap()}
          onClose={() => setEditPeriodOpen(false)}
        />
      )}

      {prizeModal && (
        <PrizeModal
          prize={prizeModal.prize}
          nextSortOrder={nextSortOrder}
          onSave={(data) => dispatch(savePrize({ periodId: period.id, id: prizeModal.prize?.id, ...data })).unwrap()}
          onClose={() => setPrizeModal(null)}
        />
      )}

      {winnerModal && (
        <WinnerModal
          winner={winnerModal.winner}
          prizes={prizes}
          onSave={(data) => dispatch(saveWinner({ periodId: period.id, id: winnerModal.winner?.id, ...data })).unwrap()}
          onClose={() => setWinnerModal(null)}
        />
      )}

      {imageTarget && (
        <ImageUploadModal
          title={imageTarget.type === 'prize' ? `Фото приза: ${imageTarget.item.title}` : 'Фото победителя'}
          label={imageTarget.type === 'prize' ? 'Фото приза' : 'Фото'}
          rounded={imageTarget.type === 'winner' ? 'rounded-full' : 'rounded-lg'}
          currentUrl={imageTarget.type === 'prize' ? imageTarget.item.image_url : imageTarget.item.photo_url}
          onUpload={(file) =>
            dispatch(
              (imageTarget.type === 'prize' ? uploadPrizeImage : uploadWinnerPhoto)({
                periodId: period.id,
                id: imageTarget.item.id,
                file,
              })
            ).unwrap()
          }
          onClose={() => setImageTarget(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={
            confirm.type === 'period' ? 'Удалить период?' : confirm.type === 'prize' ? 'Удалить приз?' : 'Удалить победителя?'
          }
          message={
            confirm.type === 'period'
              ? `Период «${period.name}» будет удалён вместе со всеми призами (${prizes.length}), победителями (${winners.length}) и их фото. Это действие нельзя отменить.`
              : confirm.type === 'prize'
                ? `Приз «${confirm.item.title}» и его фото будут удалены.`
                : `Победитель ${formatMsisdn(confirm.item.msisdn)}${confirm.item.name ? ` (${confirm.item.name})` : ''} будет удалён.`
          }
          loading={deleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default OperatorPeriodPage;
