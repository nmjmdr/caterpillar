const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const lib = require('../lib/crawler');

describe("Given Crawler",()=>{
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();
  });
  afterEach(()=>{
    sandbox.restore();
  });

  describe("When the crawler is setup",()=>{

    const fetch = sinon.stub();
    const onPageResulted = sinon.stub();
    const crawler = lib.getCrawler(fetch, onPageResulted);
    const nResults = 100;
    const keywords = "some keywords";

    it("Should invoke fetcher with appropriate params",(done)=>{

      crawler(nResults, keywords);

      expect(fetch.called).to.be.true;

      const fetchArgs = fetch.getCalls(0)[0].args;
      expect(fetchArgs[0]).to.be.equal(nResults);
      expect(fetchArgs[1]).to.be.equal(keywords);

      const resultsEmitter = fetchArgs[2];
      expect(resultsEmitter).to.exist;

      done();
    });

    it("Should invoke onPageResulted, whenever fetch gets a page",(done)=>{

      crawler(nResults, keywords);

      const fetchArgs = fetch.getCalls(0)[0].args;
      const resultsEmitter = fetchArgs[2];
      expect(resultsEmitter).to.exist;

      const page =  { "payload": "payload" };

      resultsEmitter.emit(lib.PageResultedEvent, page);

      expect(onPageResulted.called).to.be.true;
      expect(onPageResulted.getCalls(0)[0].args[0]).to.deep.equal(page);
      done();
    });
  });
});
