
import { orderBy } from 'lodash';
import { Button, Pane, MenuSection, MultiColumnList, Checkbox, FormattedDate, FormattedTime, TextLink } from '@folio/stripes/components';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useOkapiKy, useCallout, useStripes } from '@folio/stripes/core';

import css from './PatronNoticePrintJobs.css';

const ASC = 'ascending';
const DESC = 'descending';
const visibleColumns = ['id', 'created'];

export const generateFormatter = (markPrintJobForDeletion, openPDF) => {
  return {
    id: (item) => (
      <Checkbox
        type="checkbox"
        checked={item.selected}
        onChange={() => markPrintJobForDeletion(item)}
      />
    ),
    created: (item) => (
      <TextLink className={css.printJobLink} onClick={() => openPDF(item)}>
        <FormattedDate value={item.created} /> <FormattedTime value={item.created} />
      </TextLink>
    )
  };
};

const PatronNoticePrintJobs = (props) => {
  const { records, mutator, onClose } = props;
  const [contentData, setContentData] = useState([]);
  const [sortOrder, setSortOrder] = useState(DESC);
  const [allSelected, toggleSelectAll] = useState(false);
  const sort = () => setSortOrder(sortOrder === DESC ? ASC : DESC);
  const ky = useOkapiKy();
  const callout = useCallout();
  const stripes = useStripes();

  const markPrintJobForDeletion = (item) => {
    const clonedData = [...contentData];
    const index = clonedData.findIndex(el => el.id === item.id);

    clonedData[index] = { ...item, selected: !item.selected };
    setContentData(clonedData);
  };

  const markAllPrintJobForDeletions = () => {
    toggleSelectAll(!allSelected);
    const clonedData = contentData.map(el => ({ ...el, selected: !allSelected }));
    setContentData(clonedData);
  };

  const openPDF = async (item) => {
    try {
      mutator.printingJob.reset();
      const { content } = await mutator.printingJob.GET({ path: `print/entries/${item.id}` });
      const bytes = new Uint8Array(content.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank');
    } catch (error) {
      callout.sendCallout({
        message: <FormattedMessage id="ui-users.patronNoticePrintJobs.errors.pdf" />,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    const updatedRecords =
      orderBy(records, (item) => item.created, sortOrder === DESC ? 'desc' : 'asc')
        .map(record => ({
          ...record,
          selected: !!record.selected,
        }));

    setContentData(updatedRecords);
  }, [records, sortOrder]);

  const formatter = generateFormatter(markPrintJobForDeletion, openPDF);
  const columnMapping = {
    id: <Checkbox type="checkbox" onChange={() => markAllPrintJobForDeletions()} />,
    created: <FormattedMessage id="ui-users.patronNoticePrintJobs.created" />,
  };

  const renderActionMenu = ({ onToggle }) => {
    const removeSelectedPrintJobs = async () => {
      const selectedJobs = contentData.filter(item => item.selected);
      const ids = selectedJobs.map(job => job.id).join(',');
      const filtered = contentData.filter(item => !item.selected);

      await ky.delete(`print/entries?ids=${ids}`);

      setContentData(filtered);
      onToggle();
      toggleSelectAll(false);
    };

    return (
      <MenuSection label={<FormattedMessage id="ui-users.patronNoticePrintJobs.actions" />}>
        <Button buttonStyle="dropdownItem" onClick={removeSelectedPrintJobs}>
          <FormattedMessage id="ui-users.patronNoticePrintJobs.actions.delete" />
        </Button>
      </MenuSection>
    );
  };

  const actionMenu = stripes?.hasPerm('ui-users.patron-notice-print-jobs.delete') ? renderActionMenu : null;

  return (
    <Pane
      paneTitle={
        <FormattedMessage id="ui-users.patronNoticePrintJobs.label" />
      }
      defaultWidth="fill"
      dismissible
      actionMenu={actionMenu}
      onClose={onClose}
    >
      <MultiColumnList
        contentData={contentData}
        formatter={formatter}
        visibleColumns={visibleColumns}
        columnMapping={columnMapping}
        onHeaderClick={sort}
        sortDirection={sortOrder}
        sortedColumn="created"
        nonInteractiveHeaders={['id']}
        interactive={false}
      />
    </Pane>
  );
};

PatronNoticePrintJobs.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  mutator: PropTypes.shape({
    printingJob: PropTypes.shape({
      GET: PropTypes.func,
      reset: PropTypes.func,
    }),
  }).isRequired,
};

export default PatronNoticePrintJobs;
