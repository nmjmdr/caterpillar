const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const lib = require('../../src/lib/crawler');
const eventNames = require('../../src/lib/event-names');
const check = require('../expect-checks').check;

describe('Given Crawler',()=>{
  let sandbox = sinon.sandbox.create();
  afterEach(()=>{
    sandbox.restore();
  });

  describe('When crawler is setup',()=>{
    const fetch = sandbox.stub();
    const onResultsFetched = sandbox.stub();
    const onSearchDone = sandbox.stub();
    const onSearchFailed = sandbox.stub();
    const handlers = {};

    const crawler = lib.getCrawler(fetch);

    crawler.eventEmitter.on(eventNames.ResultsFetched, onResultsFetched);
    crawler.eventEmitter.on(eventNames.SearchDone, onSearchDone);
    crawler.eventEmitter.on(eventNames.SearchFailed, onSearchFailed);

    const crawl = crawler.crawl;

    const nResults = 100;
    const resultsPerPage = 10;
    const keywords = "some keywords";

    it('Should invoke the fetch to get all the pages',(done)=>{
      crawl(nResults, resultsPerPage, keywords);
      check(done, ()=>{
        expect(fetch.called).to.be.true;
        expect(fetch.getCalls(0)[0].args[0]).to.deep.equal({
          nResults,
          resultsPerPage,
          keywords
        });
      });
    });

    it('Should subscribe the onResultsFetched to ResultsFetched event',(done)=>{
      crawl(nResults, resultsPerPage, keywords);
      check(done, ()=>{
        expect(fetch.called).to.be.true;
        const emitter = fetch.getCalls(0)[0].args[1];
        expect(emitter).to.exist;
        emitter.emit(eventNames.ResultsFetched);
        expect(onResultsFetched.called).to.be.true;
      });
    });

    it('Should subscribe the onSearchDone to SearchDone event',(done)=>{
      crawl(nResults, resultsPerPage, keywords);
      check(done, ()=>{
        expect(fetch.called).to.be.true;
        const emitter = fetch.getCalls(0)[0].args[1];
        expect(emitter).to.exist;
        emitter.emit(eventNames.SearchDone);
        expect(onSearchDone.called).to.be.true;
      });
    });

    it('Should subscribe the onSearchFailed to SearchFailed event',(done)=>{
      crawl(nResults, resultsPerPage, keywords);
      check(done, ()=>{
        expect(fetch.called).to.be.true;
        const emitter = fetch.getCalls(0)[0].args[1];
        expect(emitter).to.exist;
        emitter.emit(eventNames.SearchFailed);
        expect(onSearchFailed.called).to.be.true;
      });
    });
  });
});
