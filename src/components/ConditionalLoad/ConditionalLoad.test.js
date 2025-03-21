import { act, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import ConditionalLoad from './ConditionalLoad';

let component;
const testConditionalLoad = (props) => async () => {
  await act(() => {
    component = render(
      <ConditionalLoad
        suppressConsoleErrors // We don't need messy errors in the test
        {...props}
      >
        {({ Component }) => <Component />}
      </ConditionalLoad>
    );
  });
};

describe('ConditionalLoad', () => {
  describe('Component renders when import succeeds', () => {
    beforeEach(testConditionalLoad({
      importString: './TestComponent'
    }));

    test('renders Test Component', async () => {
      const { getByText } = component;
      await waitFor(() => {
        expect(getByText('Test Component')).toBeInTheDocument();
      });
    });
  });

  describe('Can get component from module import', () => {
    beforeEach(testConditionalLoad({
      importString: './TestComponent/Extra',
      importSuccess: m => ({ default: m.Extra })
    }));

    test('renders Extra Component', async () => {
      const { getByText } = component;
      await waitFor(() => {
        expect(getByText('Extra Component')).toBeInTheDocument();
      });
    });
  });

  describe('Fallback component renders when import fails', () => {
    beforeEach(testConditionalLoad({
      importString: './MadeUpComponent'
    }));

    test('renders Test Component', async () => {
      const { getByText } = component;
      await waitFor(() => {
        expect(getByText('Feature not available')).toBeInTheDocument();
      });
    });
  });

  describe('Fallback component is configurable', () => {
    beforeEach(testConditionalLoad({
      importString: './MadeUpComponent',
      FallbackComponent: () => <div>Fallback Component</div>
    }));

    test('renders Test Component', async () => {
      const { getByText } = component;
      await waitFor(() => {
        expect(getByText('Fallback Component')).toBeInTheDocument();
      });
    });
  });

  describe('importError is directly configurable', () => {
    beforeEach(testConditionalLoad({
      importString: './MadeUpComponent',
      importError: (err) => Promise.resolve(({ default: () => <div>{err.message}</div> }))
    }));

    test('renders Test Component', async () => {
      const { getByText } = component;
      await waitFor(() => {
        expect(getByText('Cannot find module \'./MadeUpComponent\' from \'src/components/ConditionalLoad/ConditionalLoad.js\'')).toBeInTheDocument();
      });
    });
  });
});
