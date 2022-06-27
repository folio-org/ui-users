import React from 'react';
import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import PropTypes from 'prop-types';

import renderWithRouter from 'helpers/renderWithRouter';

import withFormValues from './withFormValues';


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


const MarkAsMissingButton = ({ initialValues, values, change }) => {
  return (
    <>
      <div>{values.id}</div>
      <div>{initialValues.name}</div>
      <button type="button" data-testid="open-dialog" onClick={change}>ClickChange</button>
    </>
  );
};

MarkAsMissingButton.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.object,
  change: PropTypes.func,
};

const WrappedComponent = withFormValues(MarkAsMissingButton);

const renderWithFormValues = (props) => {
  const component = () => (
    <>
      <WrappedComponent {...props} />
    </>
  );
  renderWithRouter(
    <Form
      id="pw"
      mutators={{
        ...arrayMutators
      }}
      initialValues={{
        id: 'testId',
        name: 'testLabel'
      }}
      onSubmit={onSubmit}
      render={component}
    />
  );
};


describe('With Form Values', () => {
  test('checking the values field', () => {
    renderWithFormValues();
    expect(screen.getByText('testId')).toBeInTheDocument();
  });
  test('Checking the initial Values field', () => {
    renderWithFormValues();
    expect(screen.getByText('testLabel')).toBeInTheDocument();
  });
});
