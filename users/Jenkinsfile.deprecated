@Library ('folio_jenkins_shared_libs') _

buildNPM {
  publishModDescriptor = 'yes'
  runLint = 'yes'
  runRegression = 'no'
  runSonarqube = true
  runScripts = [
   ['formatjs-compile': ''],
   ['test':'--ci --coverage --colors'],
  ]
}