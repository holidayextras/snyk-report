'use strict';

var snyk = require('snyk');
var moment = require('moment');
var path = require('path');

var Report = module.exports = function(targetPath, callback) {
  snyk.test(targetPath, {}, Report._parseSnykResults.bind(Report, callback));
};

Report._colourCodes = {
  'high': '\x1b[31m',
  'medium': '\x1b[33m',
  'low': '\x1b[32m'
};

Report._parseSnykResults = function(callback, error, results) {
  if (error) return callback(error);

  var reportData = {};
  var reportOutput = '';

  for (var resultKey in results.vulnerabilities) {
    var result = results.vulnerabilities[resultKey];

    if (!reportData[result.name]) reportData[result.name] = this._newReportItem();

    var moduleData = reportData[result.name];
    var parentName = result.from[1].split('@')[0];

    moduleData[result.severity].push({
      title: result.title,
      path: path.join('node_modules', parentName),
      age: this._reportAge(result.time)
    });
  }

  reportOutput = this._formatOutput(reportData);

  if (reportOutput === '') reportOutput = '\x1b[32mNo vulnerabilities found';

  callback(null, reportOutput);
};

Report._reportAge = function(reportTime) {
  var currentTime = moment();
  return currentTime.diff(moment(reportTime, 'YYYY-MM-DD HH:mm:ss Z'), 'days');
};

Report._newReportItem = function() {
  return {
    high: [],
    medium: [],
    low: []
  };
};

Report._formatOutput = function(reportData) {
  var reportOutput = '';

  for (var moduleName in reportData) {
    var report = reportData[moduleName];

    reportOutput += '\x1b[1m' + moduleName + '\x1b[22m\n';

    reportOutput += this._reportLevels(report);

    reportOutput += '\x1b[0m';
  }

  reportOutput += this._reportSummary(reportData);

  return reportOutput;
};

Report._reportSummary = function(reportData) {
  var summaryOutput = '';

  var vulnerabilityCount = {
    low: 0,
    medium: 0,
    high: 0
  };

  for (var reportKey in reportData) {
    var report = reportData[reportKey];
    vulnerabilityCount.low += report.low.length;
    vulnerabilityCount.medium += report.medium.length;
    vulnerabilityCount.high += report.high.length;
  }

  if (vulnerabilityCount.low > 0) {
    summaryOutput += '\n' + this._colourCodes.low + 'Low: ' + vulnerabilityCount.low;
  }
  if (vulnerabilityCount.medium > 0) {
    summaryOutput += '\n' + this._colourCodes.medium + 'Medium: ' + vulnerabilityCount.medium;
  }
  if (vulnerabilityCount.high > 0) {
    summaryOutput += '\n' + this._colourCodes.high + 'High: ' + vulnerabilityCount.high;
  }

  if (summaryOutput !== '') {
    summaryOutput = '\x1b[1mSummary\x1b[22m' + summaryOutput + '\n';
  }

  return summaryOutput;
};

Report._reportLevels = function(report) {
  var reportOutput = '';

  reportOutput += this._formatItems(report.low, this._colourCodes.low);
  reportOutput += this._formatItems(report.medium, this._colourCodes.medium);
  reportOutput += this._formatItems(report.high, this._colourCodes.high);

  return reportOutput;
};

Report._formatItems = function(reportItems, colourCode) {
  var itemsOutput = '';

  reportItems.forEach(function(item) {
    itemsOutput += colourCode + item.title + '\n';
    itemsOutput += colourCode + 'Call `snyk test ' + item.path + '` for more info\n\n';
  });

  return itemsOutput;
};
