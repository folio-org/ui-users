import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import LimitsSettings from './LimitsSettings';

jest.unmock('@folio/stripes/components');

const resources = {
  query: {},
  groups: {
    hasLoaded: true,
    failedMutations: [],
    records: [
      {
        group: 'faculty',
        desc: 'Faculty Member',
        id: '503a81cd-6c26-400f-b620-14c08943697c',
        expirationOffsetInDays: 365,
        metadata: {
          createdDate: '2021-10-07T03:22:12.841+00:00',
          updatedDate: '2021-10-07T03:22:12.841+00:00',
        },
      },
      {
        group: 'graduate',
        desc: 'Graduate Student',
        id: 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
        metadata: {
          createdDate: '2021-10-07T03:22:12.869+00:00',
          updatedDate: '2021-10-07T03:22:12.869+00:00',
        },
      },
      {
        group: 'staff',
        desc: 'Staff Member',
        id: '3684a786-6671-4268-8ed0-9db82ebca60b',
        expirationOffsetInDays: 730,
        metadata: {
          createdDate: '2021-10-07T03:22:12.808+00:00',
          updatedDate: '2021-10-07T03:22:12.808+00:00',
        },
      },
      {
        group: 'undergrad',
        desc: 'Undergraduate Student',
        id: 'bdc2b6d4-5ceb-4a12-ab46-249b9a68473e',
        metadata: {
          createdDate: '2021-10-07T03:22:12.884+00:00',
          updatedDate: '2021-10-07T03:22:12.884+00:00',
        },
      },
    ],
    resource: 'groups',
    successfulMutations: [],
    throwErrors: true,
    httpStatus: 200,
    module: '@folio/users',
    other: {
      totalrecords: 4,
    },
  },
  patronBlockCondition: {
    hasLoaded: true,
    failedMutations: [],
    resource: 'patronBlockCondition',
    successfulMutations: [],
    throwErrors: true,
    httpStatus: 200,
    module: '@folio/users',
    other: {
      totalrecords: 6,
    },
    records: [
      {
        id: '3d7c52dc-c732-4223-8bf8-e5917801386f',
        name: 'Maximum number of items charged out',
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        valueType: 'Integer',
        message: '',
      },
      {
        id: '72b67965-5b73-4840-bc0b-be8f3f6e047e',
        name: 'Maximum number of lost items',
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        valueType: 'Integer',
        message: '',
      },
      {
        id: '584fbd4f-6a34-4730-a6ca-73a6a6a9d845',
        name: 'Maximum number of overdue items',
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        valueType: 'Integer',
        message: '',
      },
      {
        id: 'e5b45031-a202-4abb-917b-e1df9346fe2c',
        name: 'Maximum number of overdue recalls',
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        valueType: 'Integer',
        message: '',
      },
      {
        id: 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a',
        name: 'Maximum outstanding fee/fine balance',
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        valueType: 'Double',
        message: '',
      },
      {
        id: '08530ac4-07f2-48e6-9dda-a97bc2bf7053',
        name: 'Recall overdue by maximum number of days',
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        valueType: 'Integer',
        message: '',
      },
    ],
  },
  patronBlockLimits: {
    hasLoaded: true,
    failedMutations: [],
    resource: 'patronBlockLimits',
    successfulMutations: [],
    throwErrors: true,
    httpStatus: 200,
    module: '@folio/users',
    other: {
      totalrecords: 6,
    },
    records: [],
  },
};

const props = {
  resources,
  match: { path: '/settings/users/limits' },
  location: { pathname: '/settings/users/limits' },
};

const renderLimitsSettings = () => renderWithRouter(<LimitsSettings {...props} />);

describe('LimitsSettings', () => {
  it('show if component renders data with no inital values', () => {
    const { debug } = renderLimitsSettings();
    debug();
  });
});
