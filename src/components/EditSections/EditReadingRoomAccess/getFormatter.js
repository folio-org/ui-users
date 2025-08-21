/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Select, TextArea } from '@folio/stripes/components';

import { rraColumns, READING_ROOM_ACCESS_OPTIONS } from './constants';

export const getFormatter = (form) => {
  const updateRecord = (record, inputValue, name) => {
    const rraList = form.getFieldState('readingRoomsAccessList')?.value;
    const recordIndex = rraList?.findIndex((field) => field?.readingRoomId === record?.readingRoomId);
    if (rraList?.length && recordIndex !== -1) {
      form.change(`readingRoomsAccessList[${recordIndex}][${name}]`, inputValue);
    } else {
      const clonedRecord = cloneDeep(record);
      clonedRecord[name] = inputValue;
      if (!clonedRecord.id) {
        clonedRecord.id = uuidv4();
      }
      form.change(`readingRoomsAccessList[${rraList?.length || 0}]`, clonedRecord);
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
              <Select
                ariaLabel="reading-room access"
                dataOptions={READING_ROOM_ACCESS_OPTIONS}
                id="reading-room-access-select"
                defaultValue={record.access}
                value={record.access}
                onChange={(e) => {
                  updateRecord(record, e.target.value, input.name);
                }}
              />
            );
          }}
        />
      ),
      { rowIndex: PropTypes.number, record: PropTypes.shape({}) }
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
              marginBottom0
              value={record?.notes}
              onChange={(e) => {
                updateRecord(record, e.target.value, input.name);
              }}
            />
          )}
        />
      ),
      { rowIndex: PropTypes.number, record: PropTypes.shape({}) }
    )
  });
};
