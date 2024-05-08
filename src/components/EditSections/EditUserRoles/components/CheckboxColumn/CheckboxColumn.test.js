
import { cleanup } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

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
  roleName: 'testRoleName',
  onChange: mockFunc,
};

describe('CheckboxColumn component', () => {
  afterEach(cleanup);
  it('If CheckboxColumn Renders', () => {
    renderCheckboxColumn(propData);
    expect(document.querySelector('[data-role-name="testRoleName"]')).toBeInTheDocument();
  });
  it('If CheckboxColumn can be checked', async () => {
    renderCheckboxColumn(propData);
    await userEvent.click(document.querySelector('[data-test-select-item="true"]'));
    await userEvent.click(document.querySelector('[name="selected-testCheckBox"]'));
    expect(mockFunc).toHaveBeenCalled();
  });
});
