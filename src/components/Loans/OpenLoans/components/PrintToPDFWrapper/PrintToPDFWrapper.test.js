import React from 'react';
import { render, screen } from '@testing-library/react';
import PrintToPDFWrapper from './PrintToPDFWrapper';
import PrintContent from './PrintContent';
import usePrintData from '../../../../../hooks/usePrintData';

jest.mock('../../../../../hooks/usePrintData');

jest.mock('./PrintContent', () => {
  return jest.fn(() => <div data-testid="print-content-mock">PrintContent</div>);
});

describe('PrintToPDFWrapper', () => {
  beforeEach(() => {
    usePrintData.mockReturnValue({
      templateFn: jest.fn(),
      dataSource: [{ key: 'value' }],
      reactToPrintFn: jest.fn(),
      handleRef: jest.fn(),
    });
  });

  it('should render the children and pass reactToPrintFn', () => {
    const mockChildFunction = jest.fn();

    render(
      <PrintToPDFWrapper entities={[]} type="test-type">
        {(reactToPrintFn) => {
          mockChildFunction(reactToPrintFn);
          return <div data-testid="child">Child Content</div>;
        }}
      </PrintToPDFWrapper>
    );

    expect(mockChildFunction).toHaveBeenCalledWith(expect.any(Function));

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should render the PrintContent component with correct props', () => {
    render(
      <PrintToPDFWrapper entities={[{ key: 'value' }]} type="test-type">
        {() => <div />}
      </PrintToPDFWrapper>
    );

    expect(screen.getByTestId('print-content-mock')).toBeInTheDocument();

    expect(PrintContent).toHaveBeenCalledWith(
      expect.objectContaining({
        dataSource: [{ key: 'value' }],
        templateFn: expect.any(Function),
        contentRef: expect.any(Function),
      }),
      {}
    );
  });

  it('should use default value for entities when not provided', () => {
    render(
      <PrintToPDFWrapper type="test-type">
        {() => <div />}
      </PrintToPDFWrapper>
    );

    expect(usePrintData).toHaveBeenCalledWith([], 'test-type');

    expect(screen.getByTestId('print-content-mock')).toBeInTheDocument();
  });
});
