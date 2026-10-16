import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, Repeat } from 'lucide-react';
import {
  fetchExpenseCategories,
  fetchOperatorExpenses,
  saveOperatorExpense,
  deleteOperatorExpense,
} from '../features/operatorContent/operatorContentApi';
import { formatDateOnly, money } from '../utils/utils';
import ExpenseModal from '../components/ExpenseModal';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';

const CATEGORY_STYLES = {
  ads: 'bg-blue-50 text-blue-700',
  sms: 'bg-violet-50 text-violet-700',
  operator_fee: 'bg-orange-50 text-orange-700',
  salary: 'bg-emerald-50 text-emerald-700',
  prizes: 'bg-amber-50 text-amber-800',
  other: 'bg-gray-100 text-gray-600',
};

// Вкладка «Расходы»: разовые и ежемесячные расходы оператора (призы попадают сюда автоматически)
const OperatorExpensesPage = () => {
  const dispatch = useDispatch();
  const { operator } = useOutletContext();
  const { code } = operator;

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { expense } | { expense: null }
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    dispatch(fetchExpenseCategories())
      .unwrap()
      .then(setCategories)
      .catch((e) => setError(e));
  }, [dispatch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispatch(fetchOperatorExpenses(code)).unwrap();
      setExpenses(data?.expenses || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dispatch, code]);

  useEffect(() => {
    setExpenses([]);
    load();
  }, [load]);

  const categoryLabel = (c) => categories.find((x) => x.code === c)?.label ?? c;

  const rows = useMemo(
    () =>
      expenses
        .filter((e) => !category || e.category === category)
        .sort((a, b) => (b.expense_date || '').localeCompare(a.expense_date || '') || b.id - a.id),
    [expenses, category]
  );
  const total = rows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteOperatorExpense(confirm.id)).unwrap();
      setConfirm(null);
      load();
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Расходы</h3>
        <button
          onClick={() => setModal({ expense: null })}
          disabled={categories.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Добавить расход
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ code: '', label: 'Все' }, ...categories].map((c) => (
          <button
            key={c.code || 'all'}
            type="button"
            onClick={() => setCategory(c.code)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              category === c.code
                ? 'bg-gray-800 border-gray-800 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ErrorBox>{error}</ErrorBox>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Комментарий</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Повтор</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма, TJS</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && expenses.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">Загрузка…</td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">Расходов нет</td></tr>
            )}
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDateOnly(e.expense_date)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_STYLES[e.category] ?? CATEGORY_STYLES.other}`}>
                    {categoryLabel(e.category)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{e.comment || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {e.is_monthly ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Repeat size={13} className="text-gray-400" />
                      ежемесячно{e.end_date ? ` до ${formatDateOnly(e.end_date)}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">разово</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 whitespace-nowrap">
                  {Number(e.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal({ expense: e })} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => { setDeleteError(null); setConfirm(e); }}
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
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold border-t border-gray-200">
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-700">
                  Итого записей: {rows.length}
                  <span className="block text-xs font-normal text-gray-400">
                    Ежемесячные учтены один раз — помесячный итог смотрите во вкладке «Финансы»
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">{money(total)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {modal && (
        <ExpenseModal
          expense={modal.expense}
          categories={categories}
          onSave={async (data) => {
            await dispatch(saveOperatorExpense({ code, id: modal.expense?.id, ...data })).unwrap();
            load();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title="Удалить расход?"
          message={`${categoryLabel(confirm.category)} от ${formatDateOnly(confirm.expense_date)} на ${Number(confirm.amount).toFixed(2)} TJS${
            confirm.is_monthly ? ' (ежемесячный — пропадёт за все месяцы)' : ''
          } будет удалён.`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default OperatorExpensesPage;
