/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Selection, TextArea } from '@folio/stripes/components';

import { rraColumns, READING_ROOM_ACCESS_OPTIONS } from './constants';

export const getFormatter = (form) => {
  const updateRecord = (record, val, name, rowIndex) => {
    const fieldState = form.getFieldState('readingRoomsAccessList');
    if (fieldState?.value && fieldState.value[rowIndex]) {
      form.change(`readingRoomsAccessList[${rowIndex}][${name}]`, val);
    } else {
      const clonedRecord = cloneDeep(record);
      clonedRecord[name] = val;
      if (!clonedRecord.id) {
        clonedRecord.id = uuidv4();
      }
      form.change(`readingRoomsAccessList[${rowIndex}]`, clonedRecord);
    }
  };

  return ({
    [rraColumns.ACCESS] : Object.assign(
      ({ rowIndex, ...record }) => (
        <Field
          name={`${rraColumns.ACCESS}`}
          id={`${rraColumns.ACCESS}-${rowIndex}`}
          aria-label={`${rraColumns.ACCESS}-${rowIndex}`}
          render={({ input }) => {
            return (
              <Selection
                ariaLabel="reading-room access"
                dataOptions={READING_ROOM_ACCESS_OPTIONS}
                id="reading-room-access-select"
                value={record.access}
                onChange={(val) => {
                  updateRecord(record, val, input.name, rowIndex);
                }}
              />
            );
          }}
        />
      ),
      { rowIndex: PropTypes.number, record: PropTypes.object }
    ),
    [rraColumns.READING_ROOM_NAME] : ({ readingRoomName }) => readingRoomName,
    [rraColumns.NOTES] : Object.assign(
      ({ rowIndex, ...record }) => (
        <Field
          name={`${rraColumns.NOTES}`}
          ariaLabel={`${rraColumns.NOTES}-${rowIndex}`}
          id={`${rraColumns.NOTES}-${rowIndex}`}
          render={({ input }) => (
            <TextArea
              {...input}
              fullWidth
              value={record?.notes}
              onChange={(e) => {
                updateRecord(record, e.target.value, input.name, rowIndex);
              }}
            />
          )}
        />
      ),
      { rowIndex: PropTypes.number, record: PropTypes.object }
    )
  });
};
