var expect = require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai'))
  .expect;
var sinon = require('sinon');
var Report = require('../../lib/report');
var snyk = require('snyk');

context('Report', function() {
  describe('_parseSnykResults', function() {

  });

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

  describe('_newReportItem', function() {
    it('returns a new report item', function() {
      expect(Report._newReportItem()).to.deep.equal({
        high: [],
        medium: [],
        low: []
      });
    });
  });

  describe('_formatOutput', function() {
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

  describe('_reportSummary', function() {
    it('outputs a summary for report levels with greater than 0 entries', function() {
      var testData = {
        report1: {
          low: [1,2,3],
          medium: [4,5,6],
          high: [7,8,9]
        },
        report2: {
          low: [1],
          medium: [2,3],
          high: [4,5,6]
        }
      };

      expect(Report._reportSummary(testData)).to.equal('\x1b[1mSummary\x1b[22m\n' + Report._colourCodes.low + 'Low: 4\n' + Report._colourCodes.medium + 'Medium: 5\n' + Report._colourCodes.high + 'High: 6\n');
    });

    it('ignores report levels with 0 entries', function() {
      var testData = {
        report1: {
          low: [1,2,3],
          medium: [],
          high: [7,8,9]
        },
        report2: {
          low: [1],
          medium: [],
          high: [4,5,6]
        }
      };

      expect(Report._reportSummary(testData)).to.equal('\x1b[1mSummary\x1b[22m\n' + Report._colourCodes.low + 'Low: 4\n' + Report._colourCodes.high + 'High: 6\n');
    });

    it('provides no output if 0 entries exist', function() {
      var testData = {
        report1: {
          low: [],
          medium: [],
          high: []
        }
      };

      expect(Report._reportSummary(testData)).to.equal('');
    });

  });

  describe('_reportLevels', function() {
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

  describe('_formatItems', function() {
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
