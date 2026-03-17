// ===== STATIC MOCK DATA =====

export const operators = ['Tcell', 'Мегафон', 'Babilon', 'Zet-Mobile'];

export const subscribers = [
  { id: 1, date: '15.01.2026', number: '992901234567', points: 150, operator: 'Tcell' },
  { id: 2, date: '15.01.2026', number: '992917654321', points: 200, operator: 'Мегафон' },
  { id: 3, date: '14.01.2026', number: '992931112233', points: 100, operator: 'Babilon' },
  { id: 4, date: '14.01.2026', number: '992941234567', points: 250, operator: 'Zet-Mobile' },
  { id: 5, date: '13.01.2026', number: '992901111222', points: 180, operator: 'Tcell' },
];

export const companies = [
  { name: 'Компания 1', count: 1250 },
  { name: 'Компания 2', count: 980 },
  { name: 'Компания 3', count: 1540 },
  { name: 'Компания 4', count: 750 },
  { name: 'Компания 5', count: 2100 },
];

export const weeklyWinners = [
  { rank: 1, number: '992901234567', answersCount: 245, points: 2450, prize: '1000 сомони', operator: 'Tcell' },
  { rank: 2, number: '992917654321', answersCount: 238, points: 2380, prize: '500 сомони', operator: 'Мегафон' },
  { rank: 3, number: '992931112233', answersCount: 215, points: 2150, prize: '300 сомони', operator: 'Babilon' },
  { rank: 4, number: '992941234567', answersCount: 198, points: 1980, prize: '200 сомони', operator: 'Zet-Mobile' },
  { rank: 5, number: '992901111222', answersCount: 185, points: 1850, prize: '100 сомони', operator: 'Tcell' },
];

export const loginHistory = [
  { id: 1, username: 'admin', fullName: 'Главный администратор', loginTime: '2026-01-28 14:30:25', ip: '192.168.1.105', device: 'Windows 10 - Chrome', status: 'success', logoutTime: '2026-01-28 16:45:10' },
  { id: 2, username: 'admin', fullName: 'Главный администратор', loginTime: '2026-01-28 09:15:42', ip: '192.168.1.105', device: 'Windows 10 - Chrome', status: 'success', logoutTime: '2026-01-28 12:30:15' },
  { id: 3, username: 'moderator', fullName: 'Модератор', loginTime: '2026-01-27 18:20:33', ip: '192.168.1.108', device: 'macOS - Safari', status: 'success', logoutTime: '2026-01-27 20:15:00' },
  { id: 4, username: 'admin', fullName: 'Главный администратор', loginTime: '2026-01-27 10:05:12', ip: '192.168.1.105', device: 'Windows 10 - Chrome', status: 'failed', logoutTime: null },
];

export const questionStats = [
  { id: 1, question: 'Столица Таджикистана?', timesAsked: 1250, correctRate: 92, avgResponseTime: 8, lastAsked: '2026-01-28', daysAgo: 0 },
  { id: 2, question: 'Сколько континентов на Земле?', timesAsked: 980, correctRate: 78, avgResponseTime: 12, lastAsked: '2026-01-21', daysAgo: 7 },
  { id: 3, question: 'В каком году основана ООН?', timesAsked: 850, correctRate: 65, avgResponseTime: 15, lastAsked: '2026-01-20', daysAgo: 8 },
  { id: 4, question: 'Самая высокая гора в мире?', timesAsked: 1420, correctRate: 88, avgResponseTime: 9, lastAsked: '2026-01-26', daysAgo: 2 },
  { id: 5, question: 'Валюта Таджикистана?', timesAsked: 2100, correctRate: 95, avgResponseTime: 6, lastAsked: '2026-01-28', daysAgo: 0 },
];

export const conversionData = {
  totalVisitors: 15430, subscribed: 8245, active: 6892, unsubscribed: 1353, conversionRate: 53.4, retentionRate: 83.6
};

export const financialData = {
  totalRevenue: 412250, subscriptionRevenue: 380000, prizesIssued: 45000, operatingCosts: 125000, netProfit: 242250, monthlyGrowth: 15.8
};

export const lotteryParticipants = [
  { id: 1, number: '992901234567', operator: 'Tcell', regDate: '2026-01-15', type: 'both', quizRank: 1, quizPoints: 2450, tickets: ['TJ-20260119-00001', 'TJ-20260126-00003'], ticketSource: ['quiz_top3', 'quiz_top3'], status: 'active', weeklyWins: 3 },
  { id: 2, number: '992917654321', operator: 'Мегафон', regDate: '2026-01-15', type: 'both', quizRank: 2, quizPoints: 2380, tickets: ['TJ-20260119-00002', 'TJ-20260126-00007'], ticketSource: ['quiz_top3', 'quiz_top3'], status: 'active', weeklyWins: 2 },
  { id: 3, number: '992931112233', operator: 'Babilon', regDate: '2026-01-16', type: 'lottery', quizRank: null, quizPoints: 0, tickets: ['TJ-20260119-00005'], ticketSource: ['direct'], status: 'active', weeklyWins: 0 },
  { id: 4, number: '992941234567', operator: 'Zet-Mobile', regDate: '2026-01-17', type: 'quiz', quizRank: 3, quizPoints: 2150, tickets: ['TJ-20260126-00012'], ticketSource: ['quiz_top3'], status: 'active', weeklyWins: 1 },
  { id: 5, number: '992901111222', operator: 'Tcell', regDate: '2026-01-14', type: 'both', quizRank: 5, quizPoints: 1850, tickets: ['TJ-20260119-00009'], ticketSource: ['direct'], status: 'active', weeklyWins: 0 },
  { id: 6, number: '992927778899', operator: 'Мегафон', regDate: '2026-01-18', type: 'lottery', quizRank: null, quizPoints: 0, tickets: ['TJ-20260126-00015'], ticketSource: ['direct'], status: 'active', weeklyWins: 0 },
  { id: 7, number: '992935556677', operator: 'Babilon', regDate: '2026-01-19', type: 'both', quizRank: 8, quizPoints: 1200, tickets: ['TJ-20260126-00020'], ticketSource: ['direct'], status: 'suspended', weeklyWins: 0 },
];

export const lotteryDraws = [
  {
    id: 1, week: '2026-W03', drawDate: '2026-01-19', status: 'completed', totalParticipants: 3420, totalTickets: 4100,
    winners: [
      { place: 1, number: '992908887766', ticket: 'TJ-20260119-02145', prize: 25000, operator: 'Tcell' },
      { place: 2, number: '992914443322', ticket: 'TJ-20260119-01892', prize: 15000, operator: 'Мегафон' },
      { place: 3, number: '992932221100', ticket: 'TJ-20260119-03001', prize: 10000, operator: 'Babilon' },
    ]
  },
  {
    id: 2, week: '2026-W04', drawDate: '2026-01-26', status: 'upcoming', totalParticipants: 3850, totalTickets: 4620,
    winners: []
  },
];

export const ticketLog = [
  { id: 1, number: '992901234567', ticket: 'TJ-20260126-00003', source: 'quiz_top3', reason: 'Викторина: 1 место (неделя W04)', date: '2026-01-26 20:05', week: 'W04' },
  { id: 2, number: '992917654321', ticket: 'TJ-20260126-00007', source: 'quiz_top3', reason: 'Викторина: 2 место (неделя W04)', date: '2026-01-26 20:05', week: 'W04' },
  { id: 3, number: '992941234567', ticket: 'TJ-20260126-00012', source: 'quiz_top3', reason: 'Викторина: 3 место (неделя W04)', date: '2026-01-26 20:05', week: 'W04' },
  { id: 4, number: '992931112233', ticket: 'TJ-20260119-00005', source: 'direct', reason: 'Прямая регистрация через SMS "LOTTERY"', date: '2026-01-16 14:30', week: 'W03' },
  { id: 5, number: '992901111222', ticket: 'TJ-20260119-00009', source: 'direct', reason: 'Прямая регистрация через USSD *777#', date: '2026-01-14 10:15', week: 'W03' },
  { id: 6, number: '992927778899', ticket: 'TJ-20260126-00015', source: 'direct', reason: 'Прямая регистрация через SMS "LOTTERY"', date: '2026-01-18 16:45', week: 'W04' },
  { id: 7, number: '992901234567', ticket: 'TJ-20260119-00001', source: 'quiz_top3', reason: 'Викторина: 1 место (неделя W03)', date: '2026-01-19 20:05', week: 'W03' },
  { id: 8, number: '992917654321', ticket: 'TJ-20260119-00002', source: 'quiz_top3', reason: 'Викторина: 2 место (неделя W03)', date: '2026-01-19 20:05', week: 'W03' },
];

export const initialSystemSettings = {
  quiz_active: true,
  points_per_question: 10,
  max_questions_per_day: 50,
  subscription_cost: 5.00,
  prize_first: 1000,
  prize_second: 500,
  prize_third: 300,
  sms_question_template: 'Вопрос викторины: {question}\n1-{opt1} 2-{opt2} 3-{opt3} 4-{opt4}',
  sms_correct_template: 'Правильно! +{points} баллов. Всего: {total}',
  sms_wrong_template: 'Неправильно. Правильный ответ: {correct}',
  operators: {
    Tcell: { active: true, shortcode: '1234' },
    Мегафон: { active: true, shortcode: '5678' },
    Babilon: { active: true, shortcode: '9012' },
    ZetMobile: { active: false, shortcode: '3456' }
  }
};

export const initialLotterySettings = {
  lottery_active: true,
  quiz_active: true,
  shortcode: '7777',
  ussd_code: '*777#',
  keyword_lottery_only: 'LOTTERY',
  keyword_quiz_only: 'QUIZ',
  keyword_both: 'ALL',
  ticket_prefix: 'TJ',
  ticket_length: 8,
  draw_day: 'sunday',
  draw_time: '20:00',
  auto_ticket_for_top3: true,
  weekly_ticket_repeat: true,
  max_tickets_per_draw: 1,
  lottery_prize_pool: 50000,
  lottery_prizes: [
    { place: 1, amount: 25000, label: 'Главный приз' },
    { place: 2, amount: 15000, label: '2-е место' },
    { place: 3, amount: 10000, label: '3-е место' },
  ],
};