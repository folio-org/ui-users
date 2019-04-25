@Library ('folio_jenkins_shared_libs@FOLIO-1948') _

buildNPM {
  publishModDescriptor = true
  runLint = true
  runRegression = false
  runSonarqube = false
  runTest = true
  runTestOptions = '--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
  stripesPlatform = ['platform-core':'master']
}
