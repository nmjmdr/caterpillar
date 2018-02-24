function serialize(n, fn, handleResult) {
  let current = 0;
  const serial = (current) => {
    if(current < n){
      return fn()
      .then((r)=>{
        const toContinue = handleResult(r);
        return toContinue? serial((current+1)) : false
      });
    }
    return true;
  }
  return serial(0);
}

module.exports = {
  serialize: serialize
}
