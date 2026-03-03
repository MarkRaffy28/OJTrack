import React, { useState } from 'react';
import { IonPage, IonContent, IonText, IonImg, IonIcon, IonSpinner, useIonRouter } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { personOutline, lockClosedOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline, arrowForwardOutline, personRemove } from 'ionicons/icons';
import { useAuth } from '../context/authContext';
import API from '../api/api';

const Login: React.FC = () => {
  const ionRouter = useIonRouter();
  const { login, role } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameTouched, setUsernameTouched] = useState(false);
  const [isPasswordTouched, setPasswordTouched] = useState(false);
  const [loginError, setLoginError]  = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formReady = username && password;

  const handleLogin = async () => {
    if (isSubmitting || !formReady) return;
    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/login", { 
        username: username,
        password: password
      });

      if (response.data.token) {
        setLoginError("");

        await login(response.data.token);

        if (role === "user") {
          ionRouter.push("/dashboard", "forward", "replace");
        }

      } else {
        setLoginError("Invalid username and password");
      }
    } catch (error) {
      console.log("Error: ", error);
      setLoginError("Invalid username and password");
    } finally {
      setIsSubmitting(false);
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
              <div className={`input-group ${isUsernameTouched && username.length === 0 ? 'input-error' : ''}`}>
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
                      ${username && username.length > 1 ? 'input-valid' : ''}
                      ${isUsernameTouched && username.length === 0 ? 'input-invalid' : ''}`}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setUsernameTouched(true)}
                  />
                  {username && username.length > 0 && (
                    <IonIcon icon={checkmarkCircleOutline} className="validation-icon success" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className={`input-group ${isPasswordTouched && password.length === 0 ? 'input-error' : ''}`}>
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
                      ${password && password.length > 0 ? 'input-valid' : ''}
                      ${isPasswordTouched && password.length === 0 ? 'input-invalid' : ''}`}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPasswordTouched(true)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
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
                  onClick={() => ionRouter.push('/forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className={`login-button ${formReady ? 'button-ready' : ''}`}
                disabled={!formReady || isSubmitting}
              >
                {
                  isSubmitting ? (
                    <span>
                      <IonSpinner className="button-spinner"></IonSpinner>
                      Loading...
                    </span>
                  ) : (
                    <>
                      <span>  
                        Log In
                      </span>
                      <IonIcon icon={arrowForwardOutline} className="button-icon" />
                    </>
                  )
                }
              </button>

              <div className="register-section">
                <IonText className="register-text">
                  Don't have an account?{' '}
                  <span className="register-link" onClick={() => ionRouter.push('/register')}>
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