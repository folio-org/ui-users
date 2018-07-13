
node {
  stage('Test') {


    def tenant = 'foo'
    def okapiUrl = 'bar'
    // THE escape sequence from HELL
    def permissions = '\\\"\\\\\\\\\\\\\\\"perms.all\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"login.all\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"users.all\\\\\\\\\\\\\\\\"\\\"'

    echo "Permissions:  ${permissions}"

     // set vars in include file 
     sh "echo --- > vars_pr.yml"
     sh "echo okapi_url: $okapiUrl >> vars_pr.yml"
     sh "echo tenant: $tenant >> vars_pr.yml"
     sh "echo admin_user: { username: ${tenant}_admin, password: admin, " +
        "hash: 52DCA1934B2B32BEA274900A496DF162EC172C1E, " +
        "salt: 483A7C864569B90C24A0A6151139FF0B95005B16, " +
        "permissions: ${permissions}, " +
        "first_name: Admin, " +
        "last_name: ${tenant}, " +
        "email: admin@example.org } >> vars_pr.yml"
     // debug
    sh 'cat vars_pr.yml'
  }
    
}
