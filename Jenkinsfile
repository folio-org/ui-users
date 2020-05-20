@Library ('folio_jenkins_shared_libs') _

buildNPM {
  publishModDescriptor = 'yes'
  runLint = 'yes'
  runRegression = 'no'
  runSonarqube = true
  runTest = 'yes'
  runTestOptions = '--bundle --karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
}
