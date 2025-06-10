// components/GitHubLoginButton.js
import React from 'react';

function GitHubLoginButton() {
  const [clicked, setClicked] = React.useState(false);

  const handleGitHubLogin = () => {
    if (!clicked) {
      setClicked(true);
      window.location.href = 'http://localhost:5555/login/github'; // 🔥 updated
    }
  };

  return (
    <button onClick={handleGitHubLogin} disabled={clicked}>
      Login with GitHub
    </button>
  );
}

export default GitHubLoginButton;
