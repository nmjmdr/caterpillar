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

function addMatchingLinksToLedger(ledger, result, urlToLookFor) {
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

function create(handlers) {
  const emitter = new LinkCountEmitter();
  Object.keys(handlers).forEach((evt)=>{
    emitter.on(evt,handlers[evt]);
  });

  return (keywords, urlToLookFor) => {
    let ledger = [];

    const crawler = lib.getCrawler(serialFetch.fetch)

    crawler.eventEmitter.on(events.ResultsFetched, (results) => {
      results.forEach((result)=>{
        addMatchingLinksToLedger(ledger, result, urlToLookFor);
      });
    });

    crawler.eventEmitter.on(events.SearchDone, (result) => {
      emitter.emit(SuccessEvent, ledger)
      return;
    });

    crawler.eventEmitter.on(events.SearchFailed, (error) => {
      emitter.emit(FailedEvent, error)
      return;
    });
    crawler.crawl(100, 10, keywords);
  }
}

module.exports = {
  create: create,
  SuccessEvent: SuccessEvent,
  FailedEvent: FailedEvent
}
