import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Accordion: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  AccordionSet: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  AccordionStatus: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  Badge: jest.fn((props) => (
    <span>
      <span>{props.children}</span>
    </span>
  )),
  Button: jest.fn(({
    children,
    onClick = jest.fn(),
    // eslint-disable-next-line no-unused-vars
    buttonStyle, buttonRef,
    ...rest
  }) => (
    <button data-test-button type="button" {...rest} onClick={onClick}>
      <span>
        {children}
      </span>
    </button>
  )),
  Callout: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  Col: jest.fn(({ children }) => <div className="col">{ children }</div>),
  ConfirmationModal: jest.fn(({ heading, message, onConfirm, onCancel }) => (
    <div>
      <span>ConfirmationModal</span>
      {heading}
      <div>{message}</div>
      <div>
        <button type="button" onClick={onConfirm}>confirm</button>
        <button type="button" onClick={onCancel}>cancel</button>
      </div>
    </div>
  )),
  Dropdown: jest.fn(({ children, ...rest }) => <div {...rest}>{ children }</div>),
  DropdownMenu: jest.fn(({ children, ...rest }) => <div {...rest}>{ children }</div>),
  Datepicker: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>
      {children}
      <input type="text" />
    </div>
  )),
  ExpandAllButton: jest.fn(({ children }) => (
    <span>{children}</span>
  )),
  FormattedTime: jest.fn(({ value, children }) => {
    if (children) {
      return children([value]);
    }

    return value;
  }),
  FormattedDate: jest.fn(({ value, children }) => {
    if (children) {
      return children([value]);
    }

    return value;
  }),
  HasCommand: jest.fn(({ children }) => (
    <span>{children}</span>
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
  InfoPopover: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  KeyValue: jest.fn(({ label, children, value }) => (
    <>
      <span>{label}</span>
      <span>{value || children}</span>
    </>
  )),
  Label: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  List: jest.fn(({ children, items, itemFormatter, ...rest }) => (
    <>
      <div>List Component </div>
      <button type="button" data-testid="open-format-list" onClick={itemFormatter}>Formatter</button>
      <span {...rest}>{children}</span>
      { items.length > 0 ? items.map((item, index) => <div key={index}>{item.formattedMessageId || item.id}</div>) : ''}
    </>
  )),
  Loading: () => <div>Loading</div>,
  LoadingPane: () => <div>LoadingPane</div>,
  // oy, dismissible. we need to pull it out of props so it doesn't
  // get applied to the div as an attribute, which must have a string-value,
  // which will shame you in the console:
  //
  //     Warning: Received `true` for a non-boolean attribute `dismissible`.
  //     If you want to write it to the DOM, pass a string instead: dismissible="true" or dismissible={value.toString()}.
  //         in div (created by mockConstructor)
  //
  // is there a better way to throw it away? If we don't destructure and
  // instead access props.label and props.children, then we get a test
  // failure that the modal isn't visible. oy, dismissible.
  Modal: jest.fn(({ children, label, dismissible, footer, ...rest }) => {
    return (
      <div
        data-test={dismissible ? '' : ''}
        {...rest}
      >
        <h1>{label}</h1>
        {children}
        {footer}
      </div>
    );
  }),
  ModalFooter: jest.fn((props) => (
    <div>{props.children}</div>
  )),
  MultiColumnList: jest.fn((props) => (
    <div data-testid={props['data-testid']} />
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
          </option>
        ))}
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
  NoValue: jest.fn(({ ariaLabel }) => (<span>{ariaLabel}</span>)),
  // destructure appIcon and dismissible so they aren't incorrectly
  // applied as DOM attributes via ...rest.
  // eslint-disable-next-line no-unused-vars
  Pane: jest.fn(({ children, className, defaultWidth, paneTitle, firstMenu, lastMenu, actionMenu, appIcon, dismissible, onClose, ...rest }) => {
    return (
      <div className={className} {...rest} style={{ width: defaultWidth }}>
        <div>
          {dismissible && (
            <button
              type="button"
              data-testid="close-pane"
              label="Close"
              onClick={onClose}
            />
          )}
          {firstMenu ?? null}
          {paneTitle}
          {actionMenu ? actionMenu({ onToggle: jest.fn() }) : null}
          {lastMenu ?? null}
        </div>
        {children}
      </div>
    );
  }),
  PaneBackLink: jest.fn(() => <span />),
  PaneFooter: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>{children}</div>
  )),
  PaneHeader: jest.fn(({ paneTitle, firstMenu, lastMenu, actionMenu }) => (
    <div actionMenu={actionMenu}>
      {firstMenu ?? null}
      {paneTitle}
      {actionMenu ? actionMenu({ onToggle: jest.fn() }) : null}
      {lastMenu ?? null}
    </div>
  )),
  PaneHeaderIconButton: jest.fn(({ children }) => <div className="paneHeaderIconButton">{ children }</div>),
  PaneMenu: jest.fn((props) => <div>{props.children}</div>),
  Paneset: jest.fn((props) => <div>{props.children}</div>),
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
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
  TextArea: jest.fn((props) => (
    <div>
      <label htmlFor={props.label}>{props.label}</label>
      <textarea
        id={props.label}
        value={props.value}
        cols="30"
        rows="10"
      />
    </div>
  )),
  TextField: jest.fn((props) => {
    return (
      <div>
        <label htmlFor={props?.input.name}>{props?.input.name}</label>
        <input
          {...props}
        />
      </div>
    );
  }),
  exportToCsv: jest.fn(),
}));
