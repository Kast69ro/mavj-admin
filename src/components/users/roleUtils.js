// Пароль, который сервер ставит новому пользователю; при первом входе его обязательно сменить
export const DEFAULT_PASSWORD = 'Mavj-2026';

export const roleName = (role) => role?.name_ru ?? role?.role_name ?? role?.name ?? role?.code ?? '';

export const isSuperRole = (role) => Boolean(role && (role.code === 'it' || role.is_superadmin));

export const permissionLabel = (permissions, code) => permissions.find((p) => p.code === code)?.label_ru ?? code;
