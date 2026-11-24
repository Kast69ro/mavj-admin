import React from 'react';
import { Lock } from 'lucide-react';

const NoAccess = ({ message = 'У вашей роли нет прав на этот раздел. Если доступ нужен — обратитесь к администратору.' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center max-w-lg mx-auto mt-10">
    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <Lock size={24} className="text-gray-400" />
    </div>
    <h2 className="text-xl font-bold text-gray-800 mb-1">Нет доступа</h2>
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default NoAccess;
