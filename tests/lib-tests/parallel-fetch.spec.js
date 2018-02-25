const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const EventEmitter = require('events');
const parallelFetch = require('../../src/lib/parallel-fetch');
const eventNames = require('../../src/lib/event-names');
const pageFetcher = require('../../src/lib/page-fetch');
const check = require('../expect-checks').check;

describe('Given the parallel fetcher',()=>{
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
      let resultsCount = 0;
      const fetchPage = (pageNumber) => {
        const p = Promise.resolve({
          hasSearchResults: true,
          hasNext: (resultsCount < nResults),
          links: Array.from(Array(resultsPerPage+1).keys()).slice(1),
          pageNumber: pageNumber
        });
        resultsCount = resultsCount + resultsPerPage;
        return p;
      }
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      let resultsFetched = 0;
      emitter.on(eventNames.ResultsFetched,(payload)=>{
        resultsFetched = payload.reduce((acc, page)=>{
          acc += page.links.length;
          return acc;
        },0);
      });

      emitter.on(eventNames.SearchDone,()=>{
        check(done, ()=>{
          expect(resultsFetched).to.be.equal(nResults);
        });
      });

      parallelFetch.fetch({
        nResults,
        resultsPerPage,
        keywords
      }, emitter);
    });
  });

  describe('When search results are partial (could fetch less than requested number of results)',(done)=>{
    it('Should indicate the result as partial',(done)=>{
      const emitter = new TestEmitter();
      let resultsCount = 0;
      const stopAt = 60;
      const fetchPage = (pageNumber)=>{
        const hasNext =  resultsCount < stopAt;
        resultsCount += resultsPerPage;
        return Promise.resolve({
          hasSearchResults: true,
          hasNext: hasNext,
          links: Array.from(Array(resultsPerPage+1).keys()).slice(4),
          pageNumber: pageNumber
        });
      }
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      let resultsFetched = 0;
      emitter.on(eventNames.ResultsFetched,(payload)=>{
        resultsFetched = payload.reduce((acc, page)=>{
          acc += page.links.length;
          return acc;
        },0);
      });

      emitter.on(eventNames.SearchDone,(payload)=>{
        check(done, ()=>{
          expect(resultsFetched).to.be.equal((stopAt+resultsPerPage))
          expect(payload.isPartial).to.be.true;
        });
      });

      parallelFetch.fetch({
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

      parallelFetch.fetch({
        nResults,
        resultsPerPage,
        keywords
      }, emitter);
    });
  });
});
