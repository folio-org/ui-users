import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Badge: jest.fn((props) => (
    <span>
      <span>{props.children}</span>
    </span>
  )),
  Button: jest.fn(({ children }) => (
    <button data-test-button type="button">
      <span>
        {children}
      </span>
    </button>
  )),
  Icon: jest.fn((props) => (props && props.children ? props.children : <span />)),
  IconButton: jest.fn(({
    buttonProps,
    // eslint-disable-next-line no-unused-vars
    iconClassName,
    ...rest
  }) => (
    <button type="button" {...buttonProps}>
      <span {...rest} />
    </button>
  )),
  PaneFooter: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>{children}</div>
  )),
  PaneMenu: jest.fn((props) => <div>{props.children}</div>),
}));
