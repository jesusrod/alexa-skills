var http       = require('http')
  , AlexaSkill = require('./AlexaSkill')
  , APP_ID     = 'your-app-id'
  , MTA_KEY    = 'your-mta-key';

  var url = function(stopId){
  return 'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=' + stopId;
};

var getJsonFromDublinBus = function(stopId, callback){
  http.get(url(stopId), function(res){
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
    if(data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit){
      var text = data
                  .Siri
                  .ServiceDelivery
                  .StopMonitoringDelivery[0]
                  .MonitoredStopVisit[0]
                  .MonitoredVehicleJourney
                  .MonitoredCall
                  .Extensions
                  .Distances
                  .PresentableDistance;
      var cardText = 'The next bus is: ' + text;
    } else {
      var text = 'That bus stop does not exist.'
      var cardText = text;
    }

    var heading = 'Next bus for stop: ' + intent.slots.bus.value;
    response.tellWithCard(text, heading, cardText);
  });
};
