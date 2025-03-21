import { render } from '@folio/jest-config-stripes/testing-library/react';
import TestComponent from './TestComponent';
import { Extra } from './Extra';

describe('TestComponent', () => {
  let component;
  describe('<TestComponent />', () => {
    beforeEach(() => {
      component = render(<TestComponent />);
    });
    test('should render test component', () => {
      const { getByText } = component;
      expect(getByText('Test Component')).toBeInTheDocument();
    });
  });

  describe('<Extra />', () => {
    beforeEach(() => {
      component = render(<Extra />);
    });
    test('should render extra component', () => {
      const { getByText } = component;
      expect(getByText('Extra Component')).toBeInTheDocument();
    });
  });
});
