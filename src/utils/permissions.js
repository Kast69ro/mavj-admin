import { useSelector } from 'react-redux';
import { operatorName } from './operatorColors';

// У суперадмина (роль it) список permissions пустой — ему доступно всё
export const isSuperadmin = (user) => Boolean(user?.is_superadmin || user?.role === 'it');

export const hasPermission = (user, permission) =>
  !permission || isSuperadmin(user) || Boolean(user?.permissions?.includes(permission));

// Операторы, чьи данные видны пользователю. Пустой массив — видны все
const NO_LIMIT = [];
export const getAllowedOperators = (user) =>
  isSuperadmin(user) || !user?.operators?.length ? NO_LIMIT : user.operators;

// Скрытие на фронте — только для удобства: сервер проверяет права сам и отвечает 403
export const useAccess = () => {
  const user = useSelector((state) => state.auth.user);
  const operatorsInfo = useSelector((state) => state.operators.info);

  const allowedOperators = getAllowedOperators(user);
  const singleOperator = allowedOperators.length === 1 ? allowedOperators[0] : null;

  return {
    user,
    superadmin: isSuperadmin(user),
    can: (permission) => hasPermission(user, permission),
    allowedOperators,
    isOperatorAllowed: (code) => allowedOperators.length === 0 || allowedOperators.includes(code),
    singleOperator,
    singleOperatorName: singleOperator
      ? operatorsInfo?.find((o) => o.code === singleOperator)?.name ?? operatorName(singleOperator)
      : null,
  };
};
