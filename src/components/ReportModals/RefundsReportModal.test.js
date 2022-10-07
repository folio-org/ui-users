import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/matchMedia.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import RefundsReportModal from './RefundsReportModal';
import { SHARED_OWNER } from '../../constants';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderRefundsReportModal = (props) => renderWithRouter(<RefundsReportModal {...props} />);

const mockFunc = jest.fn();
const mockFuncClose = jest.fn();

const ownerData = [
  {
    id: '6b3884f3-8066-47a7-b44e-5adcd6350d61',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test2',
    servicePointOwner: []
  },
  {
    id: '6b3884f3-8066-47a7-b44e-5adcd6350d63',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test1',
    servicePointOwner: []
  },
  {
    id: '6f7577f6-5acf-4cd1-9470-54b40153c1d7',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: SHARED_OWNER,
    servicePointOwner: []
  }
];

const propData = {
  form: { reset: mockFunc },
  owners: ownerData,
  onClose: mockFuncClose,
  open: true,
  label: 'TestLabelRefundsModal',
  intl: { formatMessage : jest.fn() },
  handleSubmit: jest.fn(),
  timezone: 'America/New_York',
  onSubmit: jest.fn(),
};

describe('RefundsReportModal component', () => {
  afterEach(cleanup);
  it('If RefundsReportModal Renders', () => {
    renderRefundsReportModal(propData);
    expect(screen.getByText('TestLabelRefundsModal')).toBeInTheDocument();
  });
  it('start Date Validation', () => {
    renderRefundsReportModal(propData);
    userEvent.type(screen.getByLabelText('ui-users.reports.refunds.modal.endDate'), '13/02/2022');
    expect(screen.getAllByRole('alert')[0]).toBeTruthy();
  });
  it('end Date must be greater Validation', () => {
    renderRefundsReportModal(propData);
    userEvent.type(screen.getByLabelText('ui-users.reports.refunds.modal.startDate'), '15/02/2022');
    userEvent.type(screen.getByLabelText('ui-users.reports.refunds.modal.endDate'), '03/02/2022');
    expect(screen.getAllByRole('alert')[1]).toBeTruthy();
  });
});
