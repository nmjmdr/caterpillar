function serialize(n, fn, onResult) {
  let current = 0;
  const serial = (current) => {
    if(current < n){
      return fn()
      .then((r)=>{
        onResult(r);
        return serial((current+1));
      });
    } else {
      return true;
    }
  }
  return serial(0);
}

module.exports = {
  serialize: serialize
}
