// components/GitHubLoginButton.js
import React from 'react';

function GitHubLoginButton() {
  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5555/login/github';
  };

  return (
    <button onClick={handleGitHubLogin} style={{ marginTop: '10px' }}>
      Login with GitHub
    </button>
  );
}

export default GitHubLoginButton;
