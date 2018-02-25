const counter = require('./link-counter/counter');

function parseArgs(args) {
  return args.reduce((acc, arg)=>{
    const parts = arg.split('=');
    if(parts && parts.length == 2 && (parts[0] === 'keywords' || parts[0] === 'url')) {
      acc[parts[0]] = parts[1];
    }
    return acc;
  },{ keywords: null, url: null });
}

function printHelp() {
  console.log("Usage: node index.js keywords=\"some keywords\" url=\"url-to-look-for\" ");
  process.exit(1);
}

function validateArgs(args) {
  if(args.length < 4) {
    printHelp();
  }
  const parsedArgs = parseArgs([args[2], args[3]]);
  if(!parsedArgs.keywords || !parsedArgs.url) {
    printHelp();
  }
  return parsedArgs;
}




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
const parsedArgs = validateArgs(process.argv);
const countFunction = counter.create(handlers);
countFunction(parsedArgs.keywords, parsedArgs.url);
console.log("Processing...")
