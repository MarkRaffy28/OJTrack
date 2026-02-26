import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonText, IonIcon, IonLabel, IonLoading } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline, arrowBackOutline, arrowForwardOutline, schoolOutline, briefcaseOutline, alertCircleOutline } from 'ionicons/icons';
import API from '../api/api';

type UserRole = 'student' | 'supervisor' | null;

type RegistrationStep = 'role' | 'username' | 'form';

function Register () {
  const history = useHistory();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('role');
  
  // Username check states
  const [username, setUsername] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  // Common fields
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [extensionName, setExtensionName] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Student-specific fields
  const [studentId, setStudentId] = useState<string>('');
  const [program, setProgram] = useState<string>('');
  const [year, setYear] = useState<string>('');
  
  // Supervisor-specific fields
  const [employeeId, setEmployeeId] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  
  // Validation states
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<boolean>(true);
  
  // Touched states
  const [isFirstNameTouched, setIsFirstNameTouched] = useState<boolean>(false);
  const [isMiddleNameTouched, setIsMiddleNameTouched] = useState<boolean>(false);
  const [isLastNameTouched, setIsLastNameTouched] = useState<boolean>(false);
  const [isGenderTouched, setIsGenderTouched] = useState<boolean>(false);
  const [isEmailTouched, setIsEmailTouched] = useState<boolean>(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState<boolean>(false);
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] = useState<boolean>(false);
  const [isStudentIdTouched, setIsStudentIdTouched] = useState<boolean>(false);
  const [isProgramTouched, setIsProgramTouched] = useState<boolean>(false);
  const [isYearTouched, setIsYearTouched] = useState<boolean>(false);
  const [isEmployeeIdTouched, setIsEmployeeIdTouched] = useState<boolean>(false);
  const [isDepartmentTouched, setIsDepartmentTouched] = useState<boolean>(false);

  // Simulated username check - in a real app, this would call your backend API
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      const response = await API.post("/users/exists", {username: username});
      return !response.data.available;
      console.log(!response.data.available)
    } catch (error) {
      console.log("Error: ", error);
      return true;
    }
  };

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const validatePassword = (pwd: string): boolean => {
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    return pwdRegex.test(pwd);
  };

  const handleRegister = () => {
    setIsFirstNameTouched(true);
    setIsLastNameTouched(true);
    setIsGenderTouched(true);
    setIsEmailTouched(true);
    setIsPasswordTouched(true);
    setIsConfirmPasswordTouched(true);
    
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    const confirmPasswordValid = confirmPassword === password && validatePassword(confirmPassword);
    const firstNameValid = firstName.trim().length >= 2;
    const lastNameValid = lastName.trim().length >= 2;
    const genderValid = gender.length > 0;

    setIsEmailValid(emailValid);
    setIsPasswordValid(passwordValid);
    setIsConfirmPasswordValid(confirmPasswordValid);

    if (selectedRole === 'student') {
      setIsStudentIdTouched(true);
      setIsProgramTouched(true);
      setIsYearTouched(true);
      const isValid = firstNameValid && lastNameValid && genderValid && emailValid && passwordValid && confirmPasswordValid && studentId.length >= 5 && program.length >= 2 && year.length > 0;
      if (isValid) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const exists = users.find((u: any) => u.username === username);
        if (exists) {
          setUsernameError('Username is already registered');
          return;
        }
        users.push({ username, password, role: selectedRole, firstName, middleName, lastName, extensionName, gender, email, studentId, program, year });
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Student registration successful');
        history.push('/login');
      }
    } else if (selectedRole === 'supervisor') {
      setIsEmployeeIdTouched(true);
      setIsDepartmentTouched(true);
      const isValid = firstNameValid && lastNameValid && genderValid && emailValid && passwordValid && confirmPasswordValid && employeeId.length >= 3 && department.length >= 2;
      if (isValid) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const exists = users.find((u: any) => u.username === username);
        if (exists) {
          setUsernameError('Username is already registered');
          return;
        }
        users.push({ username, password, role: selectedRole, firstName, middleName, lastName, extensionName, gender, email, employeeId, department });
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Supervisor registration successful');
        history.push('/login');
      }
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep('username');
  };

  const handleUsernameCheck = async () => {
    if (!username || username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    setIsCheckingUsername(true);
    setUsernameError('');
    
    try {
      const usernameExists = await checkUsernameExists(username);
      if (!usernameExists) {
        setUsernameAvailable(true);
        setTimeout(() => {
          setRegistrationStep('form');
        }, 800);
      } else {
        setUsernameAvailable(false);
        setUsernameError('This username is already taken');
      }
    } catch (error) {
      setUsernameError('Error checking username. Please try again.');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleBackFromUsername = () => {
    setSelectedRole(null);
    setRegistrationStep('role');
    setUsername('');
    setUsernameError('');
    setUsernameAvailable(null);
  };

  const handleBack = () => {
    if (registrationStep === 'form') {
      setRegistrationStep('username');
    } else if (registrationStep === 'username') {
      handleBackFromUsername();
    } else {
      history.push('/login');
    }
  };

  // Render role selection
  const renderRoleSelection = () => (
    <div className="role-selection-container">
      <div className="role-header">
        <div className="logo-wrapper">
          <div className="logo-circle">
            <span className="logo-icon">📊</span>
          </div>
        </div>
        <IonText className="header-text">
          <h1 className="title">Join OJTrack</h1>
          <p className="subtitle">Select your role to get started</p>
        </IonText>
      </div>

      <div className="role-cards">
        <button
          className={`role-card ${selectedRole === 'student' ? 'role-selected' : ''}`}
          onClick={() => handleRoleSelect('student')}
        >
          <div className="role-card-icon student-icon">
            <IonIcon icon={schoolOutline} />
          </div>
          <IonText className="role-card-text">
            <h3>Student</h3>
            <p>Track your OJT hours and submit reports</p>
          </IonText>
          <IonIcon icon={arrowForwardOutline} className="role-card-arrow" />
        </button>

        <button
          className={`role-card ${selectedRole === 'supervisor' ? 'role-selected' : ''}`}
          onClick={() => handleRoleSelect('supervisor')}
        >
          <div className="role-card-icon supervisor-icon">
            <IonIcon icon={briefcaseOutline} />
          </div>
          <IonText className="role-card-text">
            <h3>Supervisor</h3>
            <p>Manage students and review their progress</p>
          </IonText>
          <IonIcon icon={arrowForwardOutline} className="role-card-arrow" />
        </button>
      </div>

      <div className="login-link-section">
        <IonText className="login-text">
          Already have an account?{' '}
          <span className="login-link" onClick={() => history.push('/login')}>
            Log In
          </span>
        </IonText>
      </div>
    </div>
  );

  // Render username check form
  const renderUsernameCheck = () => (
    <div className="username-check-container">
      <button className="back-button" onClick={handleBackFromUsername}>
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div className="register-header">
        <IonText className="header-text">
          <h1 className="title">Choose Username</h1>
          <p className="subtitle">
            Create a unique username for your{' '}
            {selectedRole === 'student' ? 'student' : 'supervisor'} account
          </p>
        </IonText>
      </div>

      <div className="register-form">
        <div className={`input-group ${usernameError ? 'input-error' : ''}`}>
          <label className="floating-label">
            <IonIcon icon={personOutline} className="label-icon" />
            Username
          </label>
          <div className="input-container">
            <input
              type="text"
              value={username}
              maxLength={30}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                setUsername(value);
                setUsernameError('');
                setUsernameAvailable(null);
              }}
              className={`styled-input ${username && !usernameError && usernameAvailable === true ? 'input-valid' : ''} ${usernameError ? 'input-invalid' : ''}`}
              placeholder="Choose a unique username"
              disabled={isCheckingUsername}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCheckingUsername) {
                  handleUsernameCheck();
                }
              }}
            />
            {username && usernameAvailable === true && (
              <IonIcon icon={checkmarkCircleOutline} className="validation-icon success" />
            )}
            {usernameError && (
              <IonIcon icon={alertCircleOutline} className="validation-icon error" />
            )}
          </div>
          {usernameError && (
            <IonText className="error-message">{usernameError}</IonText>
          )}
        </div>

        <div className="username-tips">
          <IonText className="tips-title">Username must:</IonText>
          <ul className="tips-list">
            <li className={username.length >= 3 ? 'tip-done' : ''}>Be at least 3 characters</li>
            <li className={username.length <= 30 ? 'tip-done' : ''}>Maximum of 30 characters</li>
            <li className={/^[a-zA-Z0-9_]+$/.test(username) && username.length > 0 ? 'tip-done' : ''}>Contain only letters, numbers, and underscores</li>
            <li className={usernameAvailable === true ? 'tip-done' : ''}>Be unique (not taken)</li>
          </ul>
        </div>

        <button
          className={`register-button ${
            username.length >= 3 && !usernameError && usernameAvailable === true ? 'button-ready' : ''
          }`}
          onClick={handleUsernameCheck}
          disabled={username.length < 3 || isCheckingUsername}
        >
          {isCheckingUsername ? (
            <IonLoading message="Checking..." spinner="circular" />
          ) : usernameAvailable === true ? (
            <>
              <span>Username Available!</span>
              <IonIcon icon={checkmarkCircleOutline} className="button-icon" />
            </>
          ) : (
            <>
              <span>Check Availability</span>
              <IonIcon icon={arrowForwardOutline} className="button-icon" />
            </>
          )}
        </button>

        {usernameAvailable === true && (
          <button
            className="continue-button"
            onClick={() => setRegistrationStep('form')}
          >
            <IonText className="continue-text">
              Continue to registration <IonIcon icon={arrowForwardOutline} />
            </IonText>
          </button>
        )}
      </div>
    </div>
  );

  // Render registration form
  const renderForm = () => (
    <div className="register-container">

      <button className="back-button" onClick={handleBack}>
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div className="register-header">
        <IonText className="header-text">
          <h1 className="title">
            {selectedRole === 'student' ? 'Student Registration' : 'Supervisor Registration'}
          </h1>
          <p className="subtitle">Complete your account setup</p>
        </IonText>
      </div>

      <div className="username-display">
        <IonIcon icon={personOutline} className="username-icon" />
        <IonText className="username-value">@{username}</IonText>
        <button 
          className="change-username-btn"
          onClick={() => {
            setRegistrationStep('username');
            setUsernameAvailable(null);
          }}
        >
          Change
        </button>
      </div>

      <div className="register-form">

        {/* First Name */}
        <div className={`input-group ${isFirstNameTouched && firstName.trim().length < 2 ? 'input-error' : ''}`}>
          <label className="floating-label">
            <IonIcon icon={personOutline} className="label-icon" />
            First Name
          </label>
          <div className="input-container">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setIsFirstNameTouched(true)}
              className={`styled-input ${isFirstNameTouched && firstName.trim().length < 2 ? 'input-invalid' : firstName.trim().length >= 2 ? 'input-valid' : ''}`}
              placeholder="Enter your first name"
            />
            {isFirstNameTouched && firstName.trim().length < 2 && (
              <IonIcon icon={alertCircleOutline} className="validation-icon error" />
            )}
          </div>
          {isFirstNameTouched && firstName.trim().length === 0 && (
            <IonText className="error-message">First name is required</IonText>
          )}
          {isFirstNameTouched && firstName.trim().length > 0 && firstName.trim().length < 2 && (
            <IonText className="error-message">First name must be at least 2 characters</IonText>
          )}
        </div>

        {/* Middle Name (optional) */}
        <div className="input-group">
          <label className="floating-label">
            <IonIcon icon={personOutline} className="label-icon" />
            Middle Name <span style={{ fontWeight: 'normal', opacity: 0.6, fontSize: '0.85em' }}>(optional)</span>
          </label>
          <div className="input-container">
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              onBlur={() => setIsMiddleNameTouched(true)}
              className="styled-input"
              placeholder="Enter your middle name (optional)"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className={`input-group ${isLastNameTouched && lastName.trim().length < 2 ? 'input-error' : ''}`}>
          <label className="floating-label">
            <IonIcon icon={personOutline} className="label-icon" />
            Last Name
          </label>
          <div className="input-container">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setIsLastNameTouched(true)}
              className={`styled-input ${isLastNameTouched && lastName.trim().length < 2 ? 'input-invalid' : lastName.trim().length >= 2 ? 'input-valid' : ''}`}
              placeholder="Enter your last name"
            />
            {isLastNameTouched && lastName.trim().length < 2 && (
              <IonIcon icon={alertCircleOutline} className="validation-icon error" />
            )}
          </div>
          {isLastNameTouched && lastName.trim().length === 0 && (
            <IonText className="error-message">Last name is required</IonText>
          )}
          {isLastNameTouched && lastName.trim().length > 0 && lastName.trim().length < 2 && (
            <IonText className="error-message">Last name must be at least 2 characters</IonText>
          )}
        </div>

        {/* Extension Name (optional) */}
        <div className="input-group">
          <label className="floating-label">
            <IonIcon icon={personOutline} className="label-icon" />
            Extension Name <span style={{ fontWeight: 'normal', opacity: 0.6, fontSize: '0.85em' }}>(optional)</span>
          </label>
          <div className="input-container">
            <input
              type="text"
              value={extensionName}
              onChange={(e) => setExtensionName(e.target.value)}
              className="styled-input"
              placeholder="Extension Name (e.g., Jr., III)"
            />
          </div>
        </div>

        {/* Gender — FIX: value={gender} instead of value={year} */}
        <div className={`input-group ${isGenderTouched && gender.length === 0 ? 'input-error' : ''}`}>
          <label className="floating-label">
            <IonIcon icon={personOutline} className="label-icon" />
            Gender
          </label>
          <div className="input-container">
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setIsGenderTouched(true);
              }}
              onBlur={() => setIsGenderTouched(true)}
              className={`styled-input ${isGenderTouched && gender.length === 0 ? 'input-invalid' : gender.length > 0 ? 'input-valid' : ''}`}
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {isGenderTouched && gender.length === 0 && (
            <IonText className="error-message">Please select your gender</IonText>
          )}
        </div>

        {/* Email */}
        <div className={`input-group ${isEmailTouched && !isEmailValid ? 'input-error' : ''}`}>
          <label className="floating-label">
            <IonIcon icon={mailOutline} className="label-icon" />
            Email
          </label>
          <div className="input-container">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (isEmailTouched) {
                  setIsEmailValid(validateEmail(e.target.value));
                }
              }}
              onFocus={() => setIsEmailTouched(true)}
              onBlur={() => setIsEmailValid(validateEmail(email))}
              className={`styled-input ${email && validateEmail(email) ? 'input-valid' : ''} ${isEmailTouched && !isEmailValid ? 'input-invalid' : ''}`}
              placeholder="Enter your email"
            />
            {email && validateEmail(email) && (
              <IonIcon icon={checkmarkCircleOutline} className="validation-icon success" />
            )}
          </div>
          {isEmailTouched && !isEmailValid && (
            <IonText className="error-message">Please enter a valid email address</IonText>
          )}
        </div>

        {/* Student-specific fields */}
        {selectedRole === 'student' && (
          <>
            <div className="input-group">
              <label className="floating-label">Student ID</label>
              <div className="input-container">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onFocus={() => setIsStudentIdTouched(true)}
                  onBlur={() => setIsStudentIdTouched(true)}
                  className={`styled-input ${isStudentIdTouched && studentId.length < 5 ? 'input-invalid' : studentId.length >= 5 ? 'input-valid' : ''}`}
                  placeholder="Enter your student ID"
                />
              </div>
              {isStudentIdTouched && studentId.length === 0 && (
                <IonText className="error-message">Student ID is required</IonText>
              )}
              {isStudentIdTouched && studentId.length > 0 && studentId.length < 5 && (
                <IonText className="error-message">Student ID must be at least 5 characters</IonText>
              )}
            </div>

            <div className="input-group">
              <label className="floating-label">Program/Course</label>
              <div className="input-container">
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  onFocus={() => setIsProgramTouched(true)}
                  onBlur={() => setIsProgramTouched(true)}
                  className={`styled-input ${isProgramTouched && program.length < 2 ? 'input-invalid' : program.length >= 2 ? 'input-valid' : ''}`}
                  placeholder="Enter your program"
                />
              </div>
              {isProgramTouched && program.length === 0 && (
                <IonText className="error-message">Program/Course is required</IonText>
              )}
              {isProgramTouched && program.length > 0 && program.length < 2 && (
                <IonText className="error-message">Program must be at least 2 characters</IonText>
              )}
            </div>

            {/* Year Level Dropdown */}
            <div className={`input-group ${isYearTouched && year.length === 0 ? 'input-error' : ''}`}>
              <label className="floating-label">Year Level</label>
              <div className="input-container">
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setIsYearTouched(true);
                  }}
                  onBlur={() => setIsYearTouched(true)}
                  className={`styled-input ${isYearTouched && year.length === 0 ? 'input-invalid' : year.length > 0 ? 'input-valid' : ''}`}
                >
                  <option value="">Select your year level</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              {isYearTouched && year.length === 0 && (
                <IonText className="error-message">Please select your year level</IonText>
              )}
            </div>
          </>
        )}

        {/* Supervisor-specific fields */}
        {selectedRole === 'supervisor' && (
          <>
            <div className="input-group">
              <label className="floating-label">Employee ID</label>
              <div className="input-container">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onFocus={() => setIsEmployeeIdTouched(true)}
                  onBlur={() => setIsEmployeeIdTouched(true)}
                  className={`styled-input ${isEmployeeIdTouched && employeeId.length < 3 ? 'input-invalid' : employeeId.length >= 3 ? 'input-valid' : ''}`}
                  placeholder="Enter your employee ID"
                />
              </div>
              {isEmployeeIdTouched && employeeId.length === 0 && (
                <IonText className="error-message">Employee ID is required</IonText>
              )}
              {isEmployeeIdTouched && employeeId.length > 0 && employeeId.length < 3 && (
                <IonText className="error-message">Employee ID must be at least 3 characters</IonText>
              )}
            </div>

            <div className="input-group">
              <label className="floating-label">Department</label>
              <div className="input-container">
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  onFocus={() => setIsDepartmentTouched(true)}
                  onBlur={() => setIsDepartmentTouched(true)}
                  className={`styled-input ${isDepartmentTouched && department.length < 2 ? 'input-invalid' : department.length >= 2 ? 'input-valid' : ''}`}
                  placeholder="Enter your department"
                />
              </div>
              {isDepartmentTouched && department.length === 0 && (
                <IonText className="error-message">Department is required</IonText>
              )}
              {isDepartmentTouched && department.length > 0 && department.length < 2 && (
                <IonText className="error-message">Department must be at least 2 characters</IonText>
              )}
            </div>
          </>
        )}

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
              onChange={(e) => {
                setPassword(e.target.value);
                if (isPasswordTouched) {
                  setIsPasswordValid(validatePassword(e.target.value));
                }
              }}
              onFocus={() => setIsPasswordTouched(true)}
              onBlur={() => setIsPasswordValid(validatePassword(password))}
              className={`styled-input ${validatePassword(password) ? 'input-valid' : ''} ${isPasswordTouched && password.length > 0 && !validatePassword(password) ? 'input-invalid' : ''}`}
              placeholder="Create a password"
            />
            <button 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
            >
              <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
            </button>
          </div>
          {isPasswordTouched && password.length > 0 && !validatePassword(password) && (
            <IonText className="error-message">Password must be at least 6 characters and include letters, numbers, and a special character</IonText>
          )}
        </div>

        {/* Confirm Password */}
        <div className={`input-group ${isConfirmPasswordTouched && !isConfirmPasswordValid ? 'input-error' : ''}`}>
          <label className="floating-label">
            <IonIcon icon={lockClosedOutline} className="label-icon" />
            Confirm Password
          </label>
          <div className="input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (isConfirmPasswordTouched) {
                  setIsConfirmPasswordValid(e.target.value === password && validatePassword(e.target.value));
                }
              }}
              onFocus={() => setIsConfirmPasswordTouched(true)}
              onBlur={() => setIsConfirmPasswordValid(confirmPassword === password && validatePassword(confirmPassword))}
              className={`styled-input ${confirmPassword && confirmPassword === password && validatePassword(confirmPassword) ? 'input-valid' : ''} ${isConfirmPasswordTouched && confirmPassword.length > 0 && (!validatePassword(confirmPassword) || confirmPassword !== password) ? 'input-invalid' : ''}`}
              placeholder="Confirm your password"
            />
            <button 
              className="password-toggle" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
            </button>
          </div>
          {isConfirmPasswordTouched && confirmPassword.length > 0 && confirmPassword !== password && (
            <IonText className="error-message">Passwords do not match</IonText>
          )}
          {isConfirmPasswordTouched && confirmPassword.length > 0 && confirmPassword === password && !validatePassword(confirmPassword) && (
            <IonText className="error-message">Password must be at least 6 characters and include letters, numbers, and a special character</IonText>
          )}
        </div>

        {/* Register Button */}
        <button
          className={`register-button ${
            firstName.trim().length >= 2 &&
            lastName.trim().length >= 2 &&
            gender.length > 0 &&
            email && validateEmail(email) && 
            validatePassword(password) && 
            confirmPassword === password && validatePassword(confirmPassword) &&
            (selectedRole === 'student' ? (studentId.length >= 5 && program.length >= 2 && year.length > 0) : (employeeId.length >= 3 && department.length >= 2))
            ? 'button-ready' : ''}`}
          onClick={handleRegister}
          disabled={
            firstName.trim().length < 2 ||
            lastName.trim().length < 2 ||
            gender.length === 0 ||
            !email || !validateEmail(email) || 
            !validatePassword(password) || 
            confirmPassword !== password || !validatePassword(confirmPassword) ||
            (selectedRole === 'student' ? (studentId.length < 5 || program.length < 2 || year.length === 0) : (employeeId.length < 3 || department.length < 2))
          }
        >
          <span>Create Account</span>
          <IonIcon icon={arrowForwardOutline} className="button-icon" />
        </button>
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen className="register-page">
        {registrationStep === 'role' && renderRoleSelection()}
        {registrationStep === 'username' && renderUsernameCheck()}
        {registrationStep === 'form' && renderForm()}
      </IonContent>
    </IonPage>
  );
};

export default Register;