/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var api_key = 'AIzaSyA0z3o0ypUKjzjJLn1C6X2dCiIX7o6avNo';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        $( ".resultscontainer" ).hide();
        $( ".takepicture" ).click(function() {
          navigator.camera.getPicture(onSuccess, onFail, { quality: 2 ,
            destinationType: Camera.DestinationType.DATA_URL });
        });

      function onSuccess(imageData) {
          var image = document.getElementById('image');


          doCloudVision();

          function doCloudVision() {
            var b64img = imageData.replace("data:image/png;base64,", "");
            var selected_type = $('.dropdown').val();
            var json = '{' +
              ' "requests": [' +
              '	{ ' +
              '	  "image": {' +
              '	    "content":"' + b64img + '"' +
              '	  },' +
              '	  "features": [' +
              '	      {' +
              '	      	"type": "' + selected_type + '",' +
              '			"maxResults": 200' +
              '	      }' +
              '	  ]' +
              '	}' +
              ']' +
              '}';
            jQuery.ajax({
              type: 'POST',
              url: "https://vision.googleapis.com/v1/images:annotate?key=" + api_key,
              dataType: 'json',
              data: json,
              //Include headers, otherwise you get an odd 400 error.
              headers: {
                "Content-Type": "application/json",
              },
              success: function(data, textStatus, jqXHR) {
                if (data['responses'][0]) {
                  var results = "";
                  $( ".resultscontainer" ).empty();

                  if (data['responses'][0]['labelAnnotations']) {
                    for (var i = 0; i < data['responses'][0]['labelAnnotations'].length; i++){
                      var obj = data['responses'][0]['labelAnnotations'][i];
                      var description = obj['description'];
                      var score = obj['score'];
                      results += description + ": " + score + "</br>";
                    }


                  } else if (data['responses'][0]['textAnnotations']) {
                    for (var i = 0; i < data['responses'][0]['textAnnotations'].length; i++){
                      var obj = data['responses'][0]['textAnnotations'][i];
                      var description = obj['description'];
                      results += description + "</br>";
                    }
                  } else if (data['responses'][0]['faceAnnotations']) {
                    for (var i = 0; i < data['responses'][0]['faceAnnotations'].length; i++){
                      var obj = data['responses'][0]['faceAnnotations'][i];
                      var description = obj['description'];
                      var angerLikelihood = obj['angerLikelihood'];
                      var blurredLikelihood = obj['blurredLikelihood'];
                      var headwearLikelihood = obj['headwearLikelihood'];
                      var joyLikelihood = obj['joyLikelihood'];
                      var sorrowLikelihood = obj['sorrowLikelihood'];
                      var surpriseLikelihood = obj['surpriseLikelihood'];
                      var underExposedLikelihood = obj['underExposedLikelihood'];
                      results += 'angerLikelihood: ' + angerLikelihood + '</br>' +
                        'blurredLikelihood: ' + blurredLikelihood + '</br>' +
                        'headwearLikelihood: ' + headwearLikelihood + '</br>' +
                        'joyLikelihood: ' + joyLikelihood + '</br>' +
                        'sorrowLikelihood: ' + sorrowLikelihood + '</br>' +
                        'surpriseLikelihood: ' + surpriseLikelihood + '</br>' +
                        'underExposedLikelihood: ' + underExposedLikelihood + '</br>';
                    }
                  }
                  $( ".resultscontainer" ).append( results );
                  $( ".resultscontainer" ).show();
                  $( ".resultscontainer" ).click(function() {
                    $(this).hide();
                  });

                  data = null;
                  b64img = null;
                  json = null;

                }

              },
              error: function(jqXHR, textStatus, errorThrown) {
                alert('ERRORS: ' + textStatus + ' ' + errorThrown);
              }
            });
          }
        }

        function onFail(message) {
          alert('Failed because: ' + message);
        }
      },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
