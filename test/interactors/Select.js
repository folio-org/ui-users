import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('select')({
  selector: 'select',
  locator: element => element.labels[0]?.textContent.replace(/\*$/, '').trim(),
  actions: {
    select: perform((element, value) => {
      const options = Array.from(element.options);
      const desiredOption = options.find(opt => opt.text === value);
      console.log(desiredOption);
      element.value = desiredOption.value;
      desiredOption.selected = true;

      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    })
  },
  filters: {
    id: element => element.id,
    name: element => element.name,
    value: element => element.value
  }
});
