// Google Identity Services integration
let currentUser = null;

function initGoogleAuth() {
  if (!google || !google.accounts || !google.accounts.id) {
    console.error('Google Identity Services not loaded');
    return;
  }

  google.accounts.id.initialize({
    client_id: '1009872626389-rbgkpr4mtl2i2varf8fso2ji2f17m85a.apps.googleusercontent.com', // Replace with actual client ID
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById('signin-btn'),
    { theme: 'outline', size: 'large' }
  );

  google.accounts.id.prompt();
}

function handleCredentialResponse(response) {
  const idToken = response.credential;
  // Decode the JWT to get user info
  const payload = JSON.parse(atob(idToken.split('.')[1]));
  currentUser = {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    idToken: idToken
  };

  document.getElementById('signin-btn').style.display = 'none';
  document.getElementById('user-info').innerHTML = `
    <p>Welcome, ${currentUser.name}!</p>
    <button onclick="signOut()">Sign Out</button>
  `;
  document.getElementById('user-info').style.display = 'block';
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  currentUser = null;
  document.getElementById('signin-btn').style.display = 'block';
  document.getElementById('user-info').style.display = 'none';
}

function getCurrentUser() {
  return currentUser;
}

// Make it global
window.getCurrentUser = getCurrentUser;

// Initialize when DOM is ready and Google script is loaded
function checkGoogleAndInit() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    initGoogleAuth();
  } else {
    setTimeout(checkGoogleAndInit, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkGoogleAndInit);
} else {
  checkGoogleAndInit();
}