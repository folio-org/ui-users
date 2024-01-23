
import { render, waitFor, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import PatronNoticePrintJobs, { generateFormatter } from './PatronNoticePrintJobs';

jest.unmock('@folio/stripes/components');

jest.mock('@folio/stripes/core', () => ({
  stripesConnect: jest.fn(Component => Component),
  useOkapiKy: jest.fn(),
  useCallout: jest.fn(),
}));

global.URL.createObjectURL = jest.fn();
global.window.open = jest.fn();

const PDF_IN_HEX = '255044462d312e330a25e2e3cfd30a312030206f626a0a3c3c2f57696474682032203020522f4865696768742033203020522f547970652033203020522f537562747970652034203020522f46696c7465722035203020522f436f6c6f7253706163652036203020522f4c656e6774682037203020522f4865696768742038203020522f417373656d626c792035203020522f50726f632033203020';

describe('PatronNoticePrintJobs', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  const mockMutator = {
    printingJob: {
      GET: jest.fn(() => ({ content: PDF_IN_HEX })),
      reset: jest.fn(),
    },
    entries: {
      reset: jest.fn(),
    }
  };

  const mockRecords = [
    { id: '1', created: '2022-01-01T12:00:00Z', selected: false },
    { id: '2', created: '2022-01-02T12:00:00Z', selected: false },
  ];

  it('renders data', async () => {
    const { container } = render(<PatronNoticePrintJobs mutator={mockMutator} records={mockRecords} />);
    expect(container).toHaveTextContent('2022-01-01');
  });

  it('calls openPDF', async () => {
    render(<PatronNoticePrintJobs mutator={mockMutator} records={mockRecords} />);

    const textElement = screen.getByText(/2022-01-01/i);
    const printJobLinkElement = textElement.closest('.printJobLink');

    userEvent.click(printJobLinkElement);

    await waitFor(() => {
      expect(mockMutator.printingJob.GET).toHaveBeenCalledTimes(1);
    });
  });


  it('calls markAllPrintJobForDeletions', async () => {
    const { getAllByRole } = render(<PatronNoticePrintJobs mutator={mockMutator} records={mockRecords} />);
    const checkboxes = getAllByRole('checkbox');

    userEvent.click(checkboxes[0]);

    await waitFor(() => {
      checkboxes.slice(1).forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  it('calls markPrintJobForDeletion', async () => {
    const { getAllByRole } = render(<PatronNoticePrintJobs mutator={mockMutator} records={mockRecords} />);
    const checkboxes = getAllByRole('checkbox');
    const checkbox = checkboxes[1];

    userEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });
});

describe('generateFormatter', () => {
  it('returns correct formatter', () => {
    const markPrintJobForDeletion = jest.fn();
    const openPDF = jest.fn();
    const formatter = generateFormatter(markPrintJobForDeletion, openPDF);

    expect(typeof formatter.id).toBe('function');
    expect(typeof formatter.created).toBe('function');
  });
});
