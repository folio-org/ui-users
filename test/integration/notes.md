# bulk-claim-returned
# bulk-loan-returned
# change-due-date
  /users/1/loans/open

# charge-fee-fine
  /users/preview/1

# claim-returned
  /users/`user.id`/loans/open (x2)
  /users/`user.id`/loans/view/`loan.id` (x2)

# closed loans
  /users/`user.id`/loans/closed (x2)

# declare-lost
  /users/`user.id`/loans/open (x2)
  /users/`user.id`/loans/view/`loan.id` (x4)

# fee-fine-details
# fee-fine-history
  /users/preview/`user.id`

# manual-patron-loan
  /users/`user.id`/loans/open
  /users/view/`user.id`

# mark-as-missing
  /users/`loan.userid`/loans/open (x2)
  /users/`loan.userid`/loans/view/`loan.id`

# open-loan-override
# open-loan-renew
  /users/`loan.userid`/loans/open (x2)

# overdue-loan-report
  /users

# patron-automated-blocks
  /users/view/user1

# patron-block
  /users/view/`hard-id`

# permissions-assign
  /users/preview/`user.id` (x2)

# user-create-page
  /users

# user-transfer
  /users/`user.id`/accounts/all (x2)

# user-view-page
  /users/view/`user.id` (x2)
  /users/view/`user2.id`

# users-show-all
# users-status-filter
  /users
