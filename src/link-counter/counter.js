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

function addMatchingLinksToLedger(ledger, result, urlToLookFor, ranking) {
  const matchedLinks = result.links.reduce((acc,link)=>{
    ranking++
    if(areTheSameDomainName(link, urlToLookFor)) {
      acc.push({
        link: link,
        ranking: ranking
      })
    }
    return acc;
  },[]);
  ledger.push(...matchedLinks);
}

function create() {
  const emitter = new LinkCountEmitter();
  // maintains the ranking of the link
  let ranking = 0;
  return {
    eventEmitter: emitter,
    count: (urlToLookFor, sourceEmitter) => {
      let ledger = [];

      sourceEmitter.on(events.ResultsFetched, (results) => {
        results.forEach((result)=>{
          addMatchingLinksToLedger(ledger, result, urlToLookFor, ranking);
        });
      });

      sourceEmitter.on(events.SearchDone, (result) => {
        emitter.emit(SuccessEvent, ledger);
        return;
      });

      sourceEmitter.on(events.SearchFailed, (error) => {
        emitter.emit(FailedEvent, error);
        return;
      });
    }
  }
}

module.exports = {
  create: create,
  SuccessEvent: SuccessEvent,
  FailedEvent: FailedEvent
}
