import React from 'react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import ChargeNotice from './ChargeNotice';

jest.unmock('@folio/stripes/components');

const cNprops = {
  owner: { defaultChargeNoticeId: '1', defaultActionNoticeId: '2' },
  handleSubmit: jest.fn(),
  templateCharge: [{ id: '1', name: 'template1' }],
  templateAction: [{ id: '2', name: 'template2' }],
  templates: [{ id: '1', name: 'template1' }, { id: '2', name: 'template2' }],
  form: { initialize: jest.fn() },
  onSubmit: jest.fn(),
  hasEditOwnerPerm: true,
};

const renderChargeNotice = (props) => renderWithRouter(<ChargeNotice {...props} />);

describe('ChargeNotice', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('render Item component with the correct props', () => {
    const { getByText } = renderChargeNotice(cNprops);
    expect(getByText('ui-users.feefines.defaultChargeNotice')).toBeInTheDocument();
    expect(getByText('ui-users.feefines.defaultActionNotice')).toBeInTheDocument();
    expect(getByText('template1')).toBeInTheDocument();
    expect(getByText('template2')).toBeInTheDocument();
  });
  it('set edit state when button is clicked and click cancel button', () => {
    const { getByText } = renderChargeNotice(cNprops);
    const editButton = getByText('ui-users.edit');
    userEvent.click(editButton);
    const cancelButton = getByText('ui-users.cancel');
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });
  it('set edit state when button is clicked and click save button', () => {
    const { getByText } = renderChargeNotice(cNprops);
    const editButton = getByText('ui-users.edit');
    userEvent.click(editButton);
    const saveButton = getByText('ui-users.comment.save');
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);
  });
  describe('when hasEditOwnerPerm prop is false', () => {
    it('should have edit button disabled', () => {
      const alteredCNProps = {
        ...cNprops,
        hasEditOwnerPerm: false,
      };
      renderChargeNotice(alteredCNProps);
      expect(screen.getByTestId('chargeNotice')).toBeDisabled();
    });
  });
});

