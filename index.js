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
  console.log("matching", pathname, ": this =", this);
  // Location should be in this.props.location, but this is undefined.
  return <div>
    <h1>Users module</h1>
    <Match exactly pattern={`${pathname}`} component={connect(Users)}/> 
    <Match exactly pattern={`${pathname}/:query`} component={connect(Users)}/>
    <Match         pattern={`${pathname}/:query?/view/:userid`} component={connect(Users)}/>
    <Miss component={NoMatch}/>
  </div>
};
