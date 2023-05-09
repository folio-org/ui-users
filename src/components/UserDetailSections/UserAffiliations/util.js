import { FormattedMessage } from 'react-intl';
import { AFFILIATION_ERROR_CODES } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const getResponseErrors = async (response) => {
  if (!response || response === [] || response === {}) return [];

  if (Array.isArray(response)) {
    const allRejectedResponses = response.map(res => res.value.filter(i => i.status === 'rejected')).flat();
    const errorsAsJson = await Promise.all(allRejectedResponses.map((i) => i.reason.response.json()));
    return errorsAsJson?.map((i) => i.errors).flat();
  }

  if (response.status === 'rejected') {
    return response.reason?.response?.json();
  }

  return [];
};


export function extractTenantNameFromErrorMessage(errorMessage) {
  // If message includes tenant and find the tenant name in the error message and the word next to it.
  const extractedMessage = errorMessage.match(/tenant (.*?)(?:\s|$)/g);
  if (!extractedMessage) return '';
  // Remove all non-alphanumeric characters from the tenant name.
  const tenant = extractedMessage[0]?.split(' ')[1].replace(/\W/g, '');
  return tenant;
}

export function createErrorMessage({ message, code, userName }) {
  const errorMessageId = AFFILIATION_ERROR_CODES[code];
  if (!errorMessageId) return message;

  const tenantName = extractTenantNameFromErrorMessage(message);

  if (!tenantName) return message;

  const formattedError = <FormattedMessage
    id={`ui-users.affiliations.manager.modal.changes.error.${errorMessageId}`}
    values={{
      tenantName,
      userName,
    }}
  />;

  return formattedError;
}
