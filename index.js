import React from 'react';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import Users from './Users';

const NoMatch = ({ location }) => (
  // Why is location undefined here?
  <div>
    <h2>Uh-oh!</h2>
    <p>How did you get here?</p>
  </div>
);

export default ({pathname, connect}) => {
  console.log("matching", pathname);
  return <div>
    <h1>Users module</h1>
    <Match exactly pattern={`${pathname}`} component={connect(Users)}/> 
    <Match pattern={`${pathname}/:query`} component={connect(Users)}/> 
    <Miss component={NoMatch}/>
  </div>
};
