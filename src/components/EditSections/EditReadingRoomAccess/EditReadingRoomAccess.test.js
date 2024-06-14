import { screen, waitFor, act, fireEvent } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Form } from 'react-final-form';

import { runAxeTest } from '@folio/stripes-testing';

import renderWithRouter from 'helpers/renderWithRouter';
import '../../../../test/jest/__mock__/matchMedia.mock';
import '../../../../test/jest/__mock__/reactFinalFormListeners.mock';

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
    const accessSelectField = screen.getAllByRole('combobox')[1];
    fireEvent.change(accessSelectField, { target: { value: 'ALLOWED' } });
    await waitFor(() => expect(props.form.change).toHaveBeenCalled());
  });

  it('should update both access and note', async () => {
    renderEditReadingRoomAccess(props);
    const noteField1 = document.querySelectorAll('[id^=textarea]')[0];
    await act(async () => userEvent.type(noteField1, 'note1'));

    const accessSelectField = screen.getAllByRole('combobox')[0];
    fireEvent.change(accessSelectField, { target: { value: 'NOT_ALLOWED' } });
    await waitFor(() => expect(props.form.change).toHaveBeenCalled());
  });

  it('should sort the records by default by room name', () => {
    renderEditReadingRoomAccess(props);
    expect(document.querySelectorAll('[class^="mclCell"]')[1].innerHTML).toBe('abc');
  });

  it('should sort the records by room name when name column header is clicked', () => {
    renderEditReadingRoomAccess(props);
    fireEvent.click(document.getElementById('clickable-list-column-readingroomname'));
    expect(document.querySelectorAll('[class^="mclCell"]')[1].innerHTML).toBe('rr-4');
  });

  it('should update access and sort the records by room name', async () => {
    renderEditReadingRoomAccess(props);
    const accessSelectField = screen.getAllByRole('combobox')[0];
    fireEvent.change(accessSelectField, { target: { value: 'NOT_ALLOWED' } });
    await waitFor(() => expect(props.form.change).toHaveBeenCalled());
    expect(document.querySelectorAll('[class^="mclCell"]')[1].innerHTML).toBe('abc');

    fireEvent.click(document.getElementById('clickable-list-column-readingroomname'));
    expect(document.querySelectorAll('[class^="mclCell"]')[1].innerHTML).toBe('rr-4');
    expect(document.querySelectorAll('[class^="mclCell"]')[4].innerHTML).toBe('abc');
  });
});
