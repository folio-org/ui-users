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
  Col: jest.fn(({ children }) => <div className="col">{ children }</div>),
  Datepicker: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>
      {children}
      <input type="text" />
    </div>
  )),
  Headline: jest.fn(({ children }) => <div>{ children }</div>),

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
  Label: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  Modal: jest.fn(({ children, label, ...rest }) => (
    <div {...rest}>
      <h1>{label}</h1>
      {children}
    </div>
  )),
  ModalFooter: jest.fn((props) => (
    <div>{props.children}</div>
  )),
  MultiSelection: jest.fn(({ children, dataOptions }) => (
    <div>
      <select multiple>
        {dataOptions.forEach((option, i) => (
          <option
            value={option.value}
            key={option.id || `option-${i}`}
          >
            {option.label}
          </option>))}
      </select>
      {children}
    </div>
  )),
  NavList: jest.fn(({ children, className, ...rest }) => (
    <div className={className} {...rest}>{children}</div>
  )),
  NavListItem: jest.fn(({ children, className, ...rest }) => (
    <div className={className} {...rest}>{children}</div>
  )),
  NavListSection: jest.fn(({ children, className, ...rest }) => (
    <div className={className} {...rest}>{children}</div>
  )),
  Pane: jest.fn(({ children, className, defaultWidth, paneTitle, firstMenu, lastMenu, ...rest }) => {
    return (
      <div className={className} {...rest} style={{ width: defaultWidth }}>
        <div>
          {firstMenu ?? null}
          {paneTitle}
          {lastMenu ?? null}
        </div>
        {children}
      </div>
    );
  }),
  PaneFooter: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>{children}</div>
  )),
  PaneHeader: jest.fn(({ paneTitle, firstMenu, lastMenu }) => (
    <div>
      {firstMenu ?? null}
      {paneTitle}
      {lastMenu ?? null}
    </div>
  )),
  PaneBackLink: jest.fn(() => <span />),
  PaneMenu: jest.fn((props) => <div>{props.children}</div>),
  RadioButton: jest.fn(({ label, name, ...rest }) => (
    <div>
      <label htmlFor="male">{label}</label>
      <input
        type="radio"
        name={name}
        {...rest}
      />
    </div>
  )),
  RadioButtonGroup: jest.fn(({ label, children, ...rest }) => (
    <fieldset {...rest}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  )),
  Row: jest.fn(({ children }) => <div className="row">{ children }</div>),
  Select: jest.fn(({ children, dataOptions }) => (
    <div>
      <select>
        {dataOptions.forEach((option, i) => (
          <option
            value={option.value}
            key={option.id || `option-${i}`}
          >
            {option.label}
          </option>))}
      </select>
      {children}
    </div>
  )),
}));
