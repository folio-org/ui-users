import { screen } from '@folio/jest-config-stripes/testing-library/dom';
import renderWithRouter from 'helpers/renderWithRouter';

import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import BlockTemplateDetails from './BlockTemplateDetails';

jest.unmock('@folio/stripes/components');

const renderBlockTemplateDetails = (props) => renderWithRouter(<BlockTemplateDetails {...props} />);

const props = { initialValues: { metadata: { id: 'mock-match-params-id', createdDate: '2021-11-22T03:38:19.279+00:00' }, renewals: 'true', name: 'blockTemplate Test', code: 'components' } };

const props1 = { initialValues: { metadata: { id: 'mock-match-params-id' }, name: 'blockTemplate Test', code: 'components' } };

describe('Render BlockTemplateDetails component with', () => {
  it('Check for Template Information Accordian for created date', () => {
    renderBlockTemplateDetails(props);
    expect(screen.getByText('ViewMetaData')).toBeInTheDocument();
  });

  it('Check for Template Information Accordian if date not present', () => {
    renderBlockTemplateDetails(props1);
    expect(screen.queryByText('ViewMetaData')).not.toBeInTheDocument();
  });

  it('Render BlockTemplate Name', () => {
    renderBlockTemplateDetails(props);
    expect(screen.getByText('blockTemplate Test')).toBeInTheDocument();
  });

  it('Render BlockTemplate Code', () => {
    renderBlockTemplateDetails(props);
    expect(screen.getByText('components')).toBeInTheDocument();
  });

  it('Component must be rendered', () => {
    renderBlockTemplateDetails(props);
    expect(renderBlockTemplateDetails(props)).toBeTruthy();
  });

  it('Expand Button for template information', () => {
    renderBlockTemplateDetails(props);
    userEvent.click(document.querySelector('[id="accordion-toggle-button-templateInformation"]'));
    expect(renderBlockTemplateDetails(props)).toBeTruthy();
  });

  it('Component must be rendered', () => {
    renderBlockTemplateDetails(props);
    expect(renderBlockTemplateDetails(props)).toBeTruthy();
  });
});
