import React from 'react';

import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { noop } from 'lodash';

import '__mock__';
import '__mock__/currencyData.mock';

import PermissionSetForm from './PermissionSetForm';

import stripesFinalForm  from '@folio/stripes/final-form';

jest.unmock('@folio/stripes/components');

// jest.mock('@folio/stripes/final-form', () =>  ({
//     stripesFinalForm : jest.fn(),
//       default: jest.fn(),

// }));

// Component => props => {( <Component {...props} />)} );

const stripesDefaultProps = {
    okapi: { url: '' },
    logger: { log: noop },
    hasPerm: () => {},
    connect: Component => props => (
      <Component
        {...props}
        mutator={{}}
        resources={resources}
        hasPerm={()=>{}}
      />
    ),
  };
const connect = Component => props => (
    <Component
      {...props}
      mutator={{}}
      resources={resources}
      hasPerm={()=>{}}
    />
  );

const initialValues= {};

const handleSubmit = () => ({});

const renderPermissionSetForm = () => {
  const component = (
    <Router>
          <PermissionSetForm
        stripes={stripesDefaultProps}
        handleSubmit={handleSubmit}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        connect={connect}
    />
    </Router>  
  );
    return  render(component);
     };

describe('Actions Bar component', () => {
 // AfterEach( () => jest.clearAllMocks());

    it('show is true component renders data', () => {
       renderPermissionSetForm();
    });
  

});
