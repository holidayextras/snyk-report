var expect = require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai'))
  .expect;
var sinon = require('sinon');
var Report = require('../../lib/report');
var snyk = require('snyk');

context('Report', function() {

  describe('_risks', function() {

    describe('high', function () {

      it('has a colour of red', function() {
        expect(Report._risks[0].colour).to.equal('red');
      });

    });

    describe('medium', function () {

      it('has a colour of yellow', function() {
        expect(Report._risks[1].colour).to.equal('yellow');
      });

    });

    describe('low', function () {

      it('has a colour of green', function() {
        expect(Report._risks[2].colour).to.equal('green');
      });

    });

  });

  describe('_groupResults()', function() {

    var grouped;

    context('without any vulnerabilities', function() {

      before(function() {
        grouped = Report._groupResults({});
      });

      it('returns an object', function() {
        expect(grouped).to.be.an('object');
      });

    });

    context('with vulnerabilities', function() {

      before(function() {
        sinon.stub(Report, '_reportAge');

        var results = {
          vulnerabilities: [{
            id: 1234,
            severity: 'high',
            name: 'shoddyjs',
            title: 'l33t exploit',
            from: [
              'currentProject',
              '3rdPartyLib',
              'shoddyjs'
            ],
            creationTime: '2015-01-01 12:34:56 Z'
          }]
        };
        grouped = Report._groupResults(results);
      });

      after(function() {
        Report._reportAge.restore();
      });

      it('returns an object', function() {
        expect(grouped).to.be.an('object');
      });

      it('assigns the vulnerbility to the correct serverity key', function() {
        expect(grouped.high).to.be.an('array').and.have.length(1);
      })

      it('calculates the age of vulnerabilities', function() {
        expect(Report._reportAge).to.have.been.called();
      })

      describe('vulnerabilities', function() {

        var vulnerability;

        before(function() {
          vulnerability = grouped.high[0];
        });

        it('sets the ID', function() {
          expect(vulnerability.id).to.equal(1234);
        });

        it('sets the name', function() {
          expect(vulnerability.name).to.equal('shoddyjs');
        });

        it('sets the title', function() {
          expect(vulnerability.title).to.equal('l33t exploit');
        });

        it('does not include the current package in the path', function() {
          expect(vulnerability.path[0]).to.equal('3rdPartyLib');
        })

      });

    });

  });

  describe('_reportAge()', function() {

    var clock;

    before(function() {
      clock = sinon.useFakeTimers(new Date(2015, 10, 20).getTime());
    });

    after(function() {
      clock.restore();
    });

    it('returns the number of days from the current date', function() {
      expect(Report._reportAge('2015-11-19 00:00:00 0')).to.equal(1);
    });

  });

  describe('_formatVulns()', function() {

    var formatted;

    context('without any vulnerabilities', function() {

      before(function() {
        formatted = Report._formatVulns({});
      });

      it('returns an empty string', function() {
        expect(formatted).to.equal('');
      });

    });

    context('with vulnerabilities', function() {

      before(function() {
        sinon.stub(Report, '_formatVuln');

        var grouped = {
          high: [{}]
        };
        formatted = Report._formatVulns(grouped);
      });

      after(function() {
        Report._formatVuln.restore();
      });

      it('returns a string', function() {
        expect(formatted).to.be.a('string');
      });

      it('formats the vulnerability', function() {
        expect(Report._formatVuln).to.have.been.called();
      });

    });

  });

  describe('_formatVuln()', function() {

    var formatted;

    before(function() {
      var risk = {
        name: 'high',
        colour: 'red'
      };
      var vuln = {
        id: 1234,
        name: 'pwnedjs',
        title: 'privilaged command execution',
        path: [
          '3rdPartyJs',
          'sshServerJs'
        ],
        age: 10
      };
      formatted = Report._formatVuln(risk, vuln);
    });

    it('outputs the risk severity in upper case', function() {
      expect(formatted).to.match(/HIGH\:/);
    });

    it('outputs the name and title together', function() {
      expect(formatted).to.match(/pwnedjs - privilaged command execution/);
    });
    
    it('shows the module hierarchy with arrows', function() {
      expect(formatted).to.match(/3rdPartyJs -> sshServerJs/);
    });

    it('outputs the age in days', function() {
      expect(formatted).to.match(/10 days old/);
    });

    it('outputs a link to the synk site', function() {
      expect(formatted).to.match(/https\:\/\/app\.snyk\.io\/vuln\/1234/);
    });

  });

  describe('_createSummary()', function() {

    var summary;

    context('with issues', function() {

      before(function() {
        var grouped = {
          high: [
           {},
           {},
           {}
          ],
          medium: [
           {},
           {}
          ],
          low: [
            {}
          ]
        };
        summary = Report._createSummary(grouped);
      });

      it('counts high issues correctly', function() {
        expect(summary.high).to.equal(3);
      })

      it('counts medium issues correctly', function() {
        expect(summary.medium).to.equal(2);
      })

      it('counts high issues correctly', function() {
        expect(summary.low).to.equal(1);
      })

    });

    context('without issues', function() {

      before(function() {
        summary = Report._createSummary({});
      });

      it('counts high issues correctly', function() {
        expect(summary.high).to.equal(0);
      })

      it('counts medium issues correctly', function() {
        expect(summary.medium).to.equal(0);
      })

      it('counts high issues correctly', function() {
        expect(summary.low).to.equal(0);
      })

    });

  });

  describe('_formatSummary()', function() {

    var testData;

    context('with issues', function() {

      before(function() {
        testData = {
           high: 1,
           medium: 2,
           low: 3,
        }
      });

      it('formats high issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/HIGH\: 1/);
      });

      it('formats medium issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/MEDIUM\: 2/);
      });

      it('formats low issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/LOW\: 3/);
      });

    })

    context('without issues', function() {

      before(function() {
        testData = {
           high: 0,
           medium: 0,
           low: 0,
        }
      });

      it('counts high issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/HIGH\: 0/);
      });

      it('counts medium issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/MEDIUM\: 0/);
      });

      it('counts low issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/LOW\: 0/);
      });

    })

  });

});
