
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/matchMedia.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import CheckboxColumn from './CheckboxColumn';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderCheckboxColumn = (props) => renderWithRouter(<CheckboxColumn {...props} />);

const mockFunc = jest.fn();

const propData = {
  checked: true,
  value: 'testCheckBox',
  permissionName: 'testPermissionName',
  onChange: mockFunc,
};

describe('CheckboxColumn component', () => {
  afterEach(cleanup);
  it('If CheckboxColumn Renders', () => {
    renderCheckboxColumn(propData);
    expect(document.querySelector('[data-permission-name="testPermissionName"]')).toBeInTheDocument();
  });
  it('If CheckboxColumn can be checked', () => {
    renderCheckboxColumn(propData);
    userEvent.click(document.querySelector('[data-test-select-item="true"]'));
    userEvent.click(document.querySelector('[name="selected-testCheckBox"]'));
    expect(mockFunc).toHaveBeenCalled();
  });
});
