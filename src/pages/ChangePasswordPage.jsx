import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRound, LogOut } from 'lucide-react';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { Role } from '../features/auth/authApi';
import { logout } from '../features/auth/authSlice';

// Обязательная смена пароля: показывается вместо админки, пока пароль не сменён
const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-amber-100 flex items-center justify-center">
            <KeyRound size={28} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Смените пароль</h1>
          <p className="text-sm text-gray-500">
            {user?.full_name || user?.username ? `${user.full_name || user.username}, чтобы` : 'Чтобы'} продолжить
            работу, задайте свой пароль.
          </p>
        </div>
        <ChangePasswordForm onSuccess={() => dispatch(Role())} />
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-800"
        >
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
