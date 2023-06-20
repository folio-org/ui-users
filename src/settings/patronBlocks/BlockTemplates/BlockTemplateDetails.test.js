import { screen } from '@folio/jest-config-stripes/testing-library/dom';
import { within } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import BlockTemplateDetails from './BlockTemplateDetails';

jest.unmock('@folio/stripes/components');

const renderBlockTemplateDetails = (props) => renderWithRouter(<BlockTemplateDetails {...props} />);

const propsBlocked = {
  initialValues: {
    metadata: {
      id: 'mock-match-params-id',
      createdDate: '2021-11-22T03:38:19.279+00:00'
    },
    name: 'blockTemplate Test',
    code: 'code',
    blockTemplate: {
      borrowing: true,
      renewals: true,
      requests: true,
    }
  }
};

const propsUnblocked = {
  initialValues: {
    metadata: {
      id: 'mock-match-params-id',
      createdDate: '2021-11-22T03:38:19.279+00:00'
    },
    renewals: 'true',
    name: 'blockTemplate Test',
    code: 'code',
    blockTemplate: {
      borrowing: false,
      renewals: false,
      requests: false,
    }
  }
};

describe('BlockTemplateDetails', () => {
  it('check for template and block details', () => {
    renderBlockTemplateDetails(propsBlocked);

    expect(screen.getByText('ViewMetaData')).toBeInTheDocument();
    expect(screen.getByText('blockTemplate Test')).toBeInTheDocument();
    expect(screen.getByText('code')).toBeInTheDocument();
  });

  it('toggle template accordion', () => {
    renderBlockTemplateDetails(propsBlocked);
    userEvent.click(document.querySelector('[id="accordion-toggle-button-templateInformation"]'));

    // template accordion is closed; with 'expanded' has length 0
    const tcontainer = document.querySelector('[id=templateInformation]');
    const taccordion = tcontainer.getElementsByClassName('content-wrap');
    const taccordionOpen = tcontainer.getElementsByClassName('content-wrap expanded');
    expect(taccordion.length).toBe(1);
    expect(taccordionOpen.length).toBe(0);

    // block accordion is open; with 'expanded' has length 1
    const bcontainer = document.querySelector('[id=blockInformation]');
    const baccordion = bcontainer.getElementsByClassName('content-wrap expanded');
    expect(baccordion.length).toBe(1);
  });

  it('shows blocked actions', () => {
    renderBlockTemplateDetails(propsBlocked);

    const borrow = document.querySelector('[id=block-template-borrowing]');
    expect(within(borrow).getByText('Icon (select-all)')).toBeInTheDocument();

    const renew = document.querySelector('[id=block-template-renewals]');
    expect(within(renew).getByText('Icon (select-all)')).toBeInTheDocument();

    const request = document.querySelector('[id=block-template-requests]');
    expect(within(request).getByText('Icon (select-all)')).toBeInTheDocument();
  });

  it('shows unblocked actions', () => {
    renderBlockTemplateDetails(propsUnblocked);

    const borrow = document.querySelector('[id=block-template-borrowing]');
    expect(within(borrow).getByText('Icon (deselect-all)')).toBeInTheDocument();

    const renew = document.querySelector('[id=block-template-renewals]');
    expect(within(renew).getByText('Icon (deselect-all)')).toBeInTheDocument();

    const request = document.querySelector('[id=block-template-requests]');
    expect(within(request).getByText('Icon (deselect-all)')).toBeInTheDocument();
  });
});
