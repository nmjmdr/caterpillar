const counter = require('./link-counter/counter');
const lib = require('./lib/crawler');
const serialFetch = require('./lib/serial-fetch');
const parallelFetch = require('./lib/parallel-fetch');
const config = require('../config');
const argValidator = require('./utils/arg-validator');

const SerialFetchFunction = "serial";
const ParallelFetchFunction = "parallel";

const fetchFunctionType = config['fetch-function-type'];
const fetchFunction = (fetchFunctionType == SerialFetchFunction)? serialFetch.fetch : parallelFetch.fetch;

function subscribeToCounterEvents(eventEmitter) {
  eventEmitter.on(counter.SuccessEvent, (ledger) => {
    console.log("");
    console.log("Number of matched results: ", ledger.length)
    console.log("-------------------------");
    ledger.forEach((entry)=>{
      console.log(entry.link+ ", Page no. "+(entry.pageNumber+1));
    });
    console.log("-------------------------");
  });

  eventEmitter.on(counter.FailedEvent, (error) => {
    console.log("Failed to search: ", error);
  });
}


const validatedArgs = argValidator.validate(process.argv);
if(!validatedArgs.ok) {
  console.log("Usage: node index.js keywords=\"some keywords\" url=\"url-to-look-for\" ");
  process.exit(1);
}

const parsedArgs = validatedArgs.parsedArgs;

console.log("Using Fetch function type: ", fetchFunctionType);

const crawler = lib.getCrawler(fetchFunction);
const linkCounter = counter.create();
subscribeToCounterEvents(linkCounter.eventEmitter);
linkCounter.count(parsedArgs.url, crawler.eventEmitter);
crawler.crawl(100,10,parsedArgs.keywords);

console.log("Processing...")
