import { render } from '@folio/jest-config-stripes/testing-library/react';

import UserRecordContainer from './UserRecordContainer';
import Harness from '../../test/jest/helpers/Harness';

const match = {
  params: { id: 'test-id' },
  path: '/users/:id',
};

const renderUserRecordContainer = (props = {}) => {
  return render(
    <Harness>
      <UserRecordContainer
        match={match}
        {...props}
      />
    </Harness>
  );
};

describe('UserRecordContainer', () => {
  it('should render LoadingPane', () => {
    const { getByText } = renderUserRecordContainer({
      resources: {
        selUser: { records: [] },
        settings: { records: [] }
      },
    });
    expect(getByText('LoadingPane')).toBeInTheDocument();
  });

  it('should have tagsScope default prop set correctly', () => {
    expect(UserRecordContainer.defaultProps.tagsScope).toBe('ui-tags.tags.manage');
  });
});
