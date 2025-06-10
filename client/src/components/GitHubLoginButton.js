import React from 'react';

function GitHubLoginButton() {
  const [clicked, setClicked] = React.useState(false);

  const handleGitHubLogin = () => {
    if (!clicked) {
      setClicked(true);
      window.location.href = 'http://localhost:5555/login/github';
    }
  };

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={clicked}
      style={{
        backgroundColor: clicked ? '#999' : '#24292e',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: clicked ? 'not-allowed' : 'pointer',
      }}
    >
      {clicked ? 'Redirecting...' : 'Login with GitHub'}
    </button>
  );
}

export default GitHubLoginButton;
