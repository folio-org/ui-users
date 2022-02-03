import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlockModal from './PatronBlockModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderPatronBlockModal = (props) => renderWithRouter(<PatronBlockModal {...props} />);

const props = (data) => {
  return {
    open: true,
    onOverride: jest.fn(),
    onClose: jest.fn(),
    patronBlocks: data,
    viewUserPath: '/Users/Test'
  };
};

describe('PatronBlockModal component', () => {
  describe('Checking patronBlock Modal', () => {
    it('if it renders', () => {
      const data = [{
        id: '123',
        desc: 'test'
      }];
      expect(renderPatronBlockModal(props(data))).toBeTruthy();
    });
    it('for single patron data', () => {
      const data = [{
        patronBlockConditionId: '123',
        message: 'test'
      }];
      renderPatronBlockModal(props(data));
      expect(screen.getByText('test')).toBeTruthy();
    });
    it('for multiple patron data', () => {
      const data = [{
        patronBlockConditionId: '123',
        message: 'test'
      },
      {
        patronBlockConditionId: '1234',
        message: 'test1'
      },
      {
        patronBlockConditionId: '1235',
      },
      {
        patronBlockConditionId: '1236',
        message: 'test2'
      }];
      renderPatronBlockModal(props(data));
      expect(screen.getByText('ui-users.blocks.additionalReasons')).toBeTruthy();
    });
    it('for empty data', () => {
      const data = [];
      renderPatronBlockModal(props(data));
      userEvent.click(document.querySelector('[data-test-open-override-modal="true"]'));
      expect(screen.getByText('ui-users.blocks.reason')).toBeTruthy();
    });
  });
});
