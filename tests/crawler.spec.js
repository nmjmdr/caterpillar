const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const lib = require('../lib/crawler');
const events = require('../lib/event-names');

describe.only('Given Crawler',()=>{
  let sandbox = sinon.sandbox.create();
  afterEach(()=>{
    sandbox.restore();
  });

  describe('When crawler is setup',()=>{
    const fetch = sandbox.stub();
    const handler = sandbox.stub();
    const crawl = lib.getCrawler(fetch, handler);
    const nResults = 100;
    const resultsPerPage = 10;
    const keywords = "some keywords";

    it('Should invoke the fetch to get all the pages',(done)=>{
      crawl(nResults, resultsPerPage, keywords);
      expect(fetch.called).to.be.true;
      expect(fetch.getCalls(0)[0].args[0]).to.deep.equal({
        nResults,
        resultsPerPage,
        keywords
      })
      done();
    });

    it('Should subscribe the handler to PageFetched event',(done)=>{
      crawl(nResults, resultsPerPage, keywords);
      expect(fetch.called).to.be.true;
      const emitter = fetch.getCalls(0)[0].args[1];
      expect(emitter).to.exist;
      emitter.emit(events.PageFetched);
      expect(handler.called).to.be.true;
      done();
    });
  });
});
