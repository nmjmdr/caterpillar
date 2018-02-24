const EventEmitter = require('events');

class ResultsEmitter extends EventEmitter {}
const PageResultedEvent = "PageResulted"

function getCrawler(fetch, onPageResulted) {
  return (nResults, keywords) => {
    const resultsEmitter = new ResultsEmitter();
    resultsEmitter.on(PageResultedEvent,onPageResulted);

    fetch(nResults, keywords, resultsEmitter);
  }
}


module.exports = {
  getCrawler: getCrawler,
  PageResultedEvent: PageResultedEvent
}
