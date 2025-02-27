import { useMemo, useRef } from 'react';
import get from 'lodash/get';
import { useIntl } from 'react-intl';
import { escape } from 'lodash';
import { useReactToPrint } from 'react-to-print';

import useStaffSlips from '../useStaffSlips';
import { SLIPS_TYPES } from '../useStaffSlips/useStaffSlips';
import { formatDateAndTime } from '../../components/util';

export function buildTemplate(template = '') {
  return dataSource => {
    return template.replace(/{{([^{}]*)}}/g, (token, tokenName) => {
      const tokenValue = dataSource[tokenName];

      if (
        typeof tokenValue === 'string'
        && tokenValue.startsWith('<Barcode>')
        && tokenValue.endsWith('</Barcode>')
      ) {
        return tokenValue;
      } else if (typeof tokenValue === 'string' || typeof tokenValue === 'number') {
        return escape(tokenValue);
      } else {
        return '';
      }
    });
  };
}

export const mapEntityToTemplate = (entity, type, formatTime, patronGroup) => {
  if (type === SLIPS_TYPES.DUE_DATE) {
    const barcode = get(entity, 'item.barcode');

    return {
      'borrower.firstName': get(entity, 'borrower.firstName'),
      'borrower.preferredFirstName': get(entity, 'borrower.preferredFirstName'),
      'borrower.middleName': get(entity, 'borrower.middleName'),
      'borrower.lastName': get(entity, 'borrower.lastName'),
      'borrower.patronGroup': get(entity, 'borrower.patronGroup') === patronGroup?.id ? patronGroup.group : undefined,

      'item.title': get(entity, 'item.title'),
      'item.primaryContributor': get(entity, 'item.primaryContributor'),
      'item.allContributors': get(entity, 'item.contributors')?.map(({ name }) => name).join(', '),
      'item.barcode': barcode,
      'item.barcodeImage': barcode && `<Barcode>${barcode}</Barcode>`,
      'item.callNumber': get(entity, 'item.callNumber'),
      'item.callNumberPrefix': get(entity, 'item.callNumberComponents.prefix'),
      'item.callNumberSuffix': get(entity, 'item.callNumberComponents.suffix'),
      'item.copy': get(entity, 'item.copyNumber'),
      'item.displaySummary': get(entity, 'item.displaySummary'),
      'item.enumeration': get(entity, 'item.enumeration'),
      'item.volume': get(entity, 'item.volume'),
      'item.chronology': get(entity, 'item.chronology'),
      'item.materialType': get(entity, 'item.materialType')?.name,
      'item.accessionNumber': entity?.item.accessionNumber,
      'item.administrativeNotes': entity?.item.administrativeNotes?.join('/'),
      'item.datesOfPublication': entity?.item.datesOfPublication?.join('/'),
      'item.editions': entity?.item.editions?.join('/'),
      'item.physicalDescriptions': entity?.item.physicalDescriptions?.join('/'),
      'item.instanceHrid': entity?.item.instanceHrid,
      'item.instanceHridImage': `<Barcode>${entity?.item.instanceHrid}</Barcode>`,
      'loan.dueDate': formatDateAndTime(get(entity, 'dueDate'), formatTime),
    };
  }

  return entity;
};

const usePrintData = (entities = [], type = SLIPS_TYPES.DUE_DATE, patronGroup = {}) => {
  const { formatTime } = useIntl();
  const { staffSlips } = useStaffSlips();
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const template = useMemo(() => staffSlips.find(slip => slip.name === type)?.template, [staffSlips, type]);

  const dataSource = useMemo(() => entities.map(entity => mapEntityToTemplate(entity, type, formatTime, patronGroup)), [entities, type, formatTime, patronGroup]);

  const templateFn = useMemo(() => buildTemplate(template), [template]);

  const handleRef = el => {
    contentRef.current = el;
  };


  return {
    dataSource,
    templateFn,
    reactToPrintFn,
    handleRef,
  };
};

export default usePrintData;
