var expect = require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai'))
  .expect;
var sinon = require('sinon');
var Report = require('../../lib/report');
var snyk = require('snyk');

context('Report', function() {

  describe('_reportAge', function() {
    var clock;
    beforeEach(function() {
      clock = sinon.useFakeTimers(new Date(2015, 10, 20).getTime());
    });

    afterEach(function() {
      clock.restore();
    });

    it('returns the number of days from the current date', function() {
      expect(Report._reportAge('2015-11-19 00:00:00 0')).to.equal(1);
    });
  });

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

  describe('_createSummary()', function() {

    var summary;

    context('with issues', function() {

      beforeEach(function() {
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

      beforeEach(function() {
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

      beforeEach(function() {
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

      beforeEach(function() {
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
