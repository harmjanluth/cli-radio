function getCLIParams() {
  const params  =  [];
  process.argv.filter((arg)=>{
    if(arg.indexOf('=') > -1) {
      let parts = arg.split('=');
      params[parts[0]] = parts[1];
    }
    if(arg === 'list') {
      params['list'] = 1;
    }
  });
  return params;
}

module.exports = { getCLIParams };