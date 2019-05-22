@Library ('folio_jenkins_shared_libs@FOLIO-2036') _


buildNPM {
  publishModDescriptor = true
  runLint = true
  runRegression = false
  runSonarqube = false
  runTest = true
  runTestOptions = '--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit 
--coverage'
  stripesPlatform = [ repo:'platform-core', branch:'master' ]
}


