import { Form } from 'react-final-form';

import {
  Icon,
  Accordion,
} from '@folio/stripes/components';

import renderWithRouter from 'helpers/renderWithRouter';
import EditLoans from './EditLoans';
import { useCustomFieldsSection } from '../../../hooks';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useCustomFieldsSection: jest.fn(),
}));

Accordion.mockImplementation(({ children, label, ...rest }) => (
  <span
    {...rest}
  >
    <>
      {label}
      {children}
    </>
  </span>
));

Icon.mockImplementation(({ icon }) => <span>{icon}</span>);

const renderEditLoans = ({ formProps = {}, ...props } = {}) => {
  const Component = () => (
    <EditLoans
      accordionId="test-accordion"
      {...props}
    />
  );

  return renderWithRouter(
    <Form
      initialValues={{}}
      onSubmit={jest.fn()}
      render={Component}
      {...formProps}
    />
  );
};

describe('EditLoans', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useCustomFieldsSection.mockReturnValue(undefined);
  });

  it('should render correct accordion label', () => {
    const { getByText } = renderEditLoans();

    expect(getByText('ui-users.loans.title')).toBeInTheDocument();
  });

  it('should render accordion with correct id', () => {
    const { container } = renderEditLoans();
    const accordion = container.querySelector('#test-accordion');

    expect(accordion).toBeInTheDocument();
  });

  it('should call useCustomFieldsSection with correct parameters', () => {
    renderEditLoans();

    expect(useCustomFieldsSection).toHaveBeenCalledWith({
      sectionId: 'loans'
    });
  });

  it('should return loading spinner when useCustomFieldsSection returns loading state', () => {
    const loadingSpinner = <Icon icon="spinner-ellipsis" />;
    useCustomFieldsSection.mockReturnValue(loadingSpinner);

    const { getByText } = renderEditLoans();

    expect(getByText('spinner-ellipsis')).toBeInTheDocument();
  });

  it('should return null when useCustomFieldsSection returns null (no custom fields)', () => {
    useCustomFieldsSection.mockReturnValue(null);

    const { container } = renderEditLoans();

    expect(container.firstChild).not.toBeInTheDocument();
  });

  it('should not render accordion when useCustomFieldsSection returns a render state', () => {
    const customComponent = <div data-testid="custom-component">Custom render state</div>;
    useCustomFieldsSection.mockReturnValue(customComponent);

    const { queryByText } = renderEditLoans();

    expect(queryByText('ui-users.loans.title')).not.toBeInTheDocument();
  });
});
