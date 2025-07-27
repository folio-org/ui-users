import { Form } from 'react-final-form';

import {
  Accordion,
  Icon,
} from '@folio/stripes/components';

import renderWithRouter from 'helpers/renderWithRouter';
import EditFeesFines from './EditFeesFines';
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
    <EditFeesFines
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

describe('EditFeesFines', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useCustomFieldsSection.mockReturnValue(undefined);
  });

  it('should render correct accordion label', () => {
    const { getByText } = renderEditLoans();

    expect(getByText('ui-users.accounts.title.feeFine')).toBeInTheDocument();
  });

  it('should render accordion with correct id', () => {
    const { container } = renderEditLoans();
    const accordion = container.querySelector('#test-accordion');

    expect(accordion).toBeInTheDocument();
  });

  it('should call useCustomFieldsSection with correct parameters', () => {
    renderEditLoans();

    expect(useCustomFieldsSection).toHaveBeenCalledWith({
      sectionId: 'fees_fines',
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
    const loadingSpinner = <Icon icon="spinner-ellipsis" />;
    useCustomFieldsSection.mockReturnValue(loadingSpinner);

    const { queryByText } = renderEditLoans();

    expect(queryByText('ui-users.accounts.title.feeFine')).not.toBeInTheDocument();
  });
});
