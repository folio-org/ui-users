@Library ('folio_jenkins_shared_libs@FOLIO-1596') _

buildNPM {
  publishModDescriptor = true
  runLint = true
  runSonarqube = true
  runTest = true
  runTestOptions = '--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
}
