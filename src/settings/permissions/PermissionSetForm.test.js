import React from 'react';

import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import buildStripes from '__mock__/stripes.mock';
import '__mock__/stripesCore.mock';

import PermissionSetForm from './PermissionSetForm';

jest.unmock('@folio/stripes/components');

const initialValues = {};
const handleSubmit = () => ({});

const renderPermissionSetForm = () => {
  const component = (
    <Router>
      <PermissionSetForm
        stripes={buildStripes()}
        handleSubmit={handleSubmit}
        onSubmit={handleSubmit}
        initialValues={initialValues}
      />
    </Router>
  );

  return render(component);
};

describe('PermissionSetForm', () => {
  it('show is true component renders data', () => {
    const { debug } = renderPermissionSetForm();

    debug();
    expect(screen.getByText('ui-users.saveAndClose')).toBeDefined();
  });
});
