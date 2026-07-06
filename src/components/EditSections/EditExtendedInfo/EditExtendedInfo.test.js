import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Form } from 'react-final-form';
import PropTypes from 'prop-types';

import buildStripes from '__mock__/stripes.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import { USER_TYPES } from '../../../constants';
import EditExtendedInfo from './EditExtendedInfo';

jest.unmock('@folio/stripes/components');

const onSubmit = jest.fn();

const arrayMutators = {
  concat: jest.fn(),
  move: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  removeBatch: jest.fn(),
  shift: jest.fn(),
  swap: jest.fn(),
  unshift: jest.fn(),
  update: jest.fn()
};

const renderEditExtendedInfo = (props, initialValues) => {
  const component = () => (
    <>
      <EditExtendedInfo {...props} />
    </>
  );

  return renderWithRouter(
    <Form
      id="form-user"
      mutators={{
        ...arrayMutators
      }}
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={component}
    />
  );
};

const changeMock = jest.fn();

const props = {
  accordionId: 'EditContactInfo',
  expanded: true,
  onToggle: jest.fn(),
  addressTypes: [{
    addressType: 'Home',
    id: '123123'
  },
  {
    addressType: 'Work',
    id: '123123132'
  }],
  userId: 'testid123',
  userEmail: 'test@test.ccom',
  userFirstName: 'testFname',
  username: 'testName',
  change: changeMock,
  departments: [{
    id: 'testId1',
    code: 'testCode1',
    name: 'testDepartmentName',
  }],
  values: {},
  uniquenessValidator: {},
  stripes: buildStripes(),
};
const DepartmentsName = ({ departments }) => {
  return departments.map((dep) => {
    return <><div>{dep.id}</div><div>{dep.name}</div></>;
  });
};

DepartmentsName.propTypes = {
  departments: PropTypes.arrayOf(PropTypes.object),
};

jest.mock('./DepartmentsNameEdit', () => DepartmentsName);

const RequestPreferencesEditMock = ({ addressTypes }) => {
  return addressTypes.map((dep) => {
    return <><div>{dep.id}</div><div>{dep.addressType}</div></>;
  });
};

RequestPreferencesEditMock.propTypes = {
  addressTypes: PropTypes.arrayOf(PropTypes.object),
};

jest.mock('./RequestPreferencesEdit', () => RequestPreferencesEditMock);

const CreateResetPasswordControlMock = ({ email, userId }) => {
  return <><div>{email}</div><div>{userId}</div></>;
};

CreateResetPasswordControlMock.propTypes = {
  email: PropTypes.string,
  userId: PropTypes.string,
};

jest.mock('./CreateResetPasswordControl', () => CreateResetPasswordControlMock);

describe('Render Extended User Information component', () => {
  it('Must be rendered', () => {
    renderEditExtendedInfo(props);
    expect(screen.getByText('ui-users.extended.folioNumber')).toBeInTheDocument();
  });
  it('Must show all departments', () => {
    renderEditExtendedInfo(props);
    expect(screen.getByText('testDepartmentName')).toBeInTheDocument();
  });
  it('Must show all Addresses', () => {
    renderEditExtendedInfo(props);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('123123132')).toBeInTheDocument();
  });
  it('Must show all reset password', () => {
    renderEditExtendedInfo(props);
    expect(screen.getByText('test@test.ccom')).toBeInTheDocument();
  });
  it('should fields to be disabled', () => {
    renderEditExtendedInfo({ ...props, disabled: true });
    expect(screen.getAllByRole('textbox')[0]).toBeDisabled();
  });

  describe('Username field', () => {
    it('should be required for users with the \'staff\' type in ECS mode', () => {
      renderEditExtendedInfo(
        {
          ...props,
          stripes: {
            ...props.stripes,
            hasInterface: () => true,
          },
        },
        { type: USER_TYPES.STAFF }
      );

      expect(screen.getByRole('textbox', { name: 'ui-users.information.username' })).toBeRequired();
    });

    it('should NOT be required if user type is other than \'staff\' in ECS mode', () => {
      renderEditExtendedInfo(
        {
          ...props,
          stripes: {
            ...props.stripes,
            hasInterface: () => true,
          },
        },
        { type: USER_TYPES.PATRON }
      );

      expect(screen.getByRole('textbox', { name: 'ui-users.information.username' })).not.toBeRequired();
    });

    it('should NOT be required in default mode (non ECS)', () => {
      renderEditExtendedInfo(
        {
          ...props,
          stripes: {
            ...props.stripes,
            hasInterface: (i) => i !== 'consortia',
          },
        },
        { type: USER_TYPES.STAFF }
      );

      expect(screen.getByRole('textbox', { name: 'ui-users.information.username' })).not.toBeRequired();
    });
  });

  describe('Username uniqueness validation', () => {
    let uniquenessValidator;
    let user;

    // The username field's async validation is debounced (see AsyncValidateField,
    // default wait = 300ms). Fake timers let us fast-forward past that window
    // instead of waiting in real time. `advanceTimersByTimeAsync` also flushes
    // the microtasks in between, so the mocked `GET` promise gets a chance to
    // resolve. Because the debounced/memoized validator only re-evaluates when
    // the field's value actually changes, briefly appending then removing a
    // character forces it to pick up the (by-then-resolved) async result.
    // Finally, blur the field so final-form marks it `touched` - TextField only
    // renders an error once touched.
    const triggerRevalidation = async () => {
      await jest.advanceTimersByTimeAsync(400);
      const usernameField = screen.getByRole('textbox', { name: 'ui-users.information.username' });
      await user.type(usernameField, 'X{backspace}');
      await user.tab();
    };

    beforeEach(() => {
      jest.useFakeTimers();
      user = userEvent.setup({ delay: null, advanceTimers: jest.advanceTimersByTime });
      uniquenessValidator = {
        GET: jest.fn(),
        reset: jest.fn(),
      };
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show an error message when the entered username already exists', async () => {
      uniquenessValidator.GET.mockResolvedValue([{ username: 'newUsername' }]);

      renderEditExtendedInfo({
        ...props,
        uniquenessValidator,
      }, { username: 'testName' });

      const usernameField = screen.getByRole('textbox', { name: 'ui-users.information.username' });

      await user.clear(usernameField);
      await user.type(usernameField, 'newUsername');

      await triggerRevalidation();

      await waitFor(() => {
        expect(screen.getByText('ui-users.errors.usernameUnavailable')).toBeInTheDocument();
      });

      expect(uniquenessValidator.reset).toHaveBeenCalled();
      expect(uniquenessValidator.GET).toHaveBeenCalledWith({ params: { query: '(username=="newUsername")' } });
    });

    it('should NOT show an error message when the entered username is available', async () => {
      uniquenessValidator.GET.mockResolvedValue([]);

      renderEditExtendedInfo({
        ...props,
        uniquenessValidator,
      }, { username: 'testName' });

      const usernameField = screen.getByRole('textbox', { name: 'ui-users.information.username' });

      await user.clear(usernameField);
      await user.type(usernameField, 'availableUsername');

      await triggerRevalidation();

      await waitFor(() => {
        expect(uniquenessValidator.GET).toHaveBeenCalled();
      });

      expect(screen.queryByText('ui-users.errors.usernameUnavailable')).not.toBeInTheDocument();
    });

    it('should NOT call the validator when the username is empty', async () => {
      renderEditExtendedInfo({
        ...props,
        uniquenessValidator,
      }, { username: 'testName' });

      const usernameField = screen.getByRole('textbox', { name: 'ui-users.information.username' });

      await user.clear(usernameField);

      await triggerRevalidation();

      expect(uniquenessValidator.GET).not.toHaveBeenCalled();
    });

    it('should NOT call the validator when the username matches its initial value', async () => {
      renderEditExtendedInfo({
        ...props,
        uniquenessValidator,
      }, { username: 'testName' });

      const usernameField = screen.getByRole('textbox', { name: 'ui-users.information.username' });

      await user.click(usernameField);

      await triggerRevalidation();

      expect(uniquenessValidator.GET).not.toHaveBeenCalled();
    });
  });
});
