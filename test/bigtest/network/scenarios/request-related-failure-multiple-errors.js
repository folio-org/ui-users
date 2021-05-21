/* istanbul ignore file */

export default (server) => {
  server.post('/circulation/renew-by-barcode', {
    'errors' : [{
      'message' : 'items cannot be renewed when there is an active recall request',
      'parameters' : [{
        'key' : 'request id',
        'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
      }],
      'overridableBlock' : {
        'name' : 'renewalDueDateRequiredBlock'
      }
    },
    {
      'message' : 'item is not loanable',
      'parameters' : [{
        'key' : 'request id',
        'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
      }],
      'overridableBlock' : {
        'name' : 'renewalDueDateRequiredBlock'
      }
    },
    {
      'message' : 'profile "" in the loan policy is not recognised',
      'parameters' : [{
        'key' : 'request id',
        'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
      }],
      'overridableBlock' : {
        'name' : 'renewalDueDateRequiredBlock'
      }
    },
    ]
  }, 422);
};
