import { getSourceLabel } from '../src/utils/helpers';

const TicketModal = ({ participant, onClose }) => {
  if (!participant) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold">🎟️ Билеты абонента</h3>
              <p className="text-sm text-gray-500 font-mono">{participant.number}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div className="space-y-3">
            {participant.tickets.map((ticket, idx) => {
              const srcInfo = getSourceLabel(participant.ticketSource[idx]);
              return (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono font-bold text-blue-700">{ticket}</p>
                      <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${srcInfo.bg} ${srcInfo.color}`}>
                        {srcInfo.icon} {srcInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {participant.weeklyWins > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                🏆 Этот абонент занимал место в топ-3 викторины{' '}
                <strong>{participant.weeklyWins}</strong> раз(а) и получил{' '}
                {participant.weeklyWins} дополнительных билетов
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;