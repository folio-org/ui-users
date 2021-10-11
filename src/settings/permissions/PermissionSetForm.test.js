import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import buildStripes from '__mock__/stripes.mock';
import '__mock__/stripesCore.mock';

import PermissionSetForm from './PermissionSetForm';

jest.unmock('@folio/stripes/components');

const handleSubmit = () => ({});
const onRemove = () => ({});

const initialVal = {};
const initialValData = {
  id: '14c7a734-f029-4350-8fe0-0bbef7942ce5',
  displayName: 'test-permission-set',
  metadata: {
    createdDate : '',
  },
};

const renderPermissionSetForm = initialValues => {
  const component = (
    <Router>
      <PermissionSetForm
        stripes={buildStripes()}
        handleSubmit={handleSubmit}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        onRemove={onRemove}
      />
    </Router>
  );

  return render(component);
};


describe('PermissionSetForm', () => {
  it('show if component renders data with no inital values', () => {
    renderPermissionSetForm();

    expect(screen.getByText('ui-users.saveAndClose')).toBeDefined();
  });
  it('show if component renders data with empty inital values', () => {
    renderPermissionSetForm(initialVal);

    expect(screen.getByText('ui-users.saveAndClose')).toBeDefined();
  });
  it('Permission list check', () => {
    renderPermissionSetForm(initialVal);

    expect(screen.getByText('ui-users.permissions.newPermissionSet')).toBeDefined();
  });
  it('General info check', () => {
    renderPermissionSetForm(initialVal);

    expect(screen.getByText('ui-users.permissions.generalInformation')).toBeDefined();
  });
  it('description check', () => {
    renderPermissionSetForm(initialVal);

    expect(screen.getByText('ui-users.description')).toBeDefined();
  });
  it('oncancel delete modal check', () => {
    renderPermissionSetForm(initialValData);

    expect(screen.getByText('ui-users.delete')).toBeDefined();
    fireEvent.click(screen.getByText('ui-users.delete'));
    fireEvent.click(screen.getByText('stripes-components.cancel'));
  });
  it('delete check', () => {
    renderPermissionSetForm(initialValData);

    expect(screen.getByText('ui-users.delete')).toBeDefined();
    fireEvent.click(screen.getByText('ui-users.delete'));
    fireEvent.click(document.querySelector('[data-test-confirmation-modal-confirm-button="true"]'));
  });
  it('expand collapse check', () => {
    renderPermissionSetForm(initialValData);

    expect(screen.getByText('stripes-components.collapseAll')).toBeDefined();
    fireEvent.click(screen.getByText('stripes-components.collapseAll'));
  });
  it('toggle accordion check', () => {
    renderPermissionSetForm(initialValData);

    fireEvent.click(screen.getByText('ui-users.permissions.generalInformation'));
  });
});
