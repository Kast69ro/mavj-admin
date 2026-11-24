import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import ContentModal from './ContentModal';
import ChangePasswordForm from './ChangePasswordForm';

// Меню профиля (имя справа вверху)
const ProfileMenu = ({ dark }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const name = user?.full_name || user?.username || 'Пользователь';

  const openPassword = () => {
    setOpen(false);
    setChanged(false);
    setPasswordOpen(true);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition ${
          dark ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className={`text-left ${dark ? 'hidden sm:block' : ''}`}>
          <span className="block font-medium leading-tight max-w-[180px] truncate">{name}</span>
          {user?.role_name && (
            <span className={`block text-xs leading-tight ${dark ? 'text-slate-400' : 'text-gray-400'}`}>
              {user.role_name}
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-40 text-gray-700">
          <button
            type="button"
            onClick={openPassword}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
          >
            <KeyRound size={16} className="text-gray-400" /> Сменить пароль
          </button>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
          >
            <LogOut size={16} className="text-gray-400" /> Выход
          </button>
        </div>
      )}

      {passwordOpen && createPortal(
        <ContentModal title="Сменить пароль" onClose={() => setPasswordOpen(false)} size="sm">
          {changed ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
              <p className="text-sm text-gray-700">Пароль изменён</p>
              <button
                onClick={() => setPasswordOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <ChangePasswordForm onSuccess={() => setChanged(true)} />
          )}
        </ContentModal>,
        document.body
      )}
    </div>
  );
};

export default ProfileMenu;
