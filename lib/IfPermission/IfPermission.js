/*
  Yields the child elements only if the permission named in the props
  is present for the current user. The 'currentPermssions' prop must
  be passed in, which can most easily be done as part of
  {...this.props}. So a typical invocation would be:
  
      <IfPermission {...this.props} perm="users.edit">
        <button onClick={this.onClickEditUser}>Edit</button>
      </IfPermission>
*/

const IfPermission = props =>
  (_.get(props, ['currentPerms', props.perm]) ? props.children : null);


export default IfPermission;
