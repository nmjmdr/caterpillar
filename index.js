const pagef = require('./lib/page-fetch');

pagef.create("Sydney Westmead",10)(0)
.then((r)=>{
  console.log(r)
})
