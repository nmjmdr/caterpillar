const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const EventEmitter = require('events');
const serialFetch = require('../lib/serial-fetch');
const eventNames = require('../lib/event-names');
const pageFetcher = require('../lib/page-fetcher');
const check = require('./expect-checks').check;

describe('Given the serial fetcher',()=>{
  let sandbox = sinon.sandbox.create();
  afterEach(()=>{
    sandbox.restore();
  });

  const nResults = 100;
  const resultsPerPage = 10;
  const keywords = "some keywords";
  class TestEmitter extends EventEmitter {};


  describe('When search pages are present to fetch',()=>{
    it('Should fetch all pages',(done)=>{
      const emitter = new TestEmitter();
      const fetchPage = sandbox.stub().returns(Promise.resolve({
        hasSearchResults: true
      }));
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      let pageFetchedCount = 0;
      emitter.on(eventNames.PageFetched,(payload)=>{
        pageFetchedCount = pageFetchedCount + 1;
      });

      emitter.on(eventNames.SearchDone,()=>{
        check(done, ()=>{
          expect(pageFetchedCount).to.be.equal(Math.ceil(nResults/resultsPerPage));
        });
      });

      serialFetch.fetch({
        nResults,
        resultsPerPage,
        keywords
      }, emitter);
    });
  });

  describe('When search results are partial (could fetch less than requested number of results)',(done)=>{
    it('Should indicate the result as partial',(done)=>{
      const emitter = new TestEmitter();
      let pageCount = 0;
      const lastPageWithResults = 5;
      const fetchPage = ()=>{
        const hasSearchResults =  pageCount < lastPageWithResults;
        pageCount = pageCount + 1;
        return Promise.resolve({
          hasSearchResults: hasSearchResults
        });
      }
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      let pageFetchedCount = 0;
      emitter.on(eventNames.PageFetched,()=>{
        pageFetchedCount = pageFetchedCount + 1;
      });

      emitter.on(eventNames.SearchDone,(payload)=>{
        check(done, ()=>{
          expect(pageFetchedCount).to.be.equal(lastPageWithResults);
          expect(payload.isPartial).to.be.true;
        });
      });

      serialFetch.fetch({
        nResults,
        resultsPerPage,
        keywords
      }, emitter);
    });
  });

  describe('When search fails',()=>{
    it('Should generate SearchFailed event',(done)=>{
      const emitter = new TestEmitter();
      const error = "Error";
      const fetchPage = sandbox.stub().returns(Promise.reject(error));
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      emitter.on(eventNames.SearchFailed,(payload)=>{
        check(done, ()=>{
          expect(payload.error).to.be.deep.equal(error);
        });
      });

      serialFetch.fetch({
        nResults,
        resultsPerPage,
        keywords
      }, emitter);
    });
  });
});
