import {
  interactor,
  scoped,
} from '@bigtest/interactor';

export default interactor(class KeyValue {
  label = scoped('div');
  value = scoped('div:nth-child(2)');
});
