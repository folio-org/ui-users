import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useReactToPrint } from 'react-to-print';

import useStaffSlips from '../useStaffSlips';
import usePrintData, { buildTemplate, mapEntityToTemplate } from './usePrintData';
import { SLIPS_TYPES } from '../useStaffSlips/useStaffSlips';
import { formatDateAndTime } from '../../components/util';

import '../../../test/jest/__mock__';

jest.mock('react-to-print', () => ({
  useReactToPrint: jest.fn(),
}));

jest.mock('../useStaffSlips');

jest.mock('../../components/util', () => ({
  formatDateAndTime: jest.fn(),
}));

describe('buildTemplate', () => {
  it('should replace tokens with data source values', () => {
    const template = '<p>{{borrower.firstName}} {{borrower.lastName}}</p>';
    const dataSource = {
      'borrower.firstName': 'John',
      'borrower.lastName': 'Doe',
    };

    const templateFn = buildTemplate(template);
    const result = templateFn(dataSource);

    expect(result).toBe('<p>John Doe</p>');
  });

  it('should escape HTML characters in data source values', () => {
    const template = '<p>{{borrower.firstName}}</p>';
    const dataSource = {
      'borrower.firstName': '<John>',
    };

    const templateFn = buildTemplate(template);
    const result = templateFn(dataSource);

    expect(result).toBe('<p>&lt;John&gt;</p>'); // Expect HTML characters to be escaped
  });

  it('should return an empty string for undefined or non-string/number values', () => {
    const template = '<p>{{borrower.age}}</p>';
    const dataSource = {
      'borrower.age': undefined,
    };

    const templateFn = buildTemplate(template);
    const result = templateFn(dataSource);

    expect(result).toBe('<p></p>');
  });

  it('should return the original template if there are no matching tokens', () => {
    const template = '<p>No tokens here</p>';
    const dataSource = {};

    const templateFn = buildTemplate(template);
    const result = templateFn(dataSource);

    expect(result).toBe('<p>No tokens here</p>');
  });
});

describe('mapEntityToTemplate', () => {
  beforeEach(() => {
    formatDateAndTime.mockReset();
  });

  it('should map entity fields correctly for SLIPS_TYPES.DUE_DATE', () => {
    const entity = {
      borrower: {
        firstName: 'Jane',
        preferredFirstName: 'Janie',
        middleName: 'A.',
        lastName: 'Doe',
        patronGroup: '1234',
      },
      item: {
        title: 'The Great Gatsby',
        primaryContributor: 'F. Scott Fitzgerald',
        accessionNumber: 'PV-R5937',
        administrativeNotes: ['Very fragile', 'Once belonged to Hillare Belloc'],
        datesOfPublication: ['1925', '1942'],
        editions: ['1st', '3rd'],
        physicalDescriptions: ['printed on vellum', 'bound in snow-leopard hide'],
        instanceHrid: 'ins000012368',
      },
      dueDate: '2024-10-10T12:00:00Z',
      patronGroupAtCheckout: {
        name: 'facility'
      }
    };

    // Mock `formatDateAndTime` to return a formatted date
    formatDateAndTime.mockReturnValue('October 10, 2024');

    const result = mapEntityToTemplate(entity, SLIPS_TYPES.DUE_DATE, 'short', {
      group: 'facility',
      id: '1234'
    });

    expect(result).toEqual({
      'borrower.firstName': 'Jane',
      'borrower.preferredFirstName': 'Janie',
      'borrower.middleName': 'A.',
      'borrower.lastName': 'Doe',
      'borrower.patronGroup': 'facility',
      'item.title': 'The Great Gatsby',
      'item.primaryContributor': 'F. Scott Fitzgerald',
      'item.accessionNumber': 'PV-R5937',
      'item.administrativeNotes': 'Very fragile/Once belonged to Hillare Belloc',
      'item.datesOfPublication': '1925/1942',
      'item.editions': '1st/3rd',
      'item.physicalDescriptions': 'printed on vellum/bound in snow-leopard hide',
      'item.instanceHrid': 'ins000012368',
      'item.instanceHridImage': '<Barcode>ins000012368</Barcode>',
      'loan.dueDate': 'October 10, 2024',
    });
  });

  it('should return the entity itself for types other than SLIPS_TYPES.DUE_DATE', () => {
    const entity = {
      borrower: {
        firstName: 'John',
      },
    };

    const result = mapEntityToTemplate(entity, 'OTHER_TYPE', 'short');

    expect(result).toBe(entity);
  });

  describe('when entity.item is missing and type is SLIPS_TYPES.DUE_DATE', () => {
    it('should not throw an error and map available fields', () => {
      const entity = {
        borrower: {
          firstName: 'John',
          lastName: 'Doe',
        },
        dueDate: '2024-10-10T12:00:00Z',
      };
      const slipType = 'Due date receipt';

      const result = mapEntityToTemplate(entity, slipType, 'short');

      expect(result).toBe(entity);
    });
  });
});

describe('usePrintData', () => {
  beforeEach(() => {
    // Mock the implementation of useStaffSlips
    useStaffSlips.mockReturnValue({
      staffSlips: [
        {
          id: '0b52bca7-db17-4e91-a740-7872ed6d7323',
          name: 'Due date receipt',
          active: true,
          template: '<p>{{item.title}}</p><p>{{loan.dueDate}}</p>',
        },
      ],
    });

    formatDateAndTime.mockImplementation(() => 'formatted date');

    useReactToPrint.mockReturnValue(jest.fn());
  });

  it('should generate dataSource and templateFn correctly', () => {
    const entities = [
      {
        borrower: {
          firstName: 'John',
          lastName: 'Doe',
        },
        item: {
          title: 'ABBA',
          instanceHrid: 'ins000012367',
        },
        dueDate: '2024-10-10T12:00:00Z',
      },
    ];

    const { result } = renderHook(() => usePrintData(entities, SLIPS_TYPES.DUE_DATE));

    expect(result.current.dataSource).toEqual([
      {
        'borrower.firstName': 'John',
        'borrower.preferredFirstName': undefined,
        'borrower.middleName': undefined,
        'borrower.lastName': 'Doe',
        'borrower.patronGroup': undefined,
        'item.title': 'ABBA',
        'item.primaryContributor': undefined,
        'item.instanceHrid': 'ins000012367',
        'item.instanceHridImage': '<Barcode>ins000012367</Barcode>',
        'loan.dueDate': 'formatted date',
      },
    ]);

    const templateOutput = result.current.templateFn(result.current.dataSource[0]);
    expect(templateOutput).toBe('<p>ABBA</p><p>formatted date</p>');
  });
});
