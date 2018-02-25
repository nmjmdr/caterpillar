const lib = require('../lib/crawler');
const serialFetch = require('../lib/serial-fetch');
const events = require('../lib/event-names');
const EventEmitter = require('events');
const url = require('url');

class LinkCountEmitter extends EventEmitter {};

const SuccessEvent = "SuccessEvent";
const FailedEvent = "FailedEvent";

function getDomain(url) {
  return url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
}

function areTheSameDomainName(link1, link2) {
  if(!link1 || !link2) {
    return false;
  }
  const link1Domain = getDomain(link1);
  const link2Domain = getDomain(link2);
  return link1Domain.toLowerCase() === link2Domain.toLowerCase()
}

function create(handlers) {
  const emitter = new LinkCountEmitter();
  Object.keys(handlers).forEach((evt)=>{
    emitter.on(evt,handlers[evt]);
  });

  return (keywords, urlToLookFor) => {
    let internalHandlers = {};
    let ledger = [];

    internalHandlers[events.ResultsFetched] = (result) => {
      const matchedLinks = result.links.reduce((acc,link)=>{
        if(areTheSameDomainName(link, urlToLookFor)) {
          acc.push({
            link: link,
            pageNumber: result.pageNumber
          })
        }
        return acc;
      },[]);
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
