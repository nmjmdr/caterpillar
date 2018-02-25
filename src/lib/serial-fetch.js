/*
  The main idea of this fetcher is:
  * Fetch serially, avoid fetching parallely as it might trigger Google's bots into blocking our ip
*/

const pageFetcher = require('./page-fetch');
const serializer = require('./serialized-promises');
const eventNames = require('./event-names');


function fetch(searchParams, eventEmitter) {
  const fetchPage = pageFetcher.create(searchParams.keywords, searchParams.resultsPerPage);
  let resultsCount = 0;
  let pageNumber = 0;
  serializer.serialize(()=>{
    return fetchPage(pageNumber);
  },(page)=>{
    if(page.hasSearchResults) {
      eventEmitter.emit(eventNames.ResultsFetched, [page]);
      resultsCount = resultsCount + page.links.length;
      pageNumber = pageNumber + 1;
      return (resultsCount < searchParams.nResults && page.hasNext); // continue to fetch next page
    }
  })
  .then((done)=>{
    eventEmitter.emit(eventNames.SearchDone, { isPartial: (resultsCount < searchParams.nResults) });
  })
  .catch((err)=>{
    eventEmitter.emit(eventNames.SearchFailed, { error: err });
  });
}

module.exports = {
  fetch: fetch
}
