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
