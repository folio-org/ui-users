import { screen } from '@folio/jest-config-stripes/testing-library/react';
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
  departments: PropTypes.arrayOf(PropTypes.shape({})),
};

jest.mock('./DepartmentsNameEdit', () => DepartmentsName);

const RequestPreferencesEditMock = ({ addressTypes }) => {
  return addressTypes.map((dep) => {
    return <><div>{dep.id}</div><div>{dep.addressType}</div></>;
  });
};

RequestPreferencesEditMock.propTypes = {
  addressTypes: PropTypes.arrayOf(PropTypes.shape({})),
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
});
