import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import preRegistrationRecords from 'fixtures/preRegistrationRecords';

import { MultiColumnList } from '@folio/stripes/components';

import PatronsPreRegistrationList from './PatronsPreRegistrationList';

const defaultProps = {
  data: [],
  isEmptyMessage: 'empty message',
  totalCount: 0,
  onNeedMoreData: jest.fn(),
};

describe('PatronsPreRegistrationList', () => {
  it('should render the component', () => {
    render(<PatronsPreRegistrationList {...defaultProps} />);

    expect(screen.getByTestId('PatronsPreRegistrationsList')).toBeVisible();
  });

  it('should be called with correct props', () => {
    const expectedProps = {
      autosize: true,
      contentData: [],
      id: 'PatronsPreRegistrationsList',
      pageAmount: 100,
      pagingType: 'prev-next',
      totalCount: 0
    };
    const props = {
      ...defaultProps,
      totalCount: 1,
      data: preRegistrationRecords,
    };

    render(<PatronsPreRegistrationList {...defaultProps} {...props} />);
    expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });
});
