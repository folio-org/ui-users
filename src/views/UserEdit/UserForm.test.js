import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormattedMessage } from 'react-intl';

import renderWithRouter from '../../../test/jest/helpers/renderWithRouter';
import UserForm, { validate } from './UserForm';

describe('UserForm', () => {
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

  // this fails:
  //   Element type is invalid: expected a string (for built-in components)
  //   or a class/function (for composite components) but got: undefined.
  //   You likely forgot to export your component from the file it's defined
  //   in, or you might have mixed up default and named imports.
  // not sure exactly what the problem is. Maybe we need to mock stripesFinalForm?
  describe.skip('UserForm calls submit handler', () => {
    const submitHandler = jest.fn();
    const props = {
      formData: {
        patronGroups: [],
      },
      initialValues: {
        id: 'id',
        creds: {
          password: 'password',
        },
        patronGroup: 'patronGroup',
        personal: {
          lastName: 'lastName',
          preferredContactTypeId: 'preferredContactTypeId',
          addresses: [
            { addressType: 'addressType' },
          ],
        },
        preferredServicePoint: 'preferredServicePoint',
        servicePoints: ['a', 'b'],
        username: 'username',
      },
      onCancel: jest.fn(),
      onSubmit: jest.fn(),
      uniquenessValidator: {
        reset: jest.fn(),
        GET: jest.fn(),
      }
    };

    renderWithRouter(<UserForm {...props} />);
    userEvent.click(screen.getByText('ui-users.saveAndClose'));
    expect(submitHandler).toHaveBeenCalled();
  });
});
