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


const validatedArgs = argValidator.validate(process.argv);
if(!validatedArgs.ok) {
  console.log("Usage: node index.js keywords=\"some keywords\" url=\"url-to-look-for\" ");
  process.exit(1);
}

const parsedArgs = validatedArgs.parsedArgs;


let handlers = {};
handlers[counter.SuccessEvent] = (ledger) => {
  console.log("");
  console.log("Number of matched results: ", ledger.length)
  console.log("-------------------------");
  ledger.forEach((entry)=>{
    console.log(entry.link+ ", Page no. "+(entry.pageNumber+1));
  });
  console.log("-------------------------");
};

handlers[counter.FailedEvent] = (error) => {
  console.log("Failed to search: ", error);
}


console.log("Using Fetch function type: ", fetchFunctionType);

const crawler = lib.getCrawler(fetchFunction);
const countFunction = counter.create(handlers);
countFunction(parsedArgs.url, crawler.eventEmitter);
crawler.crawl(100,10,parsedArgs.keywords);

console.log("Processing...")
