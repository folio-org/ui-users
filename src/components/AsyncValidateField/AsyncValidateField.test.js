import { useState } from 'react';
import { Form } from 'react-final-form';

import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { AsyncValidateField } from './AsyncValidateField';

const WAIT = 300;

// Renders the field behind a toggle so it can be unmounted independently of the
// surrounding <Form>, to reproduce the scenario where the field unmounts while its
// own debounce timer is still pending.
const renderForm = ({ onSubmit, validate, initialValues }) => {
  const Wrapper = () => {
    const [showField, setShowField] = useState(true);

    return (
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {showField && (
              <AsyncValidateField
                name="barcode"
                id="barcode"
                component="input"
                validate={validate}
                wait={WAIT}
              />
            )}
            <button type="button" onClick={() => setShowField(false)}>Hide field</button>
            <button type="submit">Save</button>
          </form>
        )}
      />
    );
  };

  return render(<Wrapper />);
};

describe('AsyncValidateField', () => {
  let user;

  beforeEach(() => {
    jest.useFakeTimers();
    user = userEvent.setup({ delay: null, advanceTimers: jest.advanceTimersByTime });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Regression test for a bug where typing multiple characters before the debounce
  // window elapsed left the form permanently stuck "validating", so clicking
  // "Save & close" did nothing. Each keystroke produces a new (memoized) Promise,
  // but `lodash/debounce` only invokes its wrapped function once per burst (the
  // trailing call) - any earlier keystroke's Promise must still resolve, otherwise
  // final-form's internal async-validation counter never returns to zero and
  // submission is blocked forever.
  it('does not permanently block form submission after typing several characters quickly', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn(() => undefined);

    renderForm({ onSubmit, validate });

    const input = screen.getByRole('textbox');

    await user.type(input, '123456');

    // Let the debounced validator fire and its Promise resolve.
    await jest.advanceTimersByTimeAsync(WAIT + 100);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('still surfaces a validation error produced by the final keystroke', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn((value) => (value === '123456' ? 'error' : undefined));

    renderForm({ onSubmit, validate });

    const input = screen.getByRole('textbox');

    await user.type(input, '123456');

    await jest.advanceTimersByTimeAsync(WAIT + 100);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(validate).toHaveBeenCalledWith('123456', { barcode: '123456' }, undefined));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('forwards allValues to the validate function, alongside value', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn(() => undefined);

    renderForm({ onSubmit, validate, initialValues: { username: 'jdoe' } });

    const input = screen.getByRole('textbox');

    await user.type(input, '123456');

    await jest.advanceTimersByTimeAsync(WAIT + 100);

    await waitFor(() => expect(validate).toHaveBeenCalledWith(
      '123456',
      { username: 'jdoe', barcode: '123456' },
      undefined,
    ));
  });

  // Regression test: if the field unmounts (e.g. it's conditionally rendered) while
  // its own debounce timer is still pending, the surrounding <Form> can still be
  // mounted. Simply clearing the timeout on unmount without resolving the pending
  // Promise would leave the form permanently stuck "validating".
  it('does not permanently block form submission when the field unmounts before its debounced validation fires', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn(() => undefined);

    renderForm({ onSubmit, validate });

    const input = screen.getByRole('textbox');

    await user.type(input, '123456');

    // Unmount the field before its debounce timer has a chance to fire.
    await user.click(screen.getByRole('button', { name: 'Hide field' }));

    await jest.advanceTimersByTimeAsync(WAIT + 100);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
