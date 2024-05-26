import { screen, waitFor, act } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { within } from '@folio/jest-config-stripes/testing-library/dom';
import { Form } from 'react-final-form';

import { runAxeTest } from '@folio/stripes-testing';

import renderWithRouter from 'helpers/renderWithRouter';
import '../../../../test/jest/__mock__/matchMedia.mock';

import EditReadingRoomAccess from './EditReadingRoomAccess';

jest.unmock('@folio/stripes/components');

const unregisterFieldMock = jest.fn();
const rraFieldStateMock = {
  value: [
    {
      'id': '2205004b-ca51-4a14-87fd-938eefa8f5df',
      'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
      'readingRoomId': 'ea7ac988-ede1-466b-968c-46a770333b14',
      'readingRoomName': 'rr-4',
      'access': 'ALLOWED',
      'notes': 'Allowed for this reading room...',
      'metadata': {
        'createdDate': '2024-05-15 18:39:31',
        'createdByUserId': '21457ab5-4635-4e56-906a-908f05e9233b',
        'updatedDate': '2024-05-15 18:40:27',
        'updatedByUserId': '21457ab5-4635-4e56-906a-908f05e9233b'
      }
    }
  ]
};
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
const renderEditReadingRoomAccess = (props, initialValues) => {
  const component = () => (
    <>
      <EditReadingRoomAccess {...props} />
    </>
  );
  renderWithRouter(
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
const props = {
  expanded: true,
  onToggle: jest.fn(),
  accordionId: 'readingRoomAccess',
  form: {
    change: jest.fn(),
    registerField: jest.fn().mockReturnValue(unregisterFieldMock),
    getFieldState: jest.fn().mockReturnValue(rraFieldStateMock),
  },
  formData: [
    {
      'id': '2205004b-ca51-4a14-87fd-938eefa8f5df',
      'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
      'readingRoomId': 'ea7ac988-ede1-466b-968c-46a770333b14',
      'readingRoomName': 'rr-4',
      'access': 'ALLOWED',
      'notes': 'Allowed for this reading room...',
      'metadata': {
        'createdDate': '2024-05-15 18:39:31',
        'createdByUserId': '21457ab5-4635-4e56-906a-908f05e9233b',
        'updatedDate': '2024-05-15 18:40:27',
        'updatedByUserId': '21457ab5-4635-4e56-906a-908f05e9233b'
      }
    },
    {
      'id': 'fe1d83dc-e3f9-4e57-aa2c-0b245ae7eb19',
      'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
      'readingRoomId': '754c6287-892c-4484-941a-23e050fc8888',
      'readingRoomName': 'abc',
      'access': 'NOT_ALLOWED',
      'notes': '',
      'metadata': {
        'createdDate': '2024-05-21 07:05:17',
        'createdByUserId': '21457ab5-4635-4e56-906a-908f05e9233b',
        'updatedDate': '2024-05-21 07:13:11',
        'updatedByUserId': '21457ab5-4635-4e56-906a-908f05e9233b'
      }
    }
  ],
};
describe('EditReadingRoomAccess', () => {
  it('should render with no axe errors', async () => {
    await runAxeTest({
      rootNode: document.body,
    });
  });

  it('should render component', () => {
    renderEditReadingRoomAccess(props);
    expect(screen.getByText('ui-users.readingRoom.readingRoomAccess')).toBeDefined();
  });

  it('should display columns - access, name and note', () => {
    renderEditReadingRoomAccess(props);
    [
      'ui-users.readingRoom.access',
      'ui-users.readingRoom.name',
      'ui-users.readingRoom.note',
    ].forEach(col => expect(screen.getByText(col)).toBeDefined());
  });

  it('should update the notes', async () => {
    renderEditReadingRoomAccess(props);
    const noteField1 = document.querySelectorAll('[id^=textarea]')[0];
    await act(async () => userEvent.type(noteField1, 'note1'));
    await waitFor(() => expect(props.form.change).toHaveBeenCalled());
  });

  it('should update access', async () => {
    renderEditReadingRoomAccess(props);
    const accessSelectField = document.querySelectorAll('[id=reading-room-access-select]')[1];
    await act(async () => userEvent.click(accessSelectField));
    const list = screen.getByRole('listbox');
    await act(async () => userEvent.click(within(list).getByText('ui-users.readingRoom.notAllowed', { exact: false })));
    await waitFor(() => expect(props.form.change).toHaveBeenCalled());
  });

  it('should update both access and note', async () => {
    renderEditReadingRoomAccess(props);
    const noteField1 = document.querySelectorAll('[id^=textarea]')[0];
    await act(async () => userEvent.type(noteField1, 'note1'));
    const accessSelectField = document.querySelectorAll('[id=reading-room-access-select]')[0];
    await act(async () => userEvent.click(accessSelectField));
    const list = screen.getByRole('listbox');
    await act(async () => userEvent.click(within(list).getByText('ui-users.readingRoom.allowed', { exact: false })));
    await waitFor(() => expect(props.form.change).toHaveBeenCalled());
  });
});
