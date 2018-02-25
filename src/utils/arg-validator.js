function parseArgs(args) {
  return args.reduce((acc, arg)=>{
    const parts = arg.split('=');
    if(parts && parts.length == 2 && (parts[0] === 'keywords' || parts[0] === 'url')) {
      acc[parts[0]] = parts[1];
    }
    return acc;
  },{ keywords: null, url: null });
}


function validate(args) {
  if(args.length < 4) {
    return {
      ok: false
    }
  }
  const parsedArgs = parseArgs([args[2], args[3]]);
  if(!parsedArgs.keywords || !parsedArgs.url) {
    return {
      ok: false
    }
  }
  return {
    ok: true,
    parsedArgs: parsedArgs
  }
}

module.exports = {
  validate: validate
}
