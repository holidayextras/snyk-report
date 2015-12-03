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

      it('counts high issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/HIGH\: 1/);
      });

      it('counts medium issues correctly', function() {
        expect(Report._formatSummary(testData)).to.match(/MEDIUM\: 2/);
      });

      it('counts low issues correctly', function() {
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

  describe.skip('_formatOutput', function() {
    var testData = {
      module1: {
        low: [1],
        medium: [2],
        high: [3]
      },
      module2: {
        low: [4],
        medium: [5],
        high: [6]
      }
    };

    beforeEach(function() {
      sinon.stub(Report, '_reportLevels').returns('_reportLevels');
      sinon.stub(Report, '_reportSummary').returns('_reportSummary');
    });

    afterEach(function() {
      Report._reportLevels.restore();
      Report._reportSummary.restore();
    });

    it('returns the expected data', function() {
      expect(Report._formatOutput(testData)).to.equal('\x1b[1mmodule1\x1b[22m\n_reportLevels\x1b[0m\x1b[1mmodule2\x1b[22m\n_reportLevels\x1b[0m_reportSummary');
    });
  });

  describe.skip('_reportLevels', function() {
    var testData = {
      low: 'low',
      medium: 'medium',
      high: 'high'
    };

    beforeEach(function() {
      sinon.stub(Report, '_formatItems');
      Report._reportLevels(testData);
    });

    afterEach(function() {
      Report._formatItems.restore();
    });

    it('calls _formatItems with expected parameters', function() {
      expect(Report._formatItems).to.be.calledWith('low', Report._colourCodes.low);
      expect(Report._formatItems).to.be.calledWith('medium', Report._colourCodes.medium);
      expect(Report._formatItems).to.be.calledWith('high', Report._colourCodes.high);
    });
  });

  describe.skip('_formatItems', function() {
    var testData = [
      {
        title: 'title1',
        path: 'path1'
      },
      {
        title: 'title2',
        path: 'path2'
      }
    ];
    var colourCode = 'colourCode';

    beforeEach(function() {
      sinon.spy(Report, '_formatItems');
      Report._formatItems(testData, colourCode);
    });

    afterEach(function() {
      Report._formatItems.restore();
    });

    it('transforms the data correctly', function() {
      expect(Report._formatItems(testData, colourCode)).to.equal('colourCodetitle1\ncolourCodeCall `snyk test path1` for more info\n\ncolourCodetitle2\ncolourCodeCall `snyk test path2` for more info\n\n');
    });
  });
});
