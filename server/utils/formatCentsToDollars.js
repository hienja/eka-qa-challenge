import {isNil} from 'lodash';

export default (cents) => {
  if (isNil(cents)) return null;
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD'});
};
