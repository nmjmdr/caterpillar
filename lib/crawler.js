const EventEmitter = require('events');
const events = require('./event-names')

class ResultsEmitter extends EventEmitter {};

function getCrawler(fetch, handler) {
  const resultsEmitter = new ResultsEmitter();
  resultsEmitter.on(events.PageFetched, handler)
  return (nResults, resultsPerPage, keywords) => {
     const searchParams = {
       nResults,
       resultsPerPage,
       keywords
     }
     fetch(searchParams, resultsEmitter);
  };
}

module.exports = {
  getCrawler: getCrawler
}
