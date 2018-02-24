/*
  The main idea of this fetcher is:
  * Fetch serially, avoid fetching parallely as it might trigger Google's bots into blocking our ip
*/

const pageFetcher = require('./page-fetcher');
const serializer = require('./serialized-promises');
const events = require('./event-names');

function fetch(searchParams, eventEmitter) {
  const fetchPage = pageFetcher.create(searchParams.keywords, searchParams.resultsPerPage);
  let requiredPages = Math.ceil((searchParams.nResults/searchParams.resultsPerPage));
  let pageNumber = 1;

  serializer.serialize((requiredPages+1),(pageNumber)=>{
    return fetchPage(pageNumber);
  },(page)=>{
    // done fetching a page
    eventEmitter.emit(events.PageResulted, page);
    // fetch the next page
    pageNumber = pageNumber + 1;
  })
  .then((done)=>{
    // all pages done
    eventEmitter.emit(events.AllPagesFetched);
  })
  .catch((error)=>{
    // could not fetch all pages
    eventEmitter.emit(events.PageFetchErrored, error);
  });
}

module.exports = {
  fetch: fetch
}
