import {
  interactor,
  text,
} from '@bigtest/interactor';

@interactor class NoteDetailsField {
  value = text();
}

export default NoteDetailsField;
