import { FormattedMessage } from 'react-intl';

export const validateLength = (errorMessageKey, maxLen = 300) => value => (value?.length > maxLen ? <FormattedMessage id={errorMessageKey} /> : null);
