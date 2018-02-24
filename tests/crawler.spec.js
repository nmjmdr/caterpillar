const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const lib = require('../lib/crawler');
const events = require('../lib/event-names');

describe('Given Crawler',()=>{
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();
  });
  afterEach(()=>{
    sandbox.restore();
  });

  describe('When the crawler is setup',()=>{

    const fetch = sinon.stub();
    const onPageResulted = sinon.stub();
    const onAllPagesFetched = sinon.stub();
    const onPageFetchErroed = sinon.stub();

    let handlers = {};
    handlers[events.PageResulted] = onPageResulted;
    handlers[events.PageFetchErrored] = onPageFetchErroed,
    handlers[events.AllPagesFetched] = onAllPagesFetched

    const crawler = lib.getCrawler(fetch, handlers);

    const nResults = 100;
    const keywords = 'some keywords';
    const resultsPerPage = 10;

    beforeEach(()=>{
      crawler(nResults, resultsPerPage, keywords);
    })

    it('Should invoke fetcher with appropriate params',(done)=>{
      expect(fetch.called).to.be.true;

      const fetchArgs = fetch.getCalls(0)[0].args;
      expect(fetchArgs[0]).to.be.deep.equal({
        nResults,
        resultsPerPage,
        keywords
      });

      const resultsEmitter = fetchArgs[1];
      expect(resultsEmitter).to.exist;

      done();
    });

    it('Should invoke onPageResulted, whenever fetch gets a page',(done)=>{
      const fetchArgs = fetch.getCalls(0)[0].args;
      const resultsEmitter = fetchArgs[1];
      expect(resultsEmitter).to.exist;

      const page =  { 'payload': 'payload' };

      resultsEmitter.emit(events.PageResulted, page);

      expect(onPageResulted.called).to.be.true;
      expect(onPageResulted.getCalls(0)[0].args[0]).to.deep.equal(page);
      done();
    });

    it('Should invoke onPageFetchErroed, whenever fetch results in an error',(done)=>{
      const fetchArgs = fetch.getCalls(0)[0].args;
      const resultsEmitter = fetchArgs[1];
      expect(resultsEmitter).to.exist;
      const error = 'error';
      resultsEmitter.emit(events.PageFetchErrored, error);

      expect(onPageFetchErroed.called).to.be.true;
      expect(onPageFetchErroed.getCalls(0)[0].args[0]).to.deep.equal(error);
      done();
    });

    it('Should invoke onAllPagesFetched, whenever all pages are fetched',(done)=>{
      const fetchArgs = fetch.getCalls(0)[0].args;
      const resultsEmitter = fetchArgs[1];
      expect(resultsEmitter).to.exist;

      resultsEmitter.emit(events.AllPagesFetched);

      expect(onAllPagesFetched.called).to.be.true;
      done();
    });
  });
});
