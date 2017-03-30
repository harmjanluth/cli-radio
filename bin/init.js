#! /usr/bin/env node
const shell     = require("shelljs");
const lame      = require('lame');
const Speaker   = require('speaker');
const request   = require('request');
const utils     = require('../utils');
const channels  = require('../channel_list');

const decoder   = new lame.Decoder();
const params    = utils.getCLIParams();

// Missing channel name
if(!params['--channel'] && !params['--c']) {
  shell.echo(`
  .: CLI Radio :.
  `);

  shell.echo(`
  Select a channel first
      
  eg: radio --channel=radio1
  `);  

  printRadioList();
  shell.exit(1);
}

else {
  let radio = params['--channel'] || params['--c'];

  // If option is numeric, use index of list
  if(!isNaN(radio)) {
    const keys = Object.keys(channels);
    radio = keys[radio - 1];
  }

  // Let's play!
  if(channels[radio] && channels[radio].url) {
    const mp3 = request(channels[radio].url);
    const label = channels[radio].label;

    shell.echo(`
  .: CLI Radio - ${label} :.    (Ctrl+C to quit)`);

    mp3.pipe(decoder).on('format', function(format) {
        const speaker = new Speaker(format);
        this.pipe(speaker);
    });

    shell.exec('echo "\033]0;.: ' + label + ' :.\007"');
  }
  // Wrong identifier
  else {
    shell.echo(`
  .: CLI Radio :.
    `);
    
    shell.echo(`  '${radio}' is not a valid option, pick an available option.

  eg: radio --channel=radio1`);  

    printRadioList();

    shell.exit(1);
  }

}

function printRadioList() {
  //shell.exec('printf "  |   Radio   |   Option   |\n" ');
  let list = '';
  let count = 1;

  Object.entries(channels).forEach(
    ([key, value]) => { list += `${count})   ${value.label} => '${key}' or '${count}' \n  `; count++;}
  );

  shell.echo(`
  ${list}
  `); 
}

