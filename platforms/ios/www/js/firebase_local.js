/**
* init firebase
*/
var config = {
  apiKey: "AIzaSyAiLO7YvVzmyrCLcZ-p1zQBNxNz1RgBxPw",
  authDomain: "slate-697ce.firebaseapp.com",
  databaseURL: "https://slate-697ce.firebaseio.com",
  storageBucket: "slate-697ce.appspot.com",
};
firebase.initializeApp(config);
var loggedInUser = null;

/**
* writeProfile
*/
function writeProfile() {
  if (loggedInUser) {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var postData = {
      firstName: firstName,
      lastName: lastName,
      email: email
    };
    var newProfileKey = firebase.database().ref().child('profiles').push().key;
    var updates = {};
    updates['/profiles/' + newProfileKey] = postData;

    firebase.database().ref().update(updates);
    var toast = document.getElementById('toast-profile-save');
    toast.text = "Profile saved..."
    toast.open();
  } else {
    var toast = document.getElementById('toast-profile-save');
    toast.text = "You must be signed in first..."
    toast.open();
  }
}

/**
* sign in
*/
function signIn() {
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
    document.getElementById('sign_button').innerHTML = "Sign In";
  } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    });
    document.getElementById('sign_button').innerHTML = "Sign Out";
  }
}

/**
* on auth state changed
*/
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    loggedInUser = user;
    // update textElement
    updateTextElement("logged_in_user", user.email);
  } else {
    // No user is signed in.
    loggedInUser = null;
    // update textElement
    updateTextElement("logged_in_user", "");
  }
});

/**
* create text element
*/
function updateTextElement(element, text) {
  var textElement = document.getElementById(element);
  textElement.innerHTML = text;
}

/**
* sign out
*/
function signOut() {
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
    document.getElementById('sign_button').innerHTML = "Sign In";
  }
  document.getElementById('sign_button').innerHTML = "Sign In";
  loggedInUser = null;
}

/**
* writeAnnotations
*/
function writeAnnotations(b64img, data) {
  if (loggedInUser) {
    // if we have any annotations
    if (data['responses'][0]) {
      var tstamp = new Date().getTime();
      // save image
      var imgPostData = {
        timestamp: tstamp,
        user: loggedInUser.email,
        base64img: b64img
      };
      var newImageKey = firebase.database().ref().child('images').push().key;
      var imgUpdate = {};
      imgUpdate['/images/' + newImageKey] = imgPostData;
      firebase.database().ref().update(imgUpdate);

      if (data['responses'][0]['labelAnnotations']) {
        for (var i = 0; i < data['responses'][0]['labelAnnotations'].length; i++){
          var obj = data['responses'][0]['labelAnnotations'][i];
          var vDescription = obj['description'];
          var vScore = obj['score'];
          var postData = {
            type: 'LABEL_DETECTION',
            timestamp: tstamp,
            user: loggedInUser.email,
            description: vDescription,
            score: vScore,
            imgid: newImageKey
          };
          var newAnnotationKey = firebase.database().ref().child('annotations').push().key;
          var updates = {};
          updates['/annotations/' + newAnnotationKey] = postData;

          firebase.database().ref().update(updates);
          var toast = document.getElementById('toast-profile-save');
        }
      } else if (data['responses'][0]['textAnnotations']) {
        for (var i = 0; i < data['responses'][0]['textAnnotations'].length; i++){
          var obj = data['responses'][0]['textAnnotations'][i];
          var vDescription = obj['description'];
          var vScore = obj['score'];
          var postData = {
            type: 'TEXT_DETECTION',
            timestamp: tstamp,
            user: loggedInUser.email,
            text: vDescription,
            imgid: newImageKey
          };
          var newAnnotationKey = firebase.database().ref().child('annotations').push().key;
          var updates = {};
          updates['/annotations/' + newAnnotationKey] = postData;

          firebase.database().ref().update(updates);
          var toast = document.getElementById('toast-profile-save');
        }
      } else if (data['responses'][0]['faceAnnotations']) {
        for (var i = 0; i < data['responses'][0]['faceAnnotations'].length; i++){
          var obj = data['responses'][0]['faceAnnotations'][i];
          var vAngerLikelihood = obj['angerLikelihood'];
          var vBlurredLikelihood = obj['blurredLikelihood'];
          var vHeadwearLikelihood = obj['headwearLikelihood'];
          var vJoyLikelihood = obj['joyLikelihood'];
          var vSorrowLikelihood = obj['sorrowLikelihood'];
          var vSurpriseLikelihood = obj['surpriseLikelihood'];
          var vUnderExposedLikelihood = obj['underExposedLikelihood'];
          var postData = {
            type: 'FACE_DETECTION',
            timestamp: tstamp,
            user: loggedInUser.email,
            angerLikelihood: vAngerLikelihood,
            blurredLikelihood: vBlurredLikelihood,
            headwearLikelihood: vHeadwearLikelihood,
            joyLikelihood: vJoyLikelihood,
            sorrowLikelihood: vSorrowLikelihood,
            surpriseLikelihood: vSurpriseLikelihood,
            underExposedLikelihood: vUnderExposedLikelihood,
            imgid: newImageKey
          };
          var newAnnotationKey = firebase.database().ref().child('annotations').push().key;
          var updates = {};
          updates['/annotations/' + newAnnotationKey] = postData;

          firebase.database().ref().update(updates);
          var toast = document.getElementById('toast-profile-save');
        }
      }
      toast.text = "Annotation saved...";
      toast.open();
    }
  } else {
      var toast = document.getElementById('toast-profile-save');
      toast.text = "You must be signed in to save annotations...";
      toast.open();
  }
}