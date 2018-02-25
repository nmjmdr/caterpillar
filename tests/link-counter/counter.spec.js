const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const linkCounter = require('../../src/link-counter/counter');
const eventNames = require('../../src/lib/event-names');
const check = require('../expect-checks').check;
const EventEmitter = require('events');



describe('Given link counter',()=>{
  let sandbox = sinon.sandbox.create();
  afterEach(()=>{
    sandbox.restore();
  });

  class TestEmitter extends EventEmitter {};


  describe('When counter is supplied with pages containing matching links',()=>{
    it('Should return the ledger of matched links',(done)=>{
      const counter = linkCounter.create();
      const domainToLookFor = "some-url.com.au";
      const sourceEmitter = new TestEmitter();
      const results = [
        {
          links: [('https://'+domainToLookFor), 'https://not-domain-looking-for.com'],
          pageNumber: 1
        },
        {
          links: [('https://'+domainToLookFor), 'https://not-domain-looking-for.com'],
          pageNumber: 2
        }
      ];

      counter.eventEmitter.on(linkCounter.SuccessEvent, (payload)=>{
        expect(payload.length).to.be.equal(2);
        expect(payload[0].link).to.be.equal(results[0].links[0]);
        expect(payload[0].pageNumber).to.be.equal(results[0].pageNumber);
        expect(payload[1].link).to.be.equal(results[1].links[0]);
        expect(payload[1].pageNumber).to.be.equal(results[1].pageNumber);
        done();
      });

      counter.count(domainToLookFor, sourceEmitter);


      sourceEmitter.emit(eventNames.ResultsFetched,results);
      sourceEmitter.emit(eventNames.SearchDone, { isPartial: false});

    })
  });

  describe('When the search fails with a SearchFailed',()=>{
    it('Should generate FailedEvent',(done)=>{
      const counter = linkCounter.create();
      const domainToLookFor = "some-url.com.au";
      const sourceEmitter = new TestEmitter();
      const expectedErr = "error";

      counter.eventEmitter.on(linkCounter.FailedEvent, (err)=>{
        expect(err).to.deep.equal(expectedErr)
        done();
      });

      counter.count(domainToLookFor, sourceEmitter);

      sourceEmitter.emit(eventNames.SearchFailed, expectedErr);

    })
  });
});
