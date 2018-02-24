const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const EventEmitter = require('constants');
const serialFetcher = require('../lib/serial-fetcher');
const eventNames = require('../lib/event-names');
const pageFetcher = require('../lib/page-fetcher');

describe('Given the serial fetcher',()=>{
  let sandbox = sinon.sandbox.create();
  afterEach(()=>{
    sandbox.restore();
  });
});
