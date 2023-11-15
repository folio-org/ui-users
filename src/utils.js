import { DCB_USER } from './constants';

/*
  DCB Transactions (where FOLIO plays a) lending role work with virtual patons,
  whose lastname is hard coded to "DcbSystem"
*/
// eslint-disable-next-line import/prefer-default-export
export const isAVirtualPatron = (lastName) => lastName === DCB_USER.lastName;
