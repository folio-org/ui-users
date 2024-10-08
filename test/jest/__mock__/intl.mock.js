import React from 'react';

jest.mock('react-intl', () => {
  const intl = {
    formatMessage: ({ id }) => id,
    formatNumber: (value) => value,
    formatTime: (value) => value,
    formatDisplayName: (value) => value,
    formatDate: (value) => value,
    formatDateToParts: jest.fn(() => ([
      {
        'type': 'month',
        'value': '7'
      },
      {
        'type': 'literal',
        'value': '/'
      },
      {
        'type': 'day',
        'value': '31'
      },
      {
        'type': 'literal',
        'value': '/'
      },
      {
        'type': 'year',
        'value': '2024'
      }
    ]
    )),
  };

  return {
    ...jest.requireActual('react-intl'),
    FormattedMessage: jest.fn(({ id, children }) => {
      if (children) {
        return children([id]);
      }

      return id;
    }),
    FormattedTime: jest.fn(({ value, children }) => {
      if (children) {
        return children([value]);
      }

      return value;
    }),
    FormattedDate: jest.fn(({ value, children }) => {
      if (children) {
        return children([value]);
      }

      return value;
    }),
    useIntl: () => intl,
    injectIntl: (Component) => (props) => <Component {...props} intl={intl} />,
  };
});
