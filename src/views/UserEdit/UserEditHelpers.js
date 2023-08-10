import { FormattedMessage } from 'react-intl';

export function resourcesLoaded(obj, exceptions = []) {
  for (const resource in obj) {
    if (!exceptions.includes(resource)) {
      if (Object.prototype.hasOwnProperty.call(obj, resource)) {
        if (obj[resource] === null) {
          return false;
        }
        if (typeof obj[resource] === 'object') {
          if (Object.prototype.hasOwnProperty.call(obj[resource], 'isPending')) {
            if (obj[resource].isPending) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
}

/**
 * showErrorCallout
 * Show an error in a callout.
 * Set the timeout to 0 so it must be manually dismissed.
 *
 * @param {object} res HTTP response object from a rejected Promise
 * @param {function} sendCallout function reference, likely this.context.sendCallout
 */
export async function showErrorCallout(res, sendCallout) {
  const calloutOptions = { type: 'error', timeout: 0 };
  try {
    const contentType = res.headers.get('content-type');
    let errorMessage = '';

    if (contentType?.includes('application/json')) {
      const json = await res.json();
      errorMessage = json?.errors?.map(e => e.message)?.join(', ');
    } else {
      errorMessage = await res.text();
    }

    const isUserExists = errorMessage?.includes('username already exists');
    const messageId = isUserExists ? 'ui-users.errors.usernameUnavailable' : 'ui-users.errors.permissionChangeFailed';

    sendCallout({
      ...calloutOptions,
      message: (
        <div>
          <div><strong><FormattedMessage id={messageId} /></strong></div>
          <div>{!isUserExists && errorMessage}</div>
        </div>
      )
    });
  } catch (error) {
    sendCallout({
      ...calloutOptions,
      message: <div><strong><FormattedMessage id="ui-users.errors.generic" /></strong></div>,
    });
  }
}
