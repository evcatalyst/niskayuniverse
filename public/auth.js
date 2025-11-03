// Google Identity Services integration
let currentUser = null;

function initGoogleAuth() {
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID
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

// Load Google Identity Services script
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.onload = initGoogleAuth;
document.head.appendChild(script);