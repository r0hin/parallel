import { getAuth, onAuthStateChanged, GoogleAuthProvider, TwitterAuthProvider, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail} from '@firebase/auth';
import { startMainElectronProcesses } from './electron';
import { checkAppInitialized } from './firebaseChecks';

checkAppInitialized();
const auth = getAuth();

window.emailSent = false;

window.showIn = () => {
  $('#card').addClass('card_expanded');
  $('#buttons').addClass('fadeOut');
  $('#buttons').removeClass('fadeIn');

  window.setTimeout(() => {
    $('#buttons').addClass('hidden');
    $('#in').removeClass('hidden');
    $('#in').removeClass('fadeOut');
    $('#in').addClass('fadeIn');
  }, 500);
}

window.showUp = () => {
  $('#card').addClass('card_expanded');
  $('#buttons').removeClass('fadeIn');
  $('#buttons').addClass('fadeOut');

  window.setTimeout(() => {
    $('#buttons').addClass('hidden');
    $('#up').removeClass('hidden');
    $('#up').removeClass('fadeOut');
    $('#up').addClass('fadeIn');
  }, 500)
}

window.goBack = () => {
  $('#up').removeClass('fadeIn');
  $('#up').addClass('fadeOut');
  $('#in').removeClass('fadeIn');
  $('#in').addClass('fadeOut');
  $('#reset').removeClass('fadeIn');
  $('#reset').addClass('fadeOut');
  
  window.setTimeout(() => {
    $('#card').removeClass('card_expanded');
    $('#card').removeClass('card_Semiexpanded');
  }, 250)

  window.setTimeout(() => {
    $('#up').addClass('hidden');
    $('#in').addClass('hidden');
    $('#reset').addClass('hidden');

    $('#buttons').removeClass('fadeOut');
    $('#buttons').removeClass('hidden');
    $('#buttons').addClass('fadeIn');
  }, 500);
}

window.forgotPassword = () => {
  $('#card').removeClass('card_expanded');
  $('#card').addClass('card_Semiexpanded');
  $('#in').removeClass('fadeIn');
  $('#in').addClass('fadeOut');

  window.setTimeout(() => {
    $('#in').addClass('hidden');
    $('#reset').removeClass('hidden');
    $('#reset').removeClass('fadeOut');
    $('#reset').addClass('fadeIn');
  }, 500);
}

window.sendPassResetEmail = async () => {
  $('#emailresetbutton').addClass('disabled');
  const email = $(`#email3`).val();
  sendPasswordResetEmail(auth, email).then(() => {
    $('#emailresetbutton').html(`email sent`);
    snac('Password Reset Email Sent', `If the account exists, a password reset email was sent to <b>${email}</b>. Please check your email and follow the instructions to reset your password.`, 'success');
    $(`#email3`).val('');
    emailSent = true;
  }).catch((err) => {
    $('#emailresetbutton').removeClass('disabled');
    snac('Password Reset Email Error', `${err}`, 'danger');
  });
}

$('input').on('focusin', function() {
  $(this).parent().find('label').addClass('active');
});

$('input').on('focusout', function() {
  if (!this.value) {
    $(this).parent().find('label').removeClass('active');
  }
});

$(`#password2`).get(0).addEventListener("keyup", function(event) {
  if (event.keyCode === 13) { event.preventDefault(); 
    $('#signUpButton').get(0).click();
  }
});

$(`#password`).get(0).addEventListener("keyup", function(event) {
  if (event.keyCode === 13) { event.preventDefault(); $(`#loginbutton`).get(0).click() }
});

$(`#email3`).get(0).addEventListener("keyup", function(event) {
  if (event.keyCode === 13) { event.preventDefault(); 
    if (!emailSent) {
      $(`#emailresetbutton`).get(0).click() }
    }
});


// Auth
onAuthStateChanged(auth, (user) => {
  if (window.require) {
    console.log("Electron detected.");
    startMainElectronProcesses();
  }
  if (user) {
    window.location.replace('app.html');
  } else {
    $('#loading').addClass('hidden');
    $('#card').removeClass('hidden');
  }
})

window.signInWith = (service) => {
  let provider = null;
  switch (service) {
    case "google":
      toggleloadersubmitgoogle();
      provider = new GoogleAuthProvider();
      break;
    case "twitter":
      toggleloadersubmittwitter();
      provider = new TwitterAuthProvider();
      break;
    default:
      return;
  }

  signInWithRedirect(auth, provider).catch((error) => {
    snac('Authentication Error', error.message, 'danger');

    window.setTimeout(() => {
      $('.googlebtn').html(`<h3><i class='bx bxl-google'></i></h3>`);
      $('.twitterbtn').html(`<h3><i class='bx bxl-twitter'></i></h3>`);
      $('.providerbtn').removeClass('disabled');
    }, 1800)
  });
}

window.submitLogin = () => {
  toggleloadersubmit();
  console.log('Attemping to login...');
  signInWithEmailAndPassword(auth, $('#email').val(), $('#password').val()).catch((error) => {
    $('#password').val('');
    snac('Authentication Error', error.message, 'danger');
    window.setTimeout(() => {
      $('.submitbtn').html(`Submit`);
      $('.submitbtn').removeClass('disabled');
      $('.submitbtn').addClass('pulse');
      window.setTimeout(() => {
        $('.submitbtn').removeClass('pulse');
      }, 800);
    }, 1800);
  });
}

window.submitSignup = () => {
  toggleloadersubmit();
  console.log('Attemping to login...');
  createUserWithEmailAndPassword(auth, $('#email2').val(), $('#password2').val()).catch((error) => {
    $('#password2').val('');
    snac('Authentication Error', error.message, 'danger');
    window.setTimeout(() => {
      $('.submitbtn').html(`Submit`);
      $('.submitbtn').removeClass('disabled');
      $('.submitbtn').addClass('pulse');
      window.setTimeout(() => {
        $('.submitbtn').removeClass('pulse');
      }, 800);
    }, 800);
  });
}

function toggleloadersubmit() {
  $('.submitbtn').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('.submitbtn').addClass('disabled');
  $('.submitbtn').removeClass('pulse');
}

function toggleloadersubmitgoogle() {
  $('.googlebtn').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('.googlebtn').addClass('disabled');
}

function toggleloadersubmittwitter() {
  $('.twitterbtn').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('.twitterbtn').addClass('disabled');
}

window.snacks = {};

const notyf = new Notyf({
  types: [
    {
      type: 'info',
      background: 'white',
      className: 'toast',
      duration: 6000,
      icon: false,
      position: {
        x: 'right',
        y: 'top',
      },
    }
  ]
});

const notyfSuccess = new Notyf({
  types: [
    {
      type: 'info',
      background: 'lime',
      className: 'toastlime',
      duration: 6000,
      icon: false,
      position: {
        x: 'right',
        y: 'top',
      },
    }
  ]
});

const notyfDanger = new Notyf({
  types: [
    {
      type: 'info',
      background: '#b81212',
      className: 'toastred',
      duration: 6000,
      icon: false,
      position: {
        x: 'right',
        y: 'top',
      },
    }
  ]
});



window.snac = (titre, texte, theme) => {
  let activeThemeType = notyf;
  let activeThemeTypeName = 'notyf';
  if (theme === 'danger') {
    activeThemeType = notyfDanger;
    activeThemeTypeName = 'notyfDanger';
  }
  if (theme === 'success') {
    activeThemeType = notyfSuccess;
    activeThemeTypeName = 'notyfSuccess';
  }

  // Eon's notyf layer.
  const index = new Date().getTime();
  snacks[index] = activeThemeType.open({
    type: 'info',
    message: `<h3>${titre}</h3><p>${texte}</p><i onclick="${activeThemeTypeName}.dismiss(snacks[${index}])" class='bx bx-message-square-minus'></i>`
  });
}