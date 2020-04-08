/* eslint-disable import/prefer-default-export */

export function getPermissionLabelString(permission, formatMessage, showRaw) {
  const { permissionName } = permission;
  const displayName = permission.displayName ?? permissionName;

  const [pPrefix, ...pName] = permissionName.split('.');
  const i18nKey = `${pPrefix}.permission.${pName.join('.')}`;
  const label = formatMessage({ id: i18nKey, defaultMessage: displayName });

  return showRaw ? `${permissionName} (${label})` : label;
}
