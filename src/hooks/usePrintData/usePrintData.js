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
      return typeof tokenValue === 'string' || typeof tokenValue === 'number' ? escape(tokenValue) : '';
    });
  };
}

export const mapEntityToTemplate = (entity, type, formatTime, patronGroup) => {
  if (type === SLIPS_TYPES.DUE_DATE) {
    return {
      'borrower.firstName': get(entity, 'borrower.firstName'),
      'borrower.preferredFirstName': get(entity, 'borrower.preferredFirstName'),
      'borrower.middleName': get(entity, 'borrower.middleName'),
      'borrower.lastName': get(entity, 'borrower.lastName'),
      'borrower.patronGroup': get(entity, 'borrower.patronGroup') === patronGroup?.id ? patronGroup.group : undefined,

      'item.title': get(entity, 'item.title'),
      'item.primaryContributor': get(entity, 'item.primaryContributor'),
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
