# Autocomplete

The current implementation of `Autocomplete` component is based on [react-bootstrap-typeahead](https://github.com/ericgio/react-bootstrap-typeahead) and it's very basic. This may change in the future.

### Usage

import
```js
import Autocomplete from '@folio/stripes-components/lib/Autocomplete';
```

set some data...
```js
    const dataOptions = [
      {
        label:'United States',
        value: 'US',
      },
      {
        label:'United Kingdom',
        value: 'GB',
      },
    ];
```

Use the `Autocomplete` component in your jsx...
```js
<Autocomplete dataOptions={dataOptions} />
```

### Configuration (props)
Name | description | default | required
--- | --- | --- | ---
dataOptions | Array of objects with `label` and `value` properties |
