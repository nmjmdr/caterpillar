const lib = require('../lib/crawler');
const serialFetch = require('../lib/serial-fetch');
const events = require('../lib/event-names');
const EventEmitter = require('events');

class LinkCountEmitter extends EventEmitter {};

const SuccessEvent = "SuccessEvent";
const FailedEvent = "FailedEvent";

function create(handlers) {
  const emitter = new LinkCountEmitter();
  Object.keys(handlers).forEach((evt)=>{
    emitter.on(evt,handlers[evt]);
  });

  return (keywords, urlToLookFor) => {
    let internalHandlers = {};
    let ledger = [];

    internalHandlers[events.PageFetched] = (result) => {
      const matchedLinks = result.links.filter((link)=>{
        return (link.indexOf(urlToLookFor) !== -1)
      });
      ledger.push(...matchedLinks);
    }
    internalHandlers[events.SearchDone] = (result) => {
      emitter.emit(SuccessEvent, ledger)
      return;
    }

    internalHandlers[events.SearchFailed] = (error) => {
      emitter.emit(FailedEvent, error)
      return;
    }

    lib.getCrawler(serialFetch.fetch,internalHandlers)(100, 10, keywords);
  }
}

module.exports = {
  create: create,
  SuccessEvent: SuccessEvent,
  FailedEvent: FailedEvent
}
