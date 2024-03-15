import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import Slider from './Slider';

describe('Slider', () => {
  test('render slider', () => {
    render(
      <Slider
        value="zoom"
        handleChange={jest.fn()}
        min={1}
        max={4}
        step={1}
        label="slider"
      />
    );
    expect(screen.getByText('ui-users.information.profilePicture.localFile.modal.slider')).toBeInTheDocument();
  });
});
