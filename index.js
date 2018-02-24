const lib = require('./lib/crawler');
const serialFetch = require('./lib/serial-fetch');
const events = require('./lib/event-names');

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
