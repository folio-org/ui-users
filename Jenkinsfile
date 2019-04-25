@Library ('folio_jenkins_shared_libs@FOLIO-1948') _

buildNPM {
  publishModDescriptor = true
  runLint = false
  runRegression = false
  runSonarqube = false
  runTest = false
  runTestOptions = '--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
  stripesPlatform = [ repo:'platform-core', branch:'master']
}
