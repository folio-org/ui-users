import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/currencyData.mock';

import affiliations from 'fixtures/affiliations';
import {
  useConsortiumTenants,
  useUserAffiliations,
} from '../../hooks';
import AffiliationsManager from './AffiliationsManager';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useConsortiumTenants: jest.fn(),
  useUserAffiliations: jest.fn(),
}));

const defaultProps = {
  onUpdateAffiliations: jest.fn(),
  userId: 'userId',
};

const renderAffiliationsManager = (props = {}) => render(
  <AffiliationsManager
    {...defaultProps}
    {...props}
  />,
);

describe('AffiliationsManager', () => {
  beforeEach(() => {
    useConsortiumTenants
      .mockClear()
      .mockReturnValue({
        tenants: affiliations.map(({ tenantId, tenantName }) => ({ id: tenantId, name: tenantName })),
        isLoading: false,
      });
    useUserAffiliations
      .mockClear()
      .mockReturnValue({ isLoading: false, affiliations });
  });

  describe('Modal', () => {
    beforeEach(async () => {
      renderAffiliationsManager();
      userEvent.click(await screen.findByRole('button', { name: 'ui-users.affiliations.section.action.edit' }));
    });

    it('should render affiliation manager modal', async () => {
      expect(await screen.findByText('ui-users.affiliations.manager.modal.title')).toBeInTheDocument();
    });

    it('should close modal when \'Cancel\' button was clicked', async () => {
      await userEvent.click(await screen.findByText('ui-users.cancel'));

      expect(screen.queryByText('ui-users.affiliations.manager.modal.title')).not.toBeInTheDocument();
    });

    it('should handle affiliations assignment when \'Save & close\' button was clicked', async () => {
      await userEvent.click(await screen.findByText('ui-users.saveAndClose'));

      expect(defaultProps.onUpdateAffiliations).toHaveBeenCalled();
    });

    describe('Filters', () => {
      it('should filter results by search query', async () => {
        expect(await screen.findAllByRole('row')).toHaveLength(affiliations.length);

        await userEvent.type(await screen.findByLabelText('ui-users.affiliations.manager.modal.aria.search'), affiliations[0].tenantName);
        await userEvent.click(await screen.findByText('ui-users.search'));

        expect(await screen.findAllByRole('row')).toHaveLength(2);
      });

      it('should filter results by assignment status', async () => {
        expect(await screen.findAllByRole('row')).toHaveLength(affiliations.length);

        const assignmentCheckboxes = await screen.findAllByLabelText('ui-users.affiliations.manager.modal.aria.assign');

        await userEvent.click(assignmentCheckboxes[0]);
        await userEvent.click(assignmentCheckboxes[1]);
        await userEvent.click(assignmentCheckboxes[2]);
        await userEvent.click(await screen.findByText('ui-users.affiliations.manager.filter.assignment.assigned'));

        expect(await screen.findAllByRole('row')).toHaveLength((affiliations.length - 3) + 1);

        await userEvent.click(await screen.findByLabelText(/Clear selected filters for/));

        expect(await screen.findAllByRole('row')).toHaveLength(affiliations.length + 1);
      });

      it('should reset search and filters when \'Reset all\' button was clicked', async () => {
        await userEvent.click(await screen.findByLabelText('ui-users.affiliations.manager.modal.aria.assignAll'));
        await userEvent.click(await screen.findByText('ui-users.affiliations.manager.filter.assignment.unassigned'));

        expect(await screen.findAllByRole('row')).toHaveLength(affiliations.length);

        await userEvent.type(await screen.findByLabelText('ui-users.affiliations.manager.modal.aria.search'), 'Columbia');
        await userEvent.click(await screen.findByText('ui-users.search'));

        expect(await screen.findAllByRole('row')).toHaveLength(2);

        await userEvent.click(await screen.findByTestId('reset-all-affiliations-filters'));

        expect(await screen.findAllByRole('row')).toHaveLength(affiliations.length);
      });
    });
  });
});
