import React from 'react';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import BlockTemplateForm from './BlockTemplateForm';

import '__mock__/stripesCore.mock';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({ heading, message, onConfirm, onCancel, onRemove }) => (
    <div>
      <span>ConfirmationModal</span>
      {heading}
      <div>{message}</div>
      <div>
        <button type="button" onClick={onConfirm}>Confirmation</button>
        <button type="button" onClick={onCancel}>Cancellation</button>
        <button type="button" onClick={onRemove}>remove</button>
      </div>
    </div>
  )),
  PaneHeaderIconButton : () => (<div>Icon</div>),
}));

describe('BlockTemplateForm', () => {
  const props = {
    handleSubmit: jest.fn(),
    initialValues: {
      id: '1',
      name: 'Test Block Template',
      blockTemplate: {
        borrowing: true,
        renewals: true,
        requests: false,
      },
    },
    onCancel: jest.fn(),
    pristine: true,
    submitting: false,
    onRemove: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    renderWithRouter(<BlockTemplateForm {...props} />);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display the correct pane title', () => {
    const paneTitle = screen.getByText('ui-users.edit: Test Block Template');
    expect(paneTitle).toBeInTheDocument();
  });

  it('should disable the save button when pristine or submitting', () => {
    const saveButton = screen.getByRole('button', { name: 'ui-users.saveAndClose' });
    expect(saveButton).toBeDisabled();
    const templateInformationButton = screen.getByRole('button', { name: 'Icon (caret-up) ui-users.manualBlockTemplates.templateInformation' });
    userEvent.click(templateInformationButton);
  });
  it('should call onCancel when "Cancel" button is clicked', async () => {
    const cancelButton = screen.getByRole('button', { name: 'ui-users.cancel' });
    await userEvent.click(cancelButton);
    expect(props.onCancel).toHaveBeenCalled();
  });
  it('name input field is required', async () => {
    const nameInput = screen.getByLabelText(/ui-users.manualBlockTemplates.templateName */i);
    expect(nameInput).toHaveValue('Test Block Template');
    await userEvent.type(nameInput, ' Enter Something');
    expect(nameInput).toHaveValue('Test Block Template Enter Something');
    const ConfirmationButton = screen.getByRole('button', { name: 'Confirmation' });
    await userEvent.click(ConfirmationButton);
    const saveButton = screen.getByRole('button', { name: 'ui-users.saveAndClose' });
    expect(saveButton).toBeEnabled();
    userEvent.click(saveButton);
  });
  it('description input field is required', async () => {
    const descriptionInput = screen.getByLabelText(/ui-users.description/i);
    expect(descriptionInput).toHaveValue('');
    await userEvent.type(descriptionInput, 'description new value');
    expect(descriptionInput).toHaveValue('description new value');
    const CancellationButton = screen.getByRole('button', { name: 'Cancellation' });
    userEvent.click(CancellationButton);
  });
  it('should render action checkboxes for borrowing, renewals, and requests', async () => {
    const borrowingCheckbox = screen.getByRole('checkbox', {
      name: 'ui-users.blocks.columns.borrowing',
    });
    expect(borrowingCheckbox).toBeInTheDocument();
    expect(borrowingCheckbox).toBeChecked();

    const renewalsCheckbox = screen.getByRole('checkbox', {
      name: 'ui-users.blocks.columns.renewals',
    });
    expect(renewalsCheckbox).toBeInTheDocument();
    expect(renewalsCheckbox).toBeChecked();

    const requestsCheckbox = screen.getByRole('checkbox', {
      name: 'ui-users.blocks.columns.requests',
    });
    expect(requestsCheckbox).toBeInTheDocument();
    expect(requestsCheckbox).not.toBeChecked();
    await userEvent.click(requestsCheckbox);
    expect(requestsCheckbox).toBeChecked();
    const allButton = screen.getByRole('button', { name: 'stripes-components.collapseAll' });
    userEvent.click(allButton);
  });
});

describe('BlockTemplateForm with noValue props', () => {
  const noValueProps = {
    handleSubmit: jest.fn(),
    initialValues: {},
    onCancel: jest.fn(),
    pristine: false,
    submitting: false,
    onRemove: jest.fn(),
    onSubmit: jest.fn(),
  };
  beforeEach(() => {
    renderWithRouter(<BlockTemplateForm {...noValueProps} />);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should display the new pane title', () => {
    const newpaneTitle = screen.getByText('ui-users.manualBlockTemplates.newManualBlockTemplate');
    expect(newpaneTitle).toBeInTheDocument();
    expect(screen.getByText(/ui-users.manualBlockTemplate.deleteTemplateMessage/i)).toBeInTheDocument();
  });
});
