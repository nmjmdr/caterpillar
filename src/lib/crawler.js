const EventEmitter = require('events');
const eventNames = require('./event-names');

class Emitter extends EventEmitter {};

function getCrawler(fetch) {
  const emitter = new Emitter();
  return {
    eventEmitter: emitter,
    crawl: (nResults, resultsPerPage, keywords) => {
              resultsPerPage = resultsPerPage > 100? 100 : resultsPerPage;
              const searchParams = {
                nResults,
                resultsPerPage,
                keywords
              }
              fetch(searchParams, emitter);
            }
  };
}

module.exports = {
  getCrawler: getCrawler
}
