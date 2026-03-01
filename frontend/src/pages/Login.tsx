import React, { useState } from 'react';
import { IonPage, IonContent, IonText, IonImg, IonIcon } from '@ionic/react';
import { personOutline, lockClosedOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';

const Login: React.FC = () => {
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameTouched, setUsernameTouched] = useState(false);
  const [isPasswordTouched, setPasswordTouched] = useState(false);
  const [isUsernameValid, setUsernameValid] = useState(true);
  const [isPasswordValid, setPasswordValid] = useState(true);
  const [loginError, setLoginError]  = useState('');

  const validateUsername = (v: string) => /^[a-zA-Z0-9_]{3,}$/.test(v);
  const validatePassword = (v: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v);

  const formReady = 

  const handleLogin = () => {
    setUsernameTouched(true);
    setPasswordTouched(true);
    const uOk = validateUsername(username);
    const pOk = validatePassword(password);
    setUsernameValid(uOk);
    setPasswordValid(pOk);
    setLoginError('');

    if (uOk && pOk) {
      if (username === 'admin' && password === 'admin123_') {
        localStorage.setItem('currentUser', JSON.stringify({ username: 'admin', role: 'admin' }));
        navigate('/admin-dashboard', 'root', 'replace');
        return;
      }
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const match = users.find((u: any) => u.username === username && u.password === password);
      if (match) {
        localStorage.setItem('currentUser', JSON.stringify(match));
        const dest = match.role === 'supervisor' ? '/supervisor-dashboard' : '/dashboard';
        navigate(dest, 'root', 'replace');
      } else {
        setLoginError('Invalid username or password');
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-page">
          <div className="login-background">
            <div className="bg-gradient" />
            <div className="bg-shape bg-shape-1" />
            <div className="bg-shape bg-shape-2" />
          </div>

          <div className="login-container">
            <div className="login-header">
              <div className="logo-wrapper">
                <IonImg src="/logo.png" alt="OJTrack Logo" className="logo-image" />
              </div>
              <IonText className="header-text">
                <h1 className="title">Welcome Back</h1>
                <p className="subtitle">Log in to continue to OJTrack</p>
              </IonText>
            </div>

            <form
              className="login-form"
              onSubmit={e => { e.preventDefault(); handleLogin(); }}
            >
              {/* Username */}
              <div className={`input-group ${isUsernameTouched && !isUsernameValid ? 'input-error' : ''}`}>
                <label className="floating-label">
                  <IonIcon icon={personOutline} className="label-icons" />
                  Username
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    value={username}
                    placeholder="Enter your username"
                    className={`styled-input
                      ${username && validateUsername(username) ? 'input-valid' : ''}
                      ${isUsernameTouched && !isUsernameValid ? 'input-invalid' : ''}`}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (isUsernameTouched) setUsernameValid(validateUsername(e.target.value));
                    }}
                    onFocus={() => setUsernameTouched(true)}
                    onBlur={() => setUsernameValid(validateUsername(username))}
                  />
                  {username && validateUsername(username) && (
                    <IonIcon icon={checkmarkCircleOutline} className="validation-icon success" />
                  )}
                </div>
                {isUsernameTouched && !isUsernameValid && (
                  <IonText className="error-message">
                    Username must be at least 3 characters (letters, numbers, _)
                  </IonText>
                )}
              </div>

              {/* Password */}
              <div className={`input-group ${isPasswordTouched && !isPasswordValid ? 'input-error' : ''}`}>
                <label className="floating-label">
                  <IonIcon icon={lockClosedOutline} className="label-icon" />
                  Password
                </label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Enter your password"
                    className={`styled-input
                      ${validatePassword(password) ? 'input-valid' : ''}
                      ${isPasswordTouched && password.length > 0 && !validatePassword(password) ? 'input-invalid' : ''}`}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (isPasswordTouched) setPasswordValid(validatePassword(e.target.value));
                    }}
                    onFocus={() => setPasswordTouched(true)}
                    onBlur={() => setPasswordValid(validatePassword(password))}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
                {isPasswordTouched && password.length > 0 && !validatePassword(password) && (
                  <IonText className="error-message">
                    Password must be at least 6 characters with letters, numbers, and a special character
                  </IonText>
                )}
              </div>

              {loginError && (
                <IonText className="error-message" style={{ marginTop: 8, display: 'block' }}>
                  {loginError}
                </IonText>
              )}

              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => history.push('/forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className={`login-button ${username && validateUsername(username) && validatePassword(password) ? 'button-ready' : ''}`}
                disabled={!username || !validateUsername(username) || !validatePassword(password)}
              >
                <span>Log In</span>
                <IonIcon icon={arrowForwardOutline} className="button-icon" />
              </button>

              <div className="register-section">
                <IonText className="register-text">
                  Don't have an account?{' '}
                  <span className="register-link" onClick={() => history.push('/register')}>
                    Sign Up
                  </span>
                </IonText>
              </div>
            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;