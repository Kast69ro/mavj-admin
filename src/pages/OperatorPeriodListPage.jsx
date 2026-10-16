import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Gift, Trophy } from 'lucide-react';
import {
  fetchContentOperators,
  fetchOperatorPeriods,
  createOperatorPeriod,
  updateOperatorPeriod,
  deleteOperatorPeriod,
} from '../features/operatorContent/operatorContentApi';
import { OPERATOR_COLORS } from '../utils/operatorColors';
import { formatDateOnly, mediaUrl, today } from '../utils/utils';
import { getPeriodPhase } from '../utils/helpers';
import OperatorPeriodModal from '../components/OperatorPeriodModal';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';

const OperatorPeriodsPage = () => {
  const { code } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { operators, periods, periodsOperator, periodsLoading, periodsError } = useSelector(
    (state) => state.operatorContent
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [deletePeriod, setDeletePeriod] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (operators.length === 0) dispatch(fetchContentOperators());
  }, [dispatch, operators.length]);

  useEffect(() => {
    dispatch(fetchOperatorPeriods(code));
  }, [dispatch, code]);

  const operator = operators.find((o) => o.code === code);
  const colors = OPERATOR_COLORS[code] ?? OPERATOR_COLORS.default;
  const rows = periodsOperator === code ? periods : [];
  const todayISO = today();

  const handleTogglePublished = async (period) => {
    setActionError(null);
    try {
      await dispatch(updateOperatorPeriod({ id: period.id, is_published: !period.is_published })).unwrap();
    } catch (e) {
      setActionError(e);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteOperatorPeriod(deletePeriod.id)).unwrap();
      setDeletePeriod(null);
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/operator-content" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={16} /> Операторы
      </Link>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl border bg-white flex items-center justify-center overflow-hidden"
            style={{ borderColor: colors.bg }}
          >
            {operator?.logo_url ? (
              <img src={mediaUrl(operator.logo_url)} alt="" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="font-bold text-lg" style={{ color: colors.active }}>
                {(operator?.name || code).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{operator?.name || code}</h2>
            <p className="text-sm text-gray-500">Периоды розыгрышей</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Добавить период
        </button>
      </div>

      <ErrorBox>{periodsError || actionError}</ErrorBox>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Даты</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Призы</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Победители</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody>
            {periodsLoading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">Загрузка…</td></tr>
            )}
            {!periodsLoading && !periodsError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-400 mb-3">У этого оператора ещё нет периодов</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    <Plus size={16} /> Создать первый период
                  </button>
                </td>
              </tr>
            )}
            {rows.map((p) => {
              const phase = getPeriodPhase(p, todayISO);
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/operator-content/periods/${p.id}`)}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {formatDateOnly(p.start_date)} — {formatDateOnly(p.end_date)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${phase.bg} ${phase.color}`}>
                      {phase.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    <span className="inline-flex items-center gap-1"><Gift size={14} className="text-gray-400" />{p.prizes_count ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    <span className="inline-flex items-center gap-1"><Trophy size={14} className="text-gray-400" />{p.winners_count ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublished(p)}
                        title={p.is_published ? 'Скрыть (в черновик)' : 'Опубликовать'}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        {p.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => setEditPeriod(p)} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => { setDeleteError(null); setDeletePeriod(p); }}
                        title="Удалить"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/operator-content/periods/${p.id}`)}
                        title="Призы и победители"
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showCreate || editPeriod) && (
        <OperatorPeriodModal
          period={editPeriod}
          onSave={(data) =>
            editPeriod
              ? dispatch(updateOperatorPeriod({ id: editPeriod.id, ...data })).unwrap()
              : dispatch(createOperatorPeriod({ code, ...data })).unwrap()
          }
          onClose={() => { setShowCreate(false); setEditPeriod(null); }}
        />
      )}

      {deletePeriod && (
        <ConfirmModal
          title="Удалить период?"
          message={`Период «${deletePeriod.name}» будет удалён вместе со всеми призами (${deletePeriod.prizes_count ?? 0}), победителями (${deletePeriod.winners_count ?? 0}) и их фото. Это действие нельзя отменить.`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setDeletePeriod(null)}
        />
      )}
    </div>
  );
};

export default OperatorPeriodsPage;
