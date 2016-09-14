// var api_key = 'AIzaSyA0z3o0ypUKjzjJLn1C6X2dCiIX7o6avNo';
// var video = document.getElementById("videoElement");
// var container = document.getElementById("videoContainer");
// var canvas = document.createElement("canvas");
// var clientWidth = document.getElementById("main_content").offsetWidth;
// var clientHeight = window.innerHeight;
// var videoSelect = document.querySelector('select#videoSource');
// var selectors = [videoSelect];
// var feature_types = [
//   "TYPE_UNSPECIFIED",
//   "FACE_DETECTION",
//   "LANDMARK_DETECTION",
//   "LOGO_DETECTION",
//   "LABEL_DETECTION",
//   "TEXT_DETECTION",
//   "SAFE_SEARCH_DETECTION",
//   "IMAGE_PROPERTIES"
// ];
//
// videoSelect.onchange = start;
//
// if (window.matchMedia("(orientation: portrait)").matches) {
//   // portrait
//   var width = 0.9 * clientWidth;
//   var height = 4 * (width/3);
// } else {
//   // landscape
//   var width = 0.9 * clientWidth;
//   var height = 3 * width/4;
// }
//
// canvas.width = width;
// canvas.height = height;
//
// container.setAttribute("style","margin:auto; display:block; width:" + width + "px; height:" + height + "px");
// video.setAttribute("style","margin:auto; display:block; width:" + width + "px; height:" + height + "px");
//
// function getCamera(deviceInfos) {
//   // Handles being called several times to update labels. Preserve values.
//   var values = selectors.map(function(select) {
//     return select.value;
//   });
//   selectors.forEach(function(select) {
//     while (select.firstChild) {
//       select.removeChild(select.firstChild);
//     }
//   });
//   for (var i = 0; i !== deviceInfos.length; ++i) {
//     var deviceInfo = deviceInfos[i];
//     var option = document.createElement('option');
//     option.value = deviceInfo.deviceId;
//
//     if (deviceInfo.kind === 'videoinput') {
//       option.text = deviceInfo.label || 'Camera ' + (videoSelect.length + 1);
//       videoSelect.appendChild(option);
//     } else {
//       console.log('Found other kind of source/device: ', deviceInfo);
//     }
//   }
//   selectors.forEach(function(select, selectorIndex) {
//     if (Array.prototype.slice.call(select.childNodes).some(function(n) {
//       return n.value === values[selectorIndex];
//     })) {
//       select.value = values[selectorIndex];
//     }
//   });
// }
//
// navigator.mediaDevices.enumerateDevices().then(getCamera).catch(handleError);
//
// function gotStream(stream) {
//   window.stream = stream;
//   video.src = window.URL.createObjectURL(stream);
//   return navigator.mediaDevices.enumerateDevices();
// }
//
// function start() {
//   if (window.stream) {
//     window.stream.getTracks().forEach(function(track) {
//       track.stop();
//     });
//   }
//   var videoSource = videoSelect.value;
//   var constraints = {
//     video: { deviceId: videoSource ? { exact: videoSource } : undefined }
//   };
//   navigator.getUserMedia = navigator.getUserMedia ||
//     navigator.webkitGetUserMedia ||
//     navigator.mozGetUserMedia ||
//     navigator.msGetUserMedia ||
//     navigator.oGetUserMedia;
//
//   if (navigator.getUserMedia) {
//     navigator.getUserMedia(constraints, gotStream, handleError);
//   }
// }
//
// start();
//
// function handleError(error) {
//   console.log('navigator.getUserMedia error: ', error);
// }
//
// function getImage() {
//   canvas.getContext('2d').drawImage(video, 0, 0, width, height);
//   var base64img = canvas.toDataURL();
//   return base64img;
// }
//
// function doCloudVision() {
//   document.getElementById('progress_panel').style.visibility = 'visible';
//   document.getElementById('response').innerHTML = "";
//   var b64img = getImage().replace("data:image/png;base64,", "");
//   var selected_type = feature_types[document.getElementById('feature_type_listbox').selected];
//   var json = '{' +
//     ' "requests": [' +
//     '	{ ' +
//     '	  "image": {' +
//     '	    "content":"' + b64img + '"' +
//     '	  },' +
//     '	  "features": [' +
//     '	      {' +
//     '	      	"type": "' + selected_type + '",' +
//     '			"maxResults": 200' +
//     '	      }' +
//     '	  ]' +
//     '	}' +
//     ']' +
//     '}';
//
//   jQuery.ajax({
//     type: 'POST',
//     url: "https://vision.googleapis.com/v1/images:annotate?key=" + api_key,
//     dataType: 'json',
//     data: json,
//     //Include headers, otherwise you get an odd 400 error.
//     headers: {
//       "Content-Type": "application/json",
//     },
//
//     success: function(data, textStatus, jqXHR) {
//       document.getElementById('progress_panel').style.visibility = 'hidden';
//       if (data['responses'][0]) {
//         var results = "";
//
//         if (data['responses'][0]['labelAnnotations']) {
//           for (var i = 0; i < data['responses'][0]['labelAnnotations'].length; i++){
//             var obj = data['responses'][0]['labelAnnotations'][i];
//             var description = obj['description'];
//             var score = obj['score'];
//             results += description + ": " + score + "</br>";
//           }
//           writeAnnotations(b64img, data);
//           document.getElementById('response').innerHTML = results;
//         } else if (data['responses'][0]['textAnnotations']) {
//           for (var i = 0; i < data['responses'][0]['textAnnotations'].length; i++){
//             var obj = data['responses'][0]['textAnnotations'][i];
//             var description = obj['description'];
//             results += description + "</br>";
//           }
//           writeAnnotations(b64img, data);
//           document.getElementById('response').innerHTML = results;
//         } else if (data['responses'][0]['faceAnnotations']) {
//           for (var i = 0; i < data['responses'][0]['faceAnnotations'].length; i++){
//             var obj = data['responses'][0]['faceAnnotations'][i];
//             var description = obj['description'];
//             var angerLikelihood = obj['angerLikelihood'];
//             var blurredLikelihood = obj['blurredLikelihood'];
//             var headwearLikelihood = obj['headwearLikelihood'];
//             var joyLikelihood = obj['joyLikelihood'];
//             var sorrowLikelihood = obj['sorrowLikelihood'];
//             var surpriseLikelihood = obj['surpriseLikelihood'];
//             var underExposedLikelihood = obj['underExposedLikelihood'];
//             results += 'angerLikelihood: ' + angerLikelihood + '</br>' +
//               'blurredLikelihood: ' + blurredLikelihood + '</br>' +
//               'headwearLikelihood: ' + headwearLikelihood + '</br>' +
//               'joyLikelihood: ' + joyLikelihood + '</br>' +
//               'sorrowLikelihood: ' + sorrowLikelihood + '</br>' +
//               'surpriseLikelihood: ' + surpriseLikelihood + '</br>' +
//               'underExposedLikelihood: ' + underExposedLikelihood + '</br>';
//           }
//           writeAnnotations(b64img, data);
//           document.getElementById('response').innerHTML = results;
//         }
//         data = null;
//         b64img = null;
//         json = null;
//       }
//     },
//     error: function(jqXHR, textStatus, errorThrown) {
//       console.log('ERRORS: ' + textStatus + ' ' + errorThrown);
//     }
//   });
// }
