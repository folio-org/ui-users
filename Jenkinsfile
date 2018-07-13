
node (
  stage('Test') {


    def tenant = 'foo'
    def okapiUrl = 'bar'

    // set vars in include file 
    sh "echo --- > vars_pr.yml"
    sh "echo okapi_url: $okapiUrl >> vars_pr.yml"
    sh "echo tenant: $tenant >> vars_pr.yml"
    sh "echo admin_user: { username: ${tenant}_admin, password: admin, hash: 52DCA1934B2B32BEA274900A496DF162EC172C1E, salt: 483A7C864569B90C24A0A6151139FF0B95005B16, permissions: \\"\\\"perms.all\\\",\\\"login.all\\\",\\\"users.all\\\"\\", first_name: TENANT, last_name: ADMINISTRATOR, email: admin@diku.example.org } >> vars_pr.yml"

    // debug
    sh 'cat vars_pr.yml'
  }
    
}
