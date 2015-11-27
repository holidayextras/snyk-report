'use strict';

var report = require('../lib/report');

var targetDir = process.env.REPO_DIR || __dirname;
report(targetDir, function(err, output) {
  if (err) throw new Error(err);
  console.log(output);
});
