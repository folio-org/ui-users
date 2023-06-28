import { screen, render } from '@folio/jest-config-stripes/testing-library/react';

import { DemoComponent } from './DemoComponent';

const renderDemo = () => render(
  <DemoComponent />
);

describe('Item Info component', () => {
  it('if it renders', () => {
    renderDemo();
    expect(screen.getByText('DemoComponent')).toBeInTheDocument();
  });
});
