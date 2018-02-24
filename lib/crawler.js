const EventEmitter = require('events');
const events = require('./event-names')

class ResultsEmitter extends EventEmitter {};

function subscribeToEvents(eventEmitter, handlers) {
  Object.keys(handlers).forEach((eventName)=>{
    eventEmitter.on(eventName,handlers[eventName]);
  })
}

function getCrawler(fetch, eventHandlers) {
  return (nResults, resultsPerPage, keywords) => {
    const resultsEmitter = new ResultsEmitter();

    subscribeToEvents(resultsEmitter, eventHandlers);

    const searchParams = {
      nResults,
      resultsPerPage,
      keywords
    }
    fetch(searchParams, resultsEmitter);
  }
}


module.exports = {
  getCrawler: getCrawler
}
