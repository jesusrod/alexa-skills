//require('dotenv').load();
//
// Skill created by Jesus Rodriguez as an unofficial Bus scheduler for buses in Dublin.
//
// This skill is an unofficial Bus Scheduler for buses in Dublin and in no way this skill is sponsored nor endorsed by Transport for Ireland
// nor by Bus Átha Cliath-Dublin Bus.
//
// This skill is meant to assist users on querying for their buses while Dublin Bus releases an official skill for this.
//
// In no way I will try to get credits nor finantial gain for this skill and the code is free to use on other versions
//
// This Skill was not created or endorsed by Amazon in any way.


var https       = require('https')
  , AlexaSkill = require('./AlexaSkill')
  , APP_ID     = process.env.APP_ID
  
 

var url = function(stopId){
  return 'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=' + stopId;
};

var getJsonFromDublinBus = function(stopId, callback){
  https.get(url(stopId), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};


var handleNextBusRequest = function(intent, session, response){
   
     
  getJsonFromDublinBus(intent.slots.bus.value, function(data){
      //var route= intent.slots[1].route.value;
      
            var stopslot = intent.slots.bus.value;
            var error = data.errorcode
            var routeslot = null //intent.slots.route.value;
            
    if(data && error !== "1"){ //Checks if there are buses for that route as well
        // var text = null;
         //var route = 15;
    
          if (routeslot==null){
                //var stop = data.stopid
                var time = data.results[0].duetime
                var routenumber = data.results[0].route
                var text = 'The next bus for route ' + routenumber + ' will be in ' + time + ' minutes'; //data.numberofresults;
        }else{
      
      for (var i=0, len=data.results.length; i < len; i++) { // runs through the XML file 
          
      var time = data.results[i].duetime;
      var routenumber = data.results[i].route;
    
         if (routenumber==routeslot && text==null){ // finds the first result from the route given
            var text = 'The next bus for route ' + routenumber + ' will be in  ' + time + ' minutes';
                                                }
     
      }
              
             }
             } 
          
          else {
             var text = 'There are no buses for that stop at this moment.'
             var cardText = text;
      
                 }

    var heading = 'Next bus for stop: ' + intent.slots.bus.value;
    response.tellWithCard(text, heading, cardText);
  });

};

var BusSchedule = function(){
  AlexaSkill.call(this, APP_ID);
};

BusSchedule.prototype = Object.create(AlexaSkill.prototype);
BusSchedule.prototype.constructor = BusSchedule;

BusSchedule.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
  // What happens when the session starts? Optional
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
      + ", sessionId: " + session.sessionId);
};

BusSchedule.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
  // This is when they launch the skill but don't specify what they want. Prompt
  // them for their bus stop
  var output = 'Welcome to Next Bus!. ' +
    'Say the number of a bus stop to get how far the next bus is away.';

  var reprompt = 'You can tell me a bus stop number and I will tell you the next bus to arrive';
  response.ask(output, reprompt);

  console.log("onLaunch requestId: " + launchRequest.requestId
      + ", sessionId: " + session.sessionId);

};

BusSchedule.prototype.intentHandlers = {
  
   GetNextBusIntent: function(intent, session, response){
        
    handleNextBusRequest(intent, session, response);
  
  },
  
  HelpIntent: function(intent, session, response){
    var speechOutput = 'Get the time to arrival for any bus by a particular bus stop. ' +
      'You can tell me a bus stop number and I will tell you the next bus to arrive';
    response.ask(speechOutput);
  },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Ok, Goodbye!";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Ok, Goodbye!";
        response.tell(speechOutput);
    },
};

exports.handler = function(event, context) {
    var skill = new BusSchedule();
    skill.execute(event, context);
};
