import React from 'react';

import { render, screen } from '@testing-library/react';

import ActionsBar from './ActionsBar';

const renderActionBar = ({
  show,
  contentStart,
  contentEnd
}) => {
  const component = (
    <ActionsBar
      show={show}
      contentStart={contentStart}
      contentEnd={contentEnd}
    />
  );
  render(component);
};

describe('Actions Bar component', () => {
  it('show is true component renders data', () => {
    renderActionBar({ show: true,
      contentStart: <div>testData</div>,
      contentEnd: <div>testDataEnd</div> });

    expect(screen.queryByText('testData')).toBeInTheDocument();
  });
  it('show is false component not defined', () => {
    expect(renderActionBar({ show: false,
      contentStart: <div>testData</div>,
      contentEnd: <div>testDataEnd</div> })).not.toBeDefined();
  });
});
