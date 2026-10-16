import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Clock, Save } from 'lucide-react';
import { fetchOperatorSettings, updateOperatorSettings } from '../features/operatorContent/operatorContentApi';
import { formatDate } from '../utils/utils';
import { ErrorBox, Field, inputClass } from '../components/ContentModal';

const MAX_RETRY_TIMES = 12;

const toForm = (s) => ({
  rebill_time: s?.rebill_time ?? '',
  rebill_retry_times: s?.rebill_retry_times ?? [],
  first_question_time: s?.first_question_time ?? '',
  question_timeout_min: s?.question_timeout_min ?? '',
  period_days: s?.period_days ?? '',
  operator_share_pct: s?.operator_share_pct ?? '',
  billing_shortcodes: s?.billing_shortcodes ?? [],
});

const NUMBER_LIMITS = {
  question_timeout_min: [1, 1440],
  period_days: [1, 366],
  operator_share_pct: [0, 100],
};

const numberError = (key, value) => {
  if (value === '' || value == null) return null;
  const [min, max] = NUMBER_LIMITS[key];
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? null : `От ${min} до ${max}`;
};

const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// Список значений-«чипов» с полем добавления (время попыток, коды биллинга)
const ChipsInput = ({ values, onChange, type = 'text', placeholder, max, sort }) => {
  const [draft, setDraft] = useState('');
  const value = draft.trim();
  const canAdd = value && !values.includes(value) && (!max || values.length < max);

  const add = () => {
    if (!canAdd) return;
    const next = [...values, value];
    onChange(sort ? next.sort() : next);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-mono">
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="p-0.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-white"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={`${inputClass} max-w-[200px]`}
        />
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>
    </div>
  );
};

// Вкладка «Настройки»: расписание списаний и викторины, длительность периода, доля оператора, коды биллинга
const OperatorSettingsPage = () => {
  const dispatch = useDispatch();
  const { operator } = useOutletContext();
  const { code } = operator;

  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(toForm(null));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    dispatch(fetchOperatorSettings(code))
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        setSettings(data);
        setForm(toForm(data));
      })
      .catch((e) => !cancelled && setLoadError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dispatch, code]);

  const set = (key) => (value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const initial = toForm(settings);
  const changes = {};
  for (const key of Object.keys(form)) {
    const a = form[key];
    const b = initial[key];
    const differs = Array.isArray(a) ? !sameList(a, b) : String(a) !== String(b);
    if (!differs) continue;
    if (key in NUMBER_LIMITS) {
      if (a === '') continue; // числовое поле нельзя «очистить» — просто не отправляем
      changes[key] = Number(a);
    } else {
      changes[key] = a;
    }
  }
  const errors = Object.fromEntries(Object.keys(NUMBER_LIMITS).map((k) => [k, numberError(k, form[k])]));
  const hasErrors = Object.values(errors).some(Boolean);
  const dirty = Object.keys(changes).length > 0;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const data = await dispatch(updateOperatorSettings({ code, ...changes })).unwrap();
      setSettings(data);
      setForm(toForm(data));
      setSaved(true);
    } catch (e) {
      setSaveError(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) return <p className="text-sm text-gray-400">Загрузка…</p>;
  if (loadError && !settings) return <ErrorBox>{loadError}</ErrorBox>;

  return (
    <div className="space-y-4">
      {code !== 'zet' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3">
          Для этого оператора время списаний и вопросов пока только сохраняется: живые списания идут по старому
          расписанию до конца первого периода.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Списания
          </h3>
          <Field label="Основное ежедневное списание" hint="Время по Душанбе. Пусто — не задано">
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={form.rebill_time}
                onChange={(e) => set('rebill_time')(e.target.value)}
                className={`${inputClass} max-w-[160px]`}
              />
              {form.rebill_time && (
                <button type="button" onClick={() => set('rebill_time')('')} className="text-xs text-gray-400 hover:text-red-600">
                  Очистить
                </button>
              )}
            </div>
          </Field>
          <Field
            label="Дополнительные попытки"
            hint={`Для приостановленных и отклонённых списаний. До ${MAX_RETRY_TIMES} попыток в день`}
          >
            <ChipsInput
              type="time"
              values={form.rebill_retry_times}
              onChange={set('rebill_retry_times')}
              max={MAX_RETRY_TIMES}
              sort
            />
          </Field>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Викторина</h3>
          <Field label="Первый вопрос" hint="Время отправки по Душанбе">
            <input
              type="time"
              value={form.first_question_time}
              onChange={(e) => set('first_question_time')(e.target.value)}
              className={`${inputClass} max-w-[160px]`}
            />
          </Field>
          <Field label="Время на ответ, минут" hint={errors.question_timeout_min || 'От 1 до 1440'}>
            <input
              type="number"
              min={1}
              max={1440}
              value={form.question_timeout_min}
              onChange={(e) => set('question_timeout_min')(e.target.value)}
              className={`${inputClass} max-w-[160px] ${errors.question_timeout_min ? 'border-red-400' : ''}`}
            />
          </Field>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Периоды и доходы</h3>
          <Field
            label="Длительность периода по умолчанию, дней"
            hint={errors.period_days || 'Используется, если при создании периода не указана дата окончания'}
          >
            <input
              type="number"
              min={1}
              max={366}
              value={form.period_days}
              onChange={(e) => set('period_days')(e.target.value)}
              className={`${inputClass} max-w-[160px] ${errors.period_days ? 'border-red-400' : ''}`}
            />
          </Field>
          <Field label="Доля оператора от выручки, %" hint={errors.operator_share_pct || 'От 0 до 100'}>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.operator_share_pct}
              onChange={(e) => set('operator_share_pct')(e.target.value)}
              className={`${inputClass} max-w-[160px] ${errors.operator_share_pct ? 'border-red-400' : ''}`}
            />
          </Field>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Коды биллинга</h3>
          <Field label="По каким кодам считать выручку" hint="Например: tcell, tcell-5436">
            <ChipsInput values={form.billing_shortcodes} onChange={set('billing_shortcodes')} placeholder="код" />
          </Field>
          {form.billing_shortcodes.length === 0 && (
            <p className="text-xs text-amber-700">Коды не заданы — выручка оператора в финансах будет нулевой</p>
          )}
        </section>
      </div>

      <ErrorBox>{saveError}</ErrorBox>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !dirty || hasErrors}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => { setForm(toForm(settings)); setSaveError(null); }}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Отменить изменения
          </button>
        )}
        {saved && !dirty && <span className="text-sm text-emerald-600">Сохранено</span>}
        {settings?.updated_at && (
          <span className="text-xs text-gray-400 ml-auto">Изменено: {formatDate(settings.updated_at)}</span>
        )}
      </div>
    </div>
  );
};

export default OperatorSettingsPage;
