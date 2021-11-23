// import React from 'react';
// import {
//   reduxForm,
// } from 'redux-form';
// import {
//   createStore,
//   combineReducers,
// } from 'redux';
// import { Provider } from 'react-redux';

import { Form } from 'react-final-form';

const renderWithFinalForm = Component => {
  const onSubmit = jest.fn();
  return (
    <Form
      onSubmit={onSubmit}
      render={props => (
        <Component {...props} />
      )
      }
    />
  );
};

export default renderWithFinalForm;



// export const renderWithForm = (component, initialStateValues = {}, formFieldValues = {}) => {
//   const onSubmit = jest.fn();
//   const fieldReducer = (state = initialStateValues) => state;
//   const reducer = combineReducers({
//     field: fieldReducer,
//   });
//   const store = createStore(reducer);

//   const Decorated = reduxForm({
//     form: 'testForm',
//     onSubmit: { onSubmit },
//   })(component);

//   return (
//     <Provider store={store}>
//       <Decorated
//         {...formFieldValues}
//       />
//     </Provider>
//   );
// };