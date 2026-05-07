import  { useState } from 'react';
import { lotteryParticipants, lotteryDraws, ticketLog, initialLotterySettings } from '../data/mockData'
import { getTypeLabel, getSourceLabel } from '../utils/helpers';
import TicketModal from '../components/TicketModal';

// ===== Sub-tab: Participants =====
const ParticipantsTab = () => {
  const [search, setSearch] = useState('');
  const [modalParticipant, setModalParticipant] = useState(null);

  const filtered = search
    ? lotteryParticipants.filter(p => p.number.includes(search))
    : lotteryParticipants;

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Поиск по номеру..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['Номер', 'Оператор', 'Тип', 'Место (викт.)', 'Билетов', 'Недельных побед', 'Статус', 'Действия'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const typeInfo = getTypeLabel(p.type);
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 font-mono text-sm">{p.number}</td>
                  <td className="px-3 py-3 text-sm">{p.operator}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                      {typeInfo.text}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {p.quizRank ? (
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.quizRank <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                        {p.quizRank <= 3 ? ['🥇', '🥈', '🥉'][p.quizRank - 1] : `#${p.quizRank}`}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-semibold">
                      {p.tickets.length}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {p.weeklyWins > 0
                      ? <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">🏆 {p.weeklyWins}</span>
                      : <span className="text-gray-400 text-xs">0</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status === 'active' ? 'Активен' : 'Приостановлен'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => setModalParticipant(p)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                    >
                      🎟️ Билеты
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modalParticipant && (
        <TicketModal participant={modalParticipant} onClose={() => setModalParticipant(null)} />
      )}
    </div>
  );
};

// ===== Sub-tab: Tickets =====
const TicketsTab = () => {
  const quizTickets = ticketLog.filter(t => t.source === 'quiz_top3');
  const directTickets = ticketLog.filter(t => t.source === 'direct');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Через викторину (Топ-3)</p>
          <p className="text-2xl font-bold text-violet-700">{quizTickets.length}</p>
          <p className="text-xs text-gray-500 mt-1">Автоматически выданных</p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Прямая регистрация</p>
          <p className="text-2xl font-bold text-sky-700">{directTickets.length}</p>
          <p className="text-xs text-gray-500 mt-1">SMS / USSD</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Всего билетов</p>
          <p className="text-2xl font-bold text-gray-800">{ticketLog.length}</p>
          <p className="text-xs text-gray-500 mt-1">За все время</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['Дата', 'Номер', 'Билет', 'Источник', 'Причина', 'Неделя'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...ticketLog].sort((a, b) => b.id - a.id).map(t => {
              const srcInfo = getSourceLabel(t.source);
              return (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-600">{t.date}</td>
                  <td className="px-3 py-3 font-mono text-sm">{t.number}</td>
                  <td className="px-3 py-3 font-mono text-sm font-semibold text-blue-700">{t.ticket}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${srcInfo.bg} ${srcInfo.color}`}>
                      {srcInfo.icon} {srcInfo.text}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 max-w-xs truncate">{t.reason}</td>
                  <td className="px-3 py-3 text-sm font-medium">{t.week}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== Sub-tab: Draws =====
const DrawsTab = ({ drawTime }) => (
  <div className="space-y-6">
    {lotteryDraws.map(draw => (
      <div key={draw.id} className={`rounded-xl border-2 p-5 ${draw.status === 'upcoming' ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h4 className="font-bold text-lg">
              {draw.status === 'upcoming' ? '⏳' : '✅'} Розыгрыш — неделя {draw.week}
            </h4>
            <p className="text-sm text-gray-600">
              Дата: {draw.drawDate} | Участников: {draw.totalParticipants.toLocaleString()} | Билетов: {draw.totalTickets.toLocaleString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${draw.status === 'upcoming' ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
            {draw.status === 'upcoming' ? 'Ожидается' : 'Завершён'}
          </span>
        </div>
        {draw.winners.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 rounded-lg">
                {['Место', 'Номер', 'Билет', 'Оператор', 'Приз'].map(h => (
                  <th key={h} className="px-3 py-2 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draw.winners.map(w => (
                <tr key={w.place} className="border-b border-gray-100">
                  <td className="px-3 py-3 text-center text-xl">{['🥇', '🥈', '🥉'][w.place - 1]}</td>
                  <td className="px-3 py-3 font-mono text-sm">{w.number}</td>
                  <td className="px-3 py-3 font-mono text-sm text-blue-700 font-semibold">{w.ticket}</td>
                  <td className="px-3 py-3 text-center text-sm">{w.operator}</td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-700">{w.prize.toLocaleString()} ₴</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎰</div>
            <p className="font-medium">Розыгрыш ещё не состоялся</p>
            <p className="text-sm">Будет проведён {draw.drawDate} в {drawTime}</p>
          </div>
        )}
      </div>
    ))}
  </div>
);

// ===== Sub-tab: Lottery Settings =====
const LotterySettingsTab = ({ settings, setSettings }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Основные параметры</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус лотереи</label>
          <button
            onClick={() => setSettings({ ...settings, lottery_active: !settings.lottery_active })}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${settings.lottery_active ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {settings.lottery_active ? 'Активна' : 'Остановлена'}
          </button>
        </div>
        {[['shortcode', 'Короткий номер'], ['ussd_code', 'USSD код']].map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              type="text"
              value={settings[key]}
              onChange={e => setSettings({ ...settings, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Призовой фонд (₴)</label>
          <input
            type="number"
            value={settings.lottery_prize_pool}
            onChange={e => setSettings({ ...settings, lottery_prize_pool: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Ключевые слова</h4>
        {[
          ['keyword_lottery_only', 'Только лотерея'],
          ['keyword_quiz_only', 'Только викторина'],
          ['keyword_both', 'Оба сервиса'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              type="text"
              value={settings[key]}
              onChange={e => setSettings({ ...settings, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-gray-800 mb-3">Призы по местам (лотерея)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {settings.lottery_prizes.map((prize, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {['🥇', '🥈', '🥉'][idx]} {prize.label}
            </label>
            <input
              type="number"
              value={prize.amount}
              onChange={e => {
                const newPrizes = [...settings.lottery_prizes];
                newPrizes[idx] = { ...newPrizes[idx], amount: Number(e.target.value) };
                setSettings({ ...settings, lottery_prizes: newPrizes });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        ))}
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-800 mb-2">Связь с викториной</h4>
      <div className="space-y-3">
        {[
          ['auto_ticket_for_top3', 'Автоматически выдавать лотерейный билет победителям викторины (1-3 место)'],
          ['weekly_ticket_repeat', 'Повторная выдача билета каждую неделю при попадании в топ-3'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="flex justify-end gap-3">
      <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Отмена</button>
      <button
        onClick={() => alert('Настройки лотереи сохранены!')}
        className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
      >
        Сохранить
      </button>
    </div>
  </div>
);

// ===== Main LotteryPage =====
const TABS = [
  { key: 'participants', label: 'Участники', icon: '👥' },
  { key: 'tickets', label: 'Билеты', icon: '🎟️' },
  { key: 'draws', label: 'Розыгрыши', icon: '🎰' },
  { key: 'lotterySettings', label: 'Настройки', icon: '⚙️' },
];

const LotteryPage = () => {
  const [activeTab, setActiveTab] = useState('participants');
  const [settings, setSettings] = useState(initialLotterySettings);

  const currentDraw = lotteryDraws.find(d => d.status === 'upcoming');
  const quizTickets = ticketLog.filter(t => t.source === 'quiz_top3');
  const directTickets = ticketLog.filter(t => t.source === 'direct');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Лотерея</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${settings.lottery_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-sm font-medium ${settings.lottery_active ? 'text-emerald-700' : 'text-red-700'}`}>
            {settings.lottery_active ? 'Лотерея активна' : 'Лотерея остановлена'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Участников', value: lotteryParticipants.length.toLocaleString(), sub: 'Всего зарегистрировано', from: 'from-amber-500 to-orange-600' },
          { label: 'Билетов выдано', value: ticketLog.length, sub: `🏆 ${quizTickets.length} из викторины | 📱 ${directTickets.length} прямых`, from: 'from-violet-500 to-purple-600' },
          { label: 'Призовой фонд', value: `${settings.lottery_prize_pool.toLocaleString()} ₴`, sub: 'На текущий розыгрыш', from: 'from-sky-500 to-blue-600' },
          { label: 'След. розыгрыш', value: currentDraw?.drawDate || '—', sub: `${settings.draw_day} в ${settings.draw_time}`, from: 'from-emerald-500 to-teal-600' },
        ].map(({ label, value, sub, from }) => (
          <div key={label} className={`bg-gradient-to-br ${from} rounded-xl p-5 text-white shadow-lg`}>
            <p className="text-sm opacity-90">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs mt-1 opacity-75">{sub}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Как работает система</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📱', title: 'Прямая регистрация', text: `Абонент отправляет SMS "${settings.keyword_lottery_only}" на ${settings.shortcode} или набирает ${settings.ussd_code} → получает билет для лотереи` },
            { icon: '🏆', title: 'Через викторину (Топ-3)', text: 'Занявшие 1-3 место в еженедельной викторине автоматически получают лотерейный билет. Каждую неделю — новый билет при попадании в топ-3' },
            { icon: '🎰', title: 'Розыгрыш', text: `Каждое воскресенье в ${settings.draw_time} — автоматический розыгрыш. Призовой фонд: ${settings.lottery_prize_pool.toLocaleString()} ₴` },
          ].map(({ icon, title, text }) => (
            <div key={title} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-semibold text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Ключевые слова:</strong> "{settings.keyword_lottery_only}" — только лотерея | "{settings.keyword_quiz_only}" — только викторина | "{settings.keyword_both}" — оба сервиса
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'participants' && <ParticipantsTab settings={settings} />}
          {activeTab === 'tickets' && <TicketsTab />}
          {activeTab === 'draws' && <DrawsTab drawTime={settings.draw_time} />}
          {activeTab === 'lotterySettings' && <LotterySettingsTab settings={settings} setSettings={setSettings} />}
        </div>
      </div>
    </div>
  );
};

export default LotteryPage;