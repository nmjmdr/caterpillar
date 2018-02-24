const lib = require('./lib/crawler');
const serialFetch = require('./lib/serial-fetch');
const events = require('./lib/event-names');




function setup(keywords, urlToLookFor) {
  let hanlders = {};
  let ledger = [];
  handlers[events.PageFetched] = (result) => {
    const matchedLinks = result.links.filter((link)=>{
      return (link.indexOf(urlToLookFor) !== -1)
    }
    ledger.push(matchedLinks);
  }

  hanlders[events.SearchDone] = (result) => {
    console.log("Count: ",linksCount);
  }
}

let linksCount = 0;

let hanlders = {};
hanlders[events.PageFetched] = (result) => {
  if(result.hasSearchResults) {
    console.log(result.links)
    result.links.forEach((link)=>{
      if(link.indexOf('creditorwatch.com.au') !== -1) {
        linksCount++;
      }
    })
  }
}

hanlders[events.SearchDone] = (result) => {
  console.log("Count: ",linksCount);
}

lib.getCrawler(serialFetch.fetch,hanlders)(100, 10, "creditorwatch");
