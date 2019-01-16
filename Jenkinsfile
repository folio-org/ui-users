@Library ('folio_jenkins_shared_libs@FOLIO-1596') _

buildNPM {
  publishModDescriptor = true
  runLint = true
  runRegression = false
  runSonarqube = true
  runTest = false
  runTestOptions = '--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
  stripesPlatform = [ repo:'platform-core', branch:'snapshot' ]
}
