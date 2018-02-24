function serialize(fn, handleResult) {
  let current = 0;
  const serial = () => {
    return fn()
    .then((r)=>{
      const toContinue = handleResult(r);
      return toContinue? serial() : true
    });
  }
  return serial(0);
}

module.exports = {
  serialize: serialize
}
