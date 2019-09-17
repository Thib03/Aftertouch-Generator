var black = 0;
var white = 255;

var dimension;
var weight = 0.005;
var bigRadius = 0.35;
var littleRadius = 0.0905;

var velocity = [];
for(let n = 0; n < 7; n++) {
  velocity.push(0);
}

var number = [];
for(let n = 0; n < 75; n++) {
  number.push(0);
}

var notesOn = [];
for(let n = 0; n < 7; n++) {
  notesOn.push([]);
}

var notes = [];
var millisecond = 0;
var notePressed = -1;

var midiHandler;
var midi = 0;
var midiRadius = 0.35*littleRadius;

var midiOutput = false;

var hasSequencer = false;
var sequencerOutput;

var launchpad;

var noteOnStatus     = 144;
var noteOffStatus    = 128;
var aftertouchStatus = 160;

var synth;

let t1 = 0.001;
let l1 = 1; // velocity
let t2 = 0.1;
let l2 = 0.5; // aftertouch
let t3 = 0.3;
let l3 = 0;

var fonDeg = 0;
//var fonNum = 130;
var nextNote = false;

var dragX, dragY, dragDist;
var dragLimit = 0.1;

var midiScale = [[]];

var maxFreq = 10000;

var time = 0;

class MidiHandler {
  constructor() {
    this.button = new Clickable();
    this.button.color = white;
    this.button.cornerRadius = 1000;
    this.button.stroke = black;
    this.button.text = '';
    this.button.onPress = function() {
      enableMidi();
    }
    this.update();
  }

  update() {
    let r = midiRadius*dimension;
    this.button.resize(2*r,2*r);
    this.button.locate(width/2 -r,
                       height/2-r);
    this.button.strokeWeight = weight*dimension;
  }

  draw() {
    this.button.draw();

    noStroke();
    fill(this.button.color==white?black:white);
    let r  = 0.14*midiRadius*dimension;
    let br = 0.6*midiRadius*dimension;
    for(let n = 0; n < 5; n++) {
      let a = n*PI/4;
      circle(width/2+br*cos(a),height/2-br*sin(a),2*r,2*r);
    }
    let l = 0.7*midiRadius*dimension;
    let h = 0.35*midiRadius*dimension;
    rect(width/2-l/2,height/2+1.1*br,l,h,h);
  }
}

function preload() {
  font = loadFont('nunito.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  dimension = Math.min(width,height);

  midiHandler = new MidiHandler();

  userStartAudio().then(function() {
     console.log('Audio ready');
  });
}

function draw() {
  background(white);

  if(!midi) {
    midiHandler.draw();
  }
  else {
    if(millis() - millisecond > 1) {
      var a = (Math.sin(2*PI*time/20)+1)/2;
      midiOutput.sendKeyAftertouch(36,'all',a);
      midiOutput.sendKeyAftertouch(52,'all',a);
      midiOutput.sendKeyAftertouch(57,'all',a);
      midiOutput.sendKeyAftertouch(62,'all',a);
      time++;
      time %= 20;
      millisecond = millis();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  dimension = Math.min(width,height);

  midiHandler.update();
}

//------------------------------------------------------------------------------
//                             MIDI
//------------------------------------------------------------------------------

function enableMidi() {
  WebMidi.enable(function (err) {
    if (err) console.log("An error occurred", err);

    var liste = '';
    var taille = WebMidi.outputs.length;
    var i, num;
    var numStr = '0';

    if(taille == 0) {
      window.alert("No MIDI output device detected.");
      return;
    }

    num = 1;
    for(let i = 0; i < taille; i++) {
      var name = WebMidi.outputs[i].name;
      if(name.includes('Launchpad Light')) {
        midiOutput = WebMidi.outputs[i];
        midiOutput.send(noteOnStatus,[36,100]);
        midiOutput.send(noteOnStatus,[52,100]);
        midiOutput.send(noteOnStatus,[57,100]);
        midiOutput.send(noteOnStatus,[62,100]);
        midi = 1;
        millisecond = millis();
      }
    }

    if(!midiOutput) {
      disableMidi();
    }

  },true);
}

function disableMidi() {
  midi = 0;

  WebMidi.disable();

  //midiButton.color  = white;
  //midiButton.stroke = black;
}
