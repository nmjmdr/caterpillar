const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const EventEmitter = require('events');
const serialFetcher = require('../lib/serial-fetcher');
const events = require('../lib/event-names');
const pageFetcher = require('../lib/page-fetcher');

describe('Given the serial fetcher',()=>{
  beforeEach(()=>{
    sandbox = sinon.sandbox.create();
  });
  afterEach(()=>{
    sandbox.restore();
  });

  describe('When fetch is invoked',()=>{

    const pageFetch = sinon.stub();
    const pageFetchCreate = sinon.stub(pageFetcher, 'create').returns(pageFetch);
    class ResultsEmitter extends EventEmitter {};

  });
});
