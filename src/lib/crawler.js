const EventEmitter = require('events');
const eventNames = require('./event-names');

class Emitter extends EventEmitter {};

function subscribe(handlersMap, emitter) {
  Object.keys(handlersMap).forEach((evt)=>{
    emitter.on(evt, handlersMap[evt]);
  });
}

function getCrawler(fetch, handlersMap) {
  const emitter = new Emitter();
  subscribe(handlersMap, emitter);
  return (nResults, resultsPerPage, keywords) => {
    // google does not allow more than 100 results per page
    resultsPerPage = resultsPerPage > 100? 100 : resultsPerPage;
     const searchParams = {
       nResults,
       resultsPerPage,
       keywords
     }
     fetch(searchParams, emitter);
  };
}

module.exports = {
  getCrawler: getCrawler
}
