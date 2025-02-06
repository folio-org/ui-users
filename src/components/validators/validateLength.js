import { FormattedMessage } from 'react-intl';

const DEFAULT_MAX_CHAR_LEN = 300;

export const validateLength = (errorMessageKey, maxLen = DEFAULT_MAX_CHAR_LEN) => value => (value?.length > maxLen ? <FormattedMessage id={errorMessageKey} /> : null);
