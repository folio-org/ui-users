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
export function showErrorCallout(res, sendCallout) {
  res.text()
    .then(body => {
      sendCallout({
        type: 'error',
        timeout: 0,
        message: (
          <div>
            <div><strong><FormattedMessage id="ui-users.errors.permissionChangeFailed" /></strong></div>
            <div>{body}</div>
          </div>
        )
      });
    });
}
