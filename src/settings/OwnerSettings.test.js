import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import { buildResources } from 'helpers/buildResources';
import OwnerSettings from './OwnerSettings';


jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderOwnerSettings = (props) => renderWithRouter(<OwnerSettings {...props} />);

const owner = [
  {
    id: 'dd80553c-dfae-46fb-aabc-081ae4de134e',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test',
    servicePointOwner: [
      {
        label: 'Circ Desk 2',
        value: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
      }
    ]
  },
  {
    id: '6b3884f3-8066-47a7-b44e-5adcd6350d61',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test2',
    servicePointOwner: []
  }
];
const resources = buildResources({
  resourceName: 'values',
  records: owner
});

const localResources = {
  ownerServicePoints: {
    module: '@folio/users',
    records: [
      {
        servicepoints: [{
          code: 'Online',
          discoveryDisplayName: 'Online',
          id: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
          locationIds: [],
          metadata: { createdDate: '2021-10-14T03:22:53.897+00:00', updatedDate: '2021-10-14T03:22:53.897+00:00' },
          name: 'Online',
          pickupLocation: false,
          shelvingLagTime: 0,
          staffSlips: [],
        },
        {
          code: 'cd2',
          discoveryDisplayName: 'Circulation Desk -- Back Entrance',
          holdShelfExpiryPeriod: { duration: 5, intervalId: 'Days' },
          id: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
          locationIds: [],
          metadata: { createdDate: '2021-10-14T03:22:53.906+00:00', updatedDate: '2021-10-14T03:22:53.906+00:00' },
          name: 'Circ Desk 2',
          pickupLocation: true,
          staffSlips: [],
        },
        {
          code: 'cd1',
          discoveryDisplayName: 'Circulation Desk -- Hallway',
          holdShelfExpiryPeriod: { duration: 3, intervalId: 'Weeks' },
          id: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
          locationIds: [],
          metadata: { createdDate: '2021-10-14T03:22:53.912+00:00', updatedDate: '2021-10-14T03:22:53.912+00:00' },
          name: 'Circ Desk 1',
          pickupLocation: true,
          staffSlips: [],
        }]
      }
    ],
    resource: 'ownerServicePoints',
  },
  owners: {
    records: owner,
    resource: 'owners',
  }
};

const mutator = {
  activeRecord: {
    replace: jest.fn(),
    update: jest.fn(),
  },
  refdataValues: {
    DELETE: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
  },
  updaterIds: {
    replace: jest.fn(),
    update: jest.fn(),
  },
  updaters:{
    DELETE: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
  },
  values:{
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
  }

};

const propData = {
  stripes: {
    connect: (Component) => props => <Component {...props} resources={resources} mutator={mutator} />,
    hasPerm: jest.fn().mockResolvedValue(true),
  },
  resources: localResources,
  match: { path: '/settings/users/asdf' },
  location: { pathname: '/settings/users/asdf' },
  intl: {},
  okapi: {
    url: 'https://folio-testing-okapi.dev.folio.org',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
  },
};

describe('Owner settings', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
    });
  });

  it('Component must be rendered', () => {
    renderOwnerSettings(propData);
    expect(screen.getByText('ui-users.owners.columns.desc')).toBeTruthy();
    expect(screen.getByText('ui-users.owners.columns.asp')).toBeTruthy();
  });

  it('Delete functionality in component', () => {
    renderOwnerSettings(propData);
    userEvent.click(document.querySelector('[id="clickable-delete-settings-owners-1"]'));
    userEvent.click(document.querySelector('[id="clickable-delete-controlled-vocab-entry-confirmation-cancel"]'));
    expect(document.querySelector('[data-test-confirmation-modal-message="true"]')).toBeTruthy();
  });

  // Alas, this is significantly a test of @folio/stripes/smart-components::ControlledVocab.
  // click the "add" button
  // wait for form elements to appear
  // fill out form elements
  // click the "save" button
  // wait for the "save" button to disappear
  it('Create and edit functionality', async () => {
    await act(async () => {
      renderOwnerSettings(propData);

      await userEvent.click(document.querySelector('[id="clickable-add-settings-owners"]'));
      await waitFor(() => {
        expect(screen.getByText('stripes-core.button.save')).toBeInTheDocument();
        expect(document.querySelector('[name="items[0].owner"]')).toBeInTheDocument();
      });

      await userEvent.type(document.querySelector('[name="items[0].owner"]'), 'tesst');
      await userEvent.click(document.querySelector('[id="multiselect-option-list-owner-service-point"] li:first-child'));
      await userEvent.click(screen.getByText('stripes-core.button.save'));

      await waitFor(() => {
        expect(screen.queryByText('stripes-core.button.save')).not.toBeInTheDocument();
      });
    });
  });
});
