import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      onLogin({ username: 'admin', fullName: 'Главный администратор', role: 'admin' });
    } else {
      setLoginError('Неверный логин или пароль');
    }
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Панель управления</h1>
            <p className="text-gray-500">SMS Викторина &amp; Лотерея</p>
          </div>

          <div className="space-y-5">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Логин</label>
              <input
                type="text"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите логин"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <input
                type="password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите пароль"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full text-white py-3 rounded-lg font-semibold transition"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {isLoading ? 'Вход...' : 'Войти в систему'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Логин: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin</span>{' '}
            | Пароль: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;