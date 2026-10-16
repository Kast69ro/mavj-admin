import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';
import { today } from '../utils/utils';

const ExpenseModal = ({ expense, categories, onSave, onClose }) => {
  const isEdit = Boolean(expense);
  const [form, setForm] = useState({
    expense_date: expense?.expense_date ?? today(),
    amount: expense?.amount ?? '',
    category: expense?.category ?? categories[0]?.code ?? '',
    comment: expense?.comment ?? '',
    is_monthly: expense?.is_monthly ?? false,
    end_date: expense?.end_date ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const amount = Number(form.amount);
  const amountInvalid = form.amount === '' || !Number.isFinite(amount) || amount <= 0;
  const endInvalid = form.is_monthly && form.end_date && form.end_date < form.expense_date;
  const canSave = form.expense_date && form.category && !amountInvalid && !endInvalid;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        expense_date: form.expense_date,
        amount,
        category: form.category,
        comment: form.comment.trim() || null,
        is_monthly: form.is_monthly,
        end_date: form.is_monthly && form.end_date ? form.end_date : null,
      });
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить расход');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? 'Редактировать расход' : 'Новый расход'} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата">
            <input type="date" value={form.expense_date} onChange={set('expense_date')} className={inputClass} />
          </Field>
          <Field label="Сумма, TJS">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={set('amount')}
              className={inputClass}
              autoFocus
            />
          </Field>
        </div>
        <Field label="Категория">
          <select value={form.category} onChange={set('category')} className={inputClass}>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Комментарий">
          <textarea rows={2} value={form.comment} onChange={set('comment')} className={inputClass} />
        </Field>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.is_monthly}
            onChange={(e) => setForm({ ...form, is_monthly: e.target.checked })}
          />
          <span>
            Ежемесячный
            <span className="block text-xs text-gray-400">Повторяется каждый месяц в этот день</span>
          </span>
        </label>

        {form.is_monthly && (
          <Field label="Повторять до" hint="Пусто — бессрочно">
            <input
              type="date"
              value={form.end_date}
              min={form.expense_date || undefined}
              onChange={set('end_date')}
              className={inputClass}
            />
          </Field>
        )}
        {endInvalid && <p className="text-xs text-red-600">Дата окончания раньше даты расхода</p>}

        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default ExpenseModal;
