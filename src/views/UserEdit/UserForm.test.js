import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import { FormattedMessage } from 'react-intl';
import buildStripes from '__mock__/stripes.mock';

import '__mock__/stripesComponents.mock';
import '__mock__/stripesSmartComponent.mock';

import UserForm, { validate } from './UserForm';

jest.mock('react-redux', () => ({
  connect: () => (ReactComponent) => ReactComponent,
}));

jest.unmock('@folio/stripes/components');

jest.mock('../../components/EditSections', () => ({
  EditExtendedInfo: () => 'EditExtendedInfo',
  EditUserInfo: () => 'EditUserInfo',
  EditContactInfo:() => 'EditContactInfo',
  EditProxy: () => 'EditProxy',
  EditServicePoints:() => 'EditServicePoints',
}));

jest.mock('@folio/stripes/smart-components', () => ({
  EditCustomFieldsRecord: () => 'EditCustomFieldsRecord',
}));
describe('validate', () => {
  it('validates correctly-shaped data', () => {
    const result = validate({
      personal: {
        lastName: 'lastName',
        preferredContactTypeId: 'preferredContactTypeId',
        addresses: [
          { addressType: 'addressType' },
        ],
      },
      username: 'username',
      creds: {
        password: 'password',
      },
      patronGroup: 'patronGroup',
      servicePoints: ['a', 'b'],
      preferredServicePoint: 'preferredServicePoint',
    });

    expect(result.personal).toMatchObject({ addresses: [{}] });
    expect(result.personal.addresses.length).toBe(1);
  });

  describe('returns errors if required fields are missing', () => {
    it('requires personal', () => {
      const result = validate({});
      expect(result.personal.lastName).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredField" />);
    });

    it('requires personal.lastName', () => {
      const result = validate({ personal: {} });
      expect(result.personal.lastName).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredField" />);
    });

    it('requires personal.preferredContactTypeId', () => {
      const result = validate({ personal: {} });
      expect(result.personal.preferredContactTypeId).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredContactType" />);
    });

    it('requires username when password is present', () => {
      const result = validate({ creds: { password: 'thunder-chicken' } });
      expect(result.username).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredUsername" />);
    });

    it('requires patronGroup', () => {
      const result = validate({ });
      expect(result.patronGroup).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredPatronGroup" />);
    });

    it('requires personal.addresses to have an addressType', () => {
      const result = validate({ personal: { addresses: [{ 'monkey': 'bagel' }] } });
      expect(result.personal.addresses[0].addressType).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredAddressType" />);
    });

    it('requires a preferred service point when service points are assigned', () => {
      const result = validate({ servicePoints: ['a', 'b', 'c'] });
      expect(result.preferredServicePoint).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredPreferredServicePoint" />);
    });
  });
});


describe('UserForm', () => {
  const props = {
    stripes: buildStripes({ hasPerm: jest.fn().mockReturnValue(true) }),
    match: { params: { id: 'mock-match-params-id' } },
    formData: {
      patronGroups: [{ id:'22', name:'sjdfg' }],
      departments : [{
        id: 'testId1',
        code: 'testCode1',
        name: 'testDepartmentName',
      }],
    },
    initialValues: {
      id: 'id',
      creds: {
        password: 'password',
      },
      personal: {
        lastName: 'lastName',
        preferredContactTypeId: 'preferredContactTypeId',
        addresses: [
          { addressType: 'addressType' },
        ],
      },
      preferredServicePoint: 'preferredServicePoint',
      username: 'username',
    },
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
    uniquenessValidator: {
      reset: jest.fn(),
      GET: jest.fn(),
    }
  };

  const renderUserForm = () => {
    return renderWithRouter(
      <UserForm {...props} />
    );
  };

  it('should render UserForm', () => {
    renderUserForm();
    const EditUserText = screen.getByText(/EditUserInfo/i);
    expect(EditUserText).toBeInTheDocument();
  });
});

describe('should render getProxySponsorWarning props', () => {
  const mockForm = {
    mutators: { setFieldData: jest.fn() }
  };
  const props = {
    stripes: buildStripes({ hasPerm: jest.fn().mockReturnValue(true) }),
    match: { params: { id: 'mock-match-params-id' } },
    mockForm,
    formData: {
      patronGroups: [{ id:'22', name:'sjdfg' }],
    },
    initialValues: {
      preferredContactTypeId:'test',
      personal: {
        lastName: 'lastName',
      },
      sponsors: [
        { name: 'Johny', age: 25, address: '123 St' },
        { name: 'Jay', age: 30, address: '456 St' },
      ],
      proxies: [
        { name: 'Boby', age: 35, address: '789 St', status: {} },
        { name: 'Aly', age: 40, address: '321 St', status: {} },
      ],
    },
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
    uniquenessValidator: {
      reset: jest.fn(),
      GET: jest.fn(),
    }
  };

  const renderUserFormSetup = () => {
    return renderWithRouter(
      <UserForm {...props} />
    );
  };

  it('should render UserForm with namespace props', () => {
    renderUserFormSetup();
    const closeButton = screen.getByRole('button', { name: 'ui-users.cancel' });
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);
    expect(props.onCancel).toHaveBeenCalled();
  });
});
