import React from 'react';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import Users from './Users';

const NoMatch = ({ location }) => (
  <div>
    <h2>Whoops</h2>
    <p>Sorry but {location.pathname} didn’t match any pages</p>
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
