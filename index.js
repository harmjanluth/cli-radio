#! /usr/bin/env node
const shell     = require('shelljs');
shell.env['NODE_NO_WARNINGS'] = 1;

const lame      = require('lame');
const Speaker   = require('audio-speaker/stream');
const request   = require('request');

const utils     = require('./utils');
const channels  = require('./channel_list');

const decoder   = new lame.Decoder();
const params    = utils.getCLIParams();

if(params['list']) {
  shell.echo(`
  .: CLI Radio :.

  eg: radio -channel=radio1`);

  printRadioList();
  shell.exit(1);
}

// Help
if(params['help']) {
  shell.echo(`
  .: CLI Radio :.

  -channel or -c      radio channel name or list id    - 'radio538' or '2'
  -remote or -r       url for remote stream (MP3)      - 'http://www.domain.com/my-stream.mp3'

  list                list of available channels (nl)
  `);

  shell.exit(1);
}

// Remote source
if(params['-remote'] || params['-r']) {
  const custom = params['-remote'] || params['-r'];

  shell.echo(`
  .: CLI Radio :.  '${custom}'  (Ctrl+C to quit)`);

  const mp3 = request(custom);

  mp3.pipe(decoder).on('format', function(format) {
        const speaker = new Speaker(format);
        this.pipe(speaker);
    });

  shell.exec('echo "\033]0;.: CLI Radio :.\007"');
}
// Missing channel name
else if(!params['-channel'] && !params['-c']) {
  shell.echo(`
  .: CLI Radio :.
  `);

  shell.echo(`
  Specify a channel:
      
  eg: radio -channel=radio1
  `);  

  printRadioList();
  shell.exit(1);
}
else {
  let radio = params['-channel'] || params['-c'];

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

  eg: radio -channel=radio1`);  

    printRadioList();

    shell.exit(1);
  }

}

function printRadioList() {
  let list = '';
  let count = 1;

  Object.entries(channels).forEach(
    ([key, value]) => { list += `${count})   ${value.label} => '${key}' or '${count}' \n  `; count++;}
  );

  shell.echo(`
  ${list}
  `); 
}

