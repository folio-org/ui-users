import React from 'react';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

import FeeFineInfo from './FeeFineInfo';

jest.unmock('@folio/stripes/components');

const onSubmit = jest.fn();

const renderFeeFineInfo = (props) => {
  const component = () => {
    return (
      <div><FeeFineInfo {...props} /></div>
    );
  };
  renderWithRouter(
    <Form
      id="form-user"
      onSubmit={onSubmit}
      render={component}
    />
  );
};

const onChangeOwnerMock = jest.fn();
const onChangeFeeFineMock = jest.fn();

const propData = {
  feefineList: [
    { label: 'Fee/Fine 1', value: '1' },
    { label: 'Fee/Fine 2', value: '2' },
  ],
  form: { change: jest.fn() },
  initialValues: { ownerId: 'ownerId1' },
  onChangeOwner: onChangeOwnerMock,
  ownerOptions: [
    { value: '1', label: 'Owner 1' },
    { value: '2', label: 'Owner 2' },
  ],
  onChangeFeeFine: onChangeFeeFineMock,
  intl: { formatMessage: jest.fn() },
  isPending: {},
};

describe('FeeFineInfo', () => {
  beforeEach(() => {
    renderFeeFineInfo(propData);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should call onChangeOwner when owner value is changed', async () => {
    const ownerSelect = screen.getByLabelText(/ui-users.charge.owner.label/i);
    await userEvent.selectOptions(ownerSelect, '2');
    expect(onChangeOwnerMock).toHaveBeenCalledWith('2');
  });
  it('should call onChangeFeeFine when fee/fine value is changed', async () => {
    const feeFineSelect = screen.getByLabelText(/ui-users.charge.feefine.label/i);
    await userEvent.selectOptions(feeFineSelect, '2');
    expect(onChangeFeeFineMock).toHaveBeenCalledTimes(1);
  });
  it('should update amount value on blur', async () => {
    const amountInput = screen.getByLabelText(/ui-users.charge.amount.label/i);
    await userEvent.type(amountInput, '10');
    userEvent.tab();
    expect(amountInput).toHaveValue(10);
  });
});
