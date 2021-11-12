import React from 'react';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();
const renderWithRouter = children => render(<Router history={history}>{children}</Router>);

export default renderWithRouter;
