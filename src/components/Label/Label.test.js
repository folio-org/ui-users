import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import Label from './Label';

const renderLabel = (props) => renderWithRouter(
  <Label {...props}>
    <div>Test Label</div>
  </Label>
);

describe('Label component', () => {
  it('Label component render', async () => {
    renderLabel();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
});
