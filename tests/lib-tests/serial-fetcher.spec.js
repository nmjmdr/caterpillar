const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const EventEmitter = require('events');
const serialFetch = require('../../src/lib/serial-fetch');
const eventNames = require('../../src/lib/event-names');
const pageFetcher = require('../../src/lib/page-fetch');
const check = require('../expect-checks').check;

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
      let resultsCount = 0;
      const fetchPage = (pageNumber) => {
        const p = Promise.resolve({
          hasSearchResults: true,
          hasNext: (resultsCount < nResults),
          links: Array.from(Array(resultsPerPage+1).keys()).slice(1)
        });
        resultsCount = resultsCount + resultsPerPage;
        return p;
      }
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      let resultsFetched = 0;
      emitter.on(eventNames.ResultsFetched,(payload)=>{
        resultsFetched += payload[0].links.length ;
      });

      emitter.on(eventNames.SearchDone,()=>{
        check(done, ()=>{
          expect(resultsFetched).to.be.equal(nResults);
        });
      });

      serialFetch.fetch({
        nResults,
        resultsPerPage,
        keywords
      }, emitter);
    });
  });

  describe('When search pages are present to fetch',()=>{
    describe('When it is returning less that expected number of results per page',()=>{
      it('Should still fetch all pages',(done)=>{
        const emitter = new TestEmitter();
        let resultsCount = 0;
        const links = Array.from(Array(resultsPerPage+1).keys()).slice(3);
        const fetchPage = (pageNumber) => {
          const p = Promise.resolve({
            hasSearchResults: true,
            hasNext: (resultsCount < nResults),
            links: links
          });
          resultsCount = resultsCount + links.length;
          return p;
        }
        const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

        let resultsFetched = 0;
        emitter.on(eventNames.ResultsFetched,(payload)=>{
          resultsFetched += payload[0].links.length ;
        });

        emitter.on(eventNames.SearchDone,()=>{
          check(done, ()=>{
            expect(resultsFetched >= nResults).to.be.true;
            expect(resultsFetched < (nResults+resultsPerPage)).to.be.true;
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

  describe('When search results are partial (could fetch less than requested number of results)',(done)=>{
    it('Should indicate the result as partial',(done)=>{
      const emitter = new TestEmitter();
      let resultsCount = 0;
      const stopAt = 60;
      const fetchPage = ()=>{
        const hasNext =  resultsCount < stopAt;
        resultsCount += resultsPerPage;
        return Promise.resolve({
          hasSearchResults: true,
          hasNext: hasNext,
          links: Array.from(Array(resultsPerPage+1).keys()).slice(1)
        });
      }
      const fetchPageCreate = sandbox.stub(pageFetcher, 'create').returns(fetchPage);

      let resultsFetched = 0;
      emitter.on(eventNames.ResultsFetched,(payload)=>{
        resultsFetched += payload[0].links.length;
      });

      emitter.on(eventNames.SearchDone,(payload)=>{
        check(done, ()=>{
          expect(resultsFetched).to.be.equal((stopAt+resultsPerPage))
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
