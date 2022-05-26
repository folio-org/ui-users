import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import OverrideModal from './OverrideModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderOverrideModal = (props) => renderWithRouter(<OverrideModal {...props} />);

const props = (data) => {
  return {
    open: true,
    additionalInfo: 'TestInfo',
    onSave: jest.fn(),
    onClose: jest.fn(),
    patronBlocks: data,
    onSetAdditionalInfo: jest.fn((info) => {
      const nextProps = {
        open: true,
        additionalInfo: info,
        onSave: jest.fn(),
        onClose: jest.fn(),
        patronBlocks: data,
        onSetAdditionalInfo: jest.fn(),
      };
      renderOverrideModal(nextProps);
    }),
  };
};

describe('OverrideModal component', () => {
  describe('Checking OverrideModal Modal', () => {
    it('if it renders', () => {
      const data = [{
        patronBlockConditionId: '1235'
      }];
      expect(renderOverrideModal(props(data))).toBeTruthy();
    });

    it('for single patron data', () => {
      const data = [{
        patronBlockConditionId: '123',
        message: 'test'
      }];
      renderOverrideModal(props(data));
      expect(screen.getByText('test')).toBeTruthy();
    });
  });
});
