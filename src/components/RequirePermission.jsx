import React from 'react';
import { useAccess } from '../utils/permissions';
import NoAccess from './NoAccess';

// Защита маршрута: при прямом переходе по адресу без права показываем «Нет доступа».
// permission — код права или массив (нужны все сразу)
const RequirePermission = ({ permission, superadminOnly, children }) => {
  const { can, superadmin } = useAccess();
  const required = [].concat(permission ?? []);
  const allowed = superadminOnly ? superadmin : required.every(can);
  return allowed ? children : <NoAccess />;
};

export default RequirePermission;
