import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

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
      data: [
        {
          'id': 'd717f710-ddf3-4208-9784-f443b74c40cd',
          'active': true,
          'generalInfo': {
            'firstName': 'new-record-2',
            'preferredFirstName': 'New Record',
            'middleName': '',
            'lastName': 'new-record-2'
          },
          'addressInfo': {
            'addressLine0': '123 Main St',
            'addressLine1': 'Apt 4B',
            'city': 'Metropolis',
            'province': 'NY',
            'zip': '12345',
            'country': 'USA'
          },
          'contactInfo': {
            'phone': '555-123456',
            'mobilePhone': '555-5678',
            'email': 'new-record-2@test.com'
          },
          'preferredEmailCommunication': [
            'Support',
            'Programs'
          ],
          'metadata': {
            'createdDate': '2024-04-29T13:29:41.711+00:00',
            'createdByUserId': '6d8a6bf2-5b5f-4168-aa2f-5c4e67b4b65c',
            'updatedDate': '2024-04-29T13:29:41.711+00:00',
            'updatedByUserId': '6d8a6bf2-5b5f-4168-aa2f-5c4e67b4b65c'
          }
        }
      ],
    };

    render(<PatronsPreRegistrationList {...defaultProps} {...props} />);
    expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });
});
