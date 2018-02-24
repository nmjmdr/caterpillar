/*
  The main idea of this fetcher is:
  * Fetch serially, avoid fetching parallely as it might trigger Google's bots into blocking our ip
*/

const pageFetcher = require('./page-fetcher');
const serializer = require('./serialized-promises');
const eventNames = require('./event-names');


function fetch(searchParams, eventEmitter) {
  const fetchPage = pageFetcher.create(searchParams.keywords, searchParams.resultsPerPage);
  let requiredPages = Math.ceil((searchParams.nResults/searchParams.resultsPerPage));
  let pageNumber = 1;

  serializer.serialize(requiredPages,(pageNumber)=>{
    return fetchPage(pageNumber);
  },(page)=>{
    if(page.hasSearchResults) {
      eventEmitter.emit(eventNames.PageFetched, page);
      pageNumber = pageNumber + 1;
      return true; // continue to fetch next page
    }
  })
  .then((done)=>{
    eventEmitter.emit(eventNames.SearchDone, { isPartial: !done });
  })
  .catch((err)=>{
    eventEmitter.emit(eventNames.SearchFailed, { error: err });
  })
}

module.exports = {
  fetch: fetch
}
