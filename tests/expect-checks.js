module.exports = {
  check: (done, fn) => {
    try {
      fn();
      done();
    } catch(err) {
      done(err);
    }
  }
}
