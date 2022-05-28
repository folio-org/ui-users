
import React from 'react';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';

import renderWithRouter from 'helpers/renderWithRouter';

import EditServicePoints from './EditServicePoints';


import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');


const onSubmit = jest.fn();


const arrayMutators = {
  concat: jest.fn(),
  move: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  removeBatch: jest.fn(),
  shift: jest.fn(),
  swap: jest.fn(),
  unshift: jest.fn(),
  update: jest.fn()
};


const renderEditServicePoints = (props) => {
  const component = () => (
    <>
      <EditServicePoints {...props} />
    </>
  );
  renderWithRouter(
    <Form
      id="form-user"
      mutators={{
        ...arrayMutators
      }}
      initialValues={{
        servicePoints: okapiCurrentUser.servicePoints,
      }}
      onSubmit={onSubmit}
      render={component}
    />
  );
};



const onToggleMock = jest.fn();
const onChangeMock = jest.fn();

const propData = {
  accordionId: 'servicePoints',
  expanded: true,
  initialValues: {
    servicePoints: okapiCurrentUser.servicePoints,
  },
  onToggle: onToggleMock,
  intl: { formatMessage : jest.fn() },
  formData: {
    servicePoints: okapiCurrentUser.servicePoints,
  },
  form: {
    change: onChangeMock,
  },
  navigationCheck: true
};


describe('Edit Service Points Component', () => {
  describe('With Service Data', () => {
    beforeEach(() => {
      renderEditServicePoints(propData);
    });
    afterEach(cleanup);
    it('Check if modal Renders', () => {
      expect(screen.getAllByText('Online')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Circ Desk 2')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Circ Desk 1')[0]).toBeInTheDocument();
    });
    it('Check if add  service point modal works', () => {
      userEvent.click(document.querySelector('[id=add-service-point-btn]'));
      expect(screen.getByText('ui-users.sp.addServicePoints')).toBeInTheDocument();
    });
    it('Add service points functionality ', () => {
      userEvent.click(document.querySelector('[id=add-service-point-btn]'));
      userEvent.click(document.querySelector('[data-test-sp-modal-checkbox="7c5abc9f-f3d7-4856-b8d7-6712462ca007"]'));
      userEvent.click(screen.getByText('ui-users.saveAndClose'));
      expect(onChangeMock).toHaveBeenCalled();
    });
    it('Remove service points functionality ', () => {
      userEvent.click(document.querySelector('[id=add-service-point-btn]'));
      userEvent.click(document.querySelector('[data-test-sp-modal-checkbox="7c5abc9f-f3d7-4856-b8d7-6712462ca007"]'));
      userEvent.click(document.querySelector('[id="clickable-remove-service-point-7c5abc9f-f3d7-4856-b8d7-6712462ca007"]'));
      expect(onChangeMock).toHaveBeenCalled();
    });
  });
});
