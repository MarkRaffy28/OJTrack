import React, { useState, useRef, useEffect } from "react";
import { IonPage, IonContent, IonText, IonIcon, IonRefresher, IonRefresherContent, RefresherEventDetail } from "@ionic/react";
import { 
  mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline, arrowBackOutline, arrowForwardOutline, 
  schoolOutline, briefcaseOutline, alertCircleOutline, calendarOutline, documentTextOutline, closeOutline, checkmarkOutline, callOutline, locationOutline, idCardOutline, statsChartOutline, 
  maleFemaleOutline, codeSlashOutline, businessOutline, chevronDownCircleOutline
} from "ionicons/icons";
import { useNavigation } from "@/hooks/useNavigation";
import API from "@api/api";
import AvatarCropInput from "@components/AvatarCropInput";
import TermsModal from "@components/TermsModal";
import "@css/Register.css";

type UserRole = "student" | "supervisor" | null;
type RegistrationStep = "role" | "username" | "form" | "photo";

function Register() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("role");

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    window.location.reload();
  };

  // Username
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Common fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [extensionName, setExtensionName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthdate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [address, setAddress] = useState("");

  const [userIdError, setUserIdError] = useState("");
  const [userIdAvailable, setUserIdAvailable] = useState(false);

  // Role-specific
  const [studentId, setStudentId] = useState("");
  const [year, setYear] = useState("");
  const [program, setProgram] = useState("");
  const [major, setMajor] = useState("");
  const [section, setSection] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [offices, setOffices] = useState<{ id: number; name: string }[]>([]);
  const [officeName, setOfficeName] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [position, setPosition] = useState("");

  // Validation
  const [isContactNumberValid, setIsContactNumberValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  // Touched
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] = useState(false);
  const [isFirstNameTouched, setIsFirstNameTouched] = useState(false);
  const [isMiddleNameTouched, setIsMiddleNameTouched] = useState(false);
  const [isLastNameTouched, setIsLastNameTouched] = useState(false);
  const [isExtensionNameTouched, setIsExtensionNameTouched] = useState(false);
  const [isGenderTouched, setIsGenderTouched] = useState(false);
  const [isBirthdayTouched, setIsBirthdayTouched] = useState(false);
  const [isContactNumberTouched, setIsContactNumberTouched] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isAddressTouched, setIsAddressTouched] = useState(false);
  const [isStudentIdTouched, setIsStudentIdTouched] = useState(false);
  const [isProgramTouched, setIsProgramTouched] = useState(false);
  const [isMajorTouched, setIsMajorTouched] = useState(false);
  const [isSectionTouched, setIsSectionTouched] = useState(false);
  const [isYearTouched, setIsYearTouched] = useState(false);
  const [isEmployeeIdTouched, setIsEmployeeIdTouched] = useState(false);
  const [isOfficeIdTouched, setIsOfficeIdTouched] = useState(false);
  const [isPositionTouched, setIsPositionTouched] = useState(false);

  // Stop Typing
  const [isEmailStopTyping, setIsEmailStopTyping] = useState(false);
  const [isStudentIdStopTyping, setIsStudentIdStopTyping] = useState(false);
  const [isEmployeeIdStopTyping, setIsEmployeeIdStopTyping] = useState(false);

  // Terms & Conditions
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Loading/redirect
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");

  // ── Photo state ───────────────────────────────────────────────────────────
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState("");
  
  //  ── Form data ───────────────────────────────────────────────────────
  const formDataRef = useRef<Record<string, any> | null>(null);
  
  //  ── Form helpers ─────────────────────────────────────────────────────
  const maxBirthdayDate = new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split("T")[0];
  const minBirthdayDate = new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0];

  const validateContactNumber = (v: string) => /^09\d{9}$/.test(v);
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePassword = (v: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v);

 const handleUsernameCheck = async () => {
    setUsernameError("");
    setIsCheckingUsername(true);

    try {
      const response = await API.get(`/users/exists/username/${username}`);
      if (response.data.available) {
        setUsernameAvailable(true);
      } else {
        setUsernameError("Username is already taken");
      }
    } catch (error: any) {
      console.log("Error: ", error);
      
      if (error.response) {
        setUsernameError("Username is already taken");
      } else {
        setUsernameError(error.message);
      }
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const checkEmail = async () => {
    setEmailError("");

    if (isEmailValid) {
      try {
        const response = await API.get(`/users/exists/email/${email}`);
        if (response.data.available) {
          setEmailAvailable(true);
          setEmailError("");
        } else {
          setEmailAvailable(false);
          setEmailError("Email is already taken");
        }
      } catch (error: any) {
        console.log("Error: ", error);
        if (error.response) {
          setEmailError("Email is already taken");
        } else {
          setEmailError(error.message);
        }
        setEmailAvailable(false);
      }
    }
  }

  const checkUserId = async () => {
    setUserIdError("");

    const userId = selectedRole === "student" ? studentId : employeeId;

    if (studentId.length > 5 || employeeId.length > 3) {
      try {
        const response = await API.get(`/users/exists/userId/${userId}`);
        if (response.data.available) {
          setUserIdAvailable(true);
          setUserIdError("");
        } else {
          setUserIdAvailable(false);
          setUserIdError("User ID is already taken");
        }
      } catch (error: any) {
        console.log("Error: ", error);
        setUserIdAvailable(false);
        if (error.response) {
          setUserIdError("User ID is already taken");
        } else {
          setUserIdError(error.message);
        }
      }
    }
  }

  const formReady =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    gender.length > 0 &&
    birthDate.length > 0 &&
    email &&
    validateEmail(email) &&
    emailError.length === 0 &&
    validatePassword(password) &&
    confirmPassword === password &&
    validatePassword(confirmPassword) &&
    (selectedRole === "student"
      ? studentId.length >= 5 && 
        userIdError.length === 0 &&
        year.length > 0 && 
        program.length > 0 && 
        major.length > 0 &&
        section.length > 0
      : employeeId.length >= 3 && 
        userIdError.length === 0 &&
        officeId.length >= 1 &&
        position.length >= 1);


  useEffect(() => {
    async function fetchOffices() {
      try {
        const res = await API.get("/offices");
        setOffices(res.data);
      } catch (err: any) {
        console.error(err);
      }
    }
    fetchOffices();
  }, [])

  const clearAllFields = () => {
    setSelectedRole(null);
    setRegistrationStep("role");
    setUsername("");
    setUsernameAvailable(false);
    setUsernameError("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setExtensionName("");
    setGender("");
    setBirthdate("");
    setContactNumber("");
    setEmail("");
    setEmailError("");
    setEmailAvailable(false);
    setAddress("");
    setStudentId("");
    setYear("");
    setProgram("");
    setMajor("");
    setSection("");
    setEmployeeId("");
    setOfficeId("");
    setOfficeName("");
    setPosition("");
    setIsContactNumberValid(true);
    setIsEmailValid(true);
    setIsPasswordValid(true);
    setIsConfirmPasswordValid(true);
    setIsPasswordTouched(false);
    setIsConfirmPasswordTouched(false);
    setIsFirstNameTouched(false);
    setIsMiddleNameTouched(false);
    setIsLastNameTouched(false);
    setIsExtensionNameTouched(false);
    setIsGenderTouched(false);
    setIsBirthdayTouched(false);
    setIsContactNumberTouched(false);
    setIsEmailTouched(false);
    setIsAddressTouched(false);
    setIsStudentIdTouched(false);
    setIsProgramTouched(false);
    setIsMajorTouched(false);
    setIsSectionTouched(false);
    setIsYearTouched(false);
    setIsEmployeeIdTouched(false);
    setIsOfficeIdTouched(false);
    setIsPositionTouched(false);
    setCroppedPhoto(null);
    formDataRef.current = null;
    setRegistrationError("");
  };

  // HANDLERS
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep("username");
  };

  const handleBackFromUsername = () => {
    clearAllFields();
  };

  const { navigate } = useNavigation({
    onBack: () => {
      if (showTermsModal) setShowTermsModal(false);
      else if (registrationStep === "photo") setRegistrationStep("form");
      else if (registrationStep === "form") setRegistrationStep("username");
      else if (registrationStep === "username") handleBackFromUsername();
      else navigate("/login", "back");
    },
    exitOnBack: false,
  });

  const handleBack = () => {
    if (registrationStep === "photo") setRegistrationStep("form");
    else if (registrationStep === "form") setRegistrationStep("username");
    else if (registrationStep === "username") handleBackFromUsername();
    else navigate("/login", "back");
  };

  // ── Handle form submit ────────────────────────────────────────────────────
  const onRegisterSubmit = () => {
    if (!formReady) return;

    if (selectedRole === "student") {
      formDataRef.current = {
        username,
        password,
        firstName,
        middleName,
        lastName,
        extensionName,
        gender,
        birthDate,
        contactNumber,
        email,
        address,
        studentId,
        year,
        program,
        major,
        section,
      };
    } else if (selectedRole === "supervisor") {
      formDataRef.current = {
        username,
        password,
        firstName,
        middleName,
        lastName,
        extensionName,
        gender,
        birthDate,
        contactNumber,
        email,
        address,
        employeeId,
        officeId,
        position,
      };
    }

    setRegistrationStep("photo");
  };

  // ── After photo step → open Terms ─────────────────────────────────────────
  const handleProfilePictureSubmit = () => {
    if (formDataRef.current && croppedPhoto) {
      formDataRef.current.profilePicture = croppedPhoto;
    }
    setShowTermsModal(true);
  };


  const handleDeclineTerms = () => {
    formDataRef.current = null;
    setShowTermsModal(false);
    setRedirectMessage("Returning to registration...");
    setIsRedirecting(true);
    setTimeout(() => {
      setIsRedirecting(false);
      setRedirectMessage("");
    }, 1400);
  };

  const handleRegister = async () => {
    if (!formDataRef.current) return;
    setRegistrationError('');
    setRedirectMessage("Creating your account...");
    setIsRedirecting(true);

    try {
      const response = await API.post(`/auth/register/${selectedRole}`, formDataRef.current);

      if (response.data.newUserId) {
        clearAllFields();
        setRedirectMessage("Account created! Redirecting to login...");
        setTimeout(() => {
          setIsRedirecting(false);
          setShowTermsModal(false);
          navigate("/login");
        }, 2200);
      } else {
        setIsRedirecting(false);
        setRegistrationError("Registration failed. Please try again later.")
      }
    } catch (error: any) {
      console.log("Error: ", error);
      setIsRedirecting(false);
      if (error.response) {
        setRegistrationError("Registration failed. Please try again later.");
      } else {
        setRegistrationError(error.message);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const renderRoleSelection = () => (
    <div className="role-selection-container">
      <div className="role-header">
        <div className="logo-wrapper">
          <div className="logo-circle">
            <img src="/logo.svg" alt="OJTrack Logo" style={{ width: 100, height: 100 }} />
          </div>
        </div>
        <IonText className="header-text">
          <h1 className="title">Join OJTrack</h1>
          <p className="subtitle">Select your role to get started</p>
        </IonText>
      </div>
      <div className="role-cards">
        <button
          className={`role-card ${selectedRole === "student" ? "role-selected" : ""}`}
          onClick={() => handleRoleSelect("student")}
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
          className={`role-card ${selectedRole === "supervisor" ? "role-selected" : ""}`}
          onClick={() => handleRoleSelect("supervisor")}
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
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/login", "back")}>
            Log In
          </span>
        </IonText>
      </div>
    </div>
  );

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

      <form 
        className="register-form"
        onSubmit={(e) => { e.preventDefault(); handleUsernameCheck(); }}
      >
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
                setUsernameAvailable(false);
              }}
              className={`styled-input ${username && !usernameError && usernameAvailable ? 'input-valid' : ''} ${usernameError ? 'input-invalid' : ''}`}
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
            <li className={usernameAvailable ? 'tip-done' : ''}>Be unique (not taken)</li>
          </ul>
        </div>

        <button
          type="submit"
          className={`register-button ${
            username.length >= 3 && !usernameError && usernameAvailable ? 'button-ready' : ''
          }`}
          disabled={usernameAvailable || username.length < 3 || isCheckingUsername}
        >
          {isCheckingUsername ? (
            <span>Checking...</span>
          ) : usernameAvailable ? (
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
      </form>
    </div>
  );

  const renderForm = () => {
    return (
      <div className="register-container">
        <button className="back-button" onClick={handleBack}>
          <IonIcon icon={arrowBackOutline} />
        </button>
        <div className="register-header">
          <IonText className="header-text">
            <h1 className="title">
              {selectedRole === "student"
                ? "Student Registration"
                : "Supervisor Registration"}
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
              setRegistrationStep("username");
              setUsernameAvailable(false);
            }}
          >
            Change
          </button>
        </div>

        <form 
          className="register-form"
          onSubmit={(e) => { e.preventDefault(); onRegisterSubmit(); }}
        >
          {/* Password */}
          <div className={`input-group ${isPasswordTouched && !isPasswordValid ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={lockClosedOutline} className="label-icon" />
              Password
            </label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                maxLength={100}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isPasswordTouched)
                    setIsPasswordValid(validatePassword(e.target.value));
                }}
                onFocus={() => setIsPasswordTouched(true)}
                onBlur={() => setIsPasswordValid(validatePassword(password))}
                className={`styled-input ${validatePassword(password) ? "input-valid" : ""} ${isPasswordTouched && password.length > 0 && !validatePassword(password) ? "input-invalid" : ""}`}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
              </button>
            </div>
            {isPasswordTouched &&
              password.length > 0 &&
              !validatePassword(password) && (
                <IonText className="error-message">
                  Min 6 chars, include letters, numbers &amp; a special
                  character
                </IonText>
              )}
          </div>

          {/* Confirm Password */}
          <div className={`input-group ${isConfirmPasswordTouched && !isConfirmPasswordValid ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={lockClosedOutline} className="label-icon" />
              Confirm Password
            </label>
            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (isConfirmPasswordTouched)
                    setIsConfirmPasswordValid(
                      e.target.value === password &&
                        validatePassword(e.target.value),
                    );
                }}
                onFocus={() => setIsConfirmPasswordTouched(true)}
                onBlur={() =>
                  setIsConfirmPasswordValid(
                    confirmPassword === password &&
                      validatePassword(confirmPassword),
                  )
                }
                className={`styled-input ${confirmPassword && confirmPassword === password && validatePassword(confirmPassword) ? "input-valid" : ""} ${isConfirmPasswordTouched && confirmPassword.length > 0 && (!validatePassword(confirmPassword) || confirmPassword !== password) ? "input-invalid" : ""}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IonIcon
                  icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                />
              </button>
            </div>
            {isConfirmPasswordTouched &&
              confirmPassword.length > 0 &&
              confirmPassword !== password && (
                <IonText className="error-message">
                  Passwords do not match
                </IonText>
              )}
          </div>
          
          {/* First Name */}
          <div className={`input-group ${isFirstNameTouched && firstName.trim().length < 2 ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={personOutline} className="label-icon" />
              First Name
            </label>
            <div className="input-container">
              <input
                type="text"
                value={firstName}
                maxLength={100}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setIsFirstNameTouched(true)}
                className={`styled-input ${isFirstNameTouched && firstName.trim().length < 2 ? "input-invalid" : firstName.trim().length >= 2 ? "input-valid" : ""}`}
                placeholder="Enter your first name"
              />
              {isFirstNameTouched && firstName.trim().length < 2 && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
              {isFirstNameTouched && firstName.length > 2 && (
                <IonIcon
                    icon={checkmarkCircleOutline}
                    className="validation-icon success"
                  />
              )}
            </div>

            {isFirstNameTouched && firstName.trim().length === 0 && (
              <IonText className="error-message">
                First name is required
              </IonText>
            )}
            {isFirstNameTouched &&
              firstName.trim().length > 0 &&
              firstName.trim().length < 2 && (
                <IonText className="error-message">
                  At least 2 characters
                </IonText>
              )}
          </div>

          {/* Middle Name */}
          <div className="input-group">
            <label className="floating-label">
              <IonIcon icon={personOutline} className="label-icon" />
              Middle Name{" "}
              <span className="optional-label">
                (optional)
              </span>
            </label>
            <div className="input-container">
              <input
                type="text"
                value={middleName}
                maxLength={50}
                onChange={(e) => setMiddleName(e.target.value)}
                onBlur={(e) => setIsMiddleNameTouched(true)}
                className={`styled-input ${isMiddleNameTouched && middleName ? "input-valid" : ""}`}
                placeholder="Middle name"
              />
              {isMiddleNameTouched && middleName && (
                <IonIcon
                    icon={checkmarkCircleOutline}
                    className="validation-icon success"
                  />
              )}
            </div>
          </div>

          {/* Last Name */}
          <div className={`input-group ${isLastNameTouched && lastName.trim().length < 2 ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={personOutline} className="label-icon" />
              Last Name
            </label>
            <div className="input-container">
              <input
                type="text"
                value={lastName}
                maxLength={50}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setIsLastNameTouched(true)}
                className={`styled-input ${isLastNameTouched && lastName.trim().length < 2 ? "input-invalid" : lastName.trim().length >= 2 ? "input-valid" : ""}`}
                placeholder="Enter your last name"
              />
              {isLastNameTouched && lastName.trim().length < 2 && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
              {isLastNameTouched && lastName.length > 2 && (
                <IonIcon
                    icon={checkmarkCircleOutline}
                    className="validation-icon success"
                  />
              )}
            </div>
            {isLastNameTouched && lastName.trim().length === 0 && (
              <IonText className="error-message">Last name is required</IonText>
            )}
            {isLastNameTouched &&
              lastName.trim().length > 0 &&
              lastName.trim().length < 2 && (
                <IonText className="error-message">
                  At least 2 characters
                </IonText>
              )}
          </div>

          {/* Extension */}
          <div className="input-group">
            <label className="floating-label">
              <IonIcon icon={personOutline} className="label-icon" />
              Extension Name
              <span className="optional-label">
                (optional)
              </span>
            </label>
            <div className="input-container">
              <input
                type="text"
                value={extensionName}
                maxLength={10}
                onChange={(e) => setExtensionName(e.target.value)}
                onBlur={(e) => setIsExtensionNameTouched(true)}
                className={`styled-input ${isExtensionNameTouched && extensionName ? "input-valid" : ""}`}
                placeholder="e.g. Jr., III"
              />
              {isExtensionNameTouched && extensionName && (
                <IonIcon
                    icon={checkmarkCircleOutline}
                    className="validation-icon success"
                  />
              )}

            </div>
          </div>

          {/* Gender */}
          <div className={`input-group ${isGenderTouched && gender.length === 0 ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={maleFemaleOutline} className="label-icon" />
              Gender
            </label>
            <div className="input-container">
              <select
                value={gender}
                onChange={(e) => {setGender(e.target.value)}}
                onBlur={() => setIsGenderTouched(true)}
                className={`styled-input ${isGenderTouched && gender.length === 0 ? "input-invalid" : gender.length > 0 ? "input-valid" : ""}`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {isGenderTouched && gender.length == 0 && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
              {isGenderTouched && gender.length != 0 && (
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="validation-icon success"
                />
              )}
            </div>
            {isGenderTouched && gender.length === 0 && (
              <IonText className="error-message">
                Please select your gender
              </IonText>
            )}
          </div>

          {/* birthDate */}
          <div className={`input-group ${isBirthdayTouched && !birthDate ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={calendarOutline} className="label-icon" />
              birthDate
            </label>
            <div className="input-container">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {setBirthdate(e.target.value)}}
                onBlur={() => setIsBirthdayTouched(true)}
                max={maxBirthdayDate}
                min={minBirthdayDate}
                className={`styled-input ${isBirthdayTouched && !birthDate ? "input-invalid" : birthDate ? "input-valid" : ""}`}
              />
              {birthDate && birthDate > minBirthdayDate && birthDate < maxBirthdayDate && (
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="validation-icon success"
                />
              )}
              {birthDate && (birthDate < minBirthdayDate || birthDate > maxBirthdayDate) && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
              {isBirthdayTouched && !birthDate && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
            </div>
            {isBirthdayTouched && !birthDate && (
              <IonText className="error-message">
                Please select your birthDate
              </IonText>
            )}
            {isBirthdayTouched && birthDate && (birthDate < minBirthdayDate || birthDate > maxBirthdayDate) && (
              <IonText className="error-message">
                Student must be 17-80 years old
              </IonText>
            )}
          </div>

          {/* Contact Number */}
          <div className={`input-group ${isContactNumberTouched && !isContactNumberValid ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={callOutline} className="label-icon" />
              Contact Number
            </label>
            <div className="input-container">
              <input
                type="phone"
                value={contactNumber}
                maxLength={11}
                onChange={(e) => {setContactNumber(e.target.value)}}
                onFocus={() => setIsContactNumberTouched(true)}
                onBlur={() => setIsContactNumberValid(validateContactNumber(contactNumber))}
                className={`styled-input ${contactNumber && isContactNumberValid ? "input-valid" : ""} ${isContactNumberTouched && !isContactNumberValid ? "input-invalid" : ""}`}
                placeholder="e.g. 09123456789"
              />
              {contactNumber && isContactNumberValid && (
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="validation-icon success"
                />
              )}
              {isContactNumberTouched && !isContactNumberValid && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
            </div>
            {isContactNumberTouched && !isContactNumberValid && (
              <IonText className="error-message">
                Please enter a valid contact number
              </IonText>
            )}
          </div>

          {/* Email */}
          <div className={`input-group ${isEmailTouched && !isEmailValid ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={mailOutline} className="label-icon" />
              Email
            </label>
            <div className="input-container">
              <input
                type="email"
                value={email}
                maxLength={100}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailTouched(true)}
                onBlur={() => {
                  setIsEmailValid(validateEmail(email))
                  setIsEmailStopTyping(true)
                  checkEmail()
                }}
                className={`styled-input ${email && isEmailValid && emailAvailable ? "input-valid" : ""} ${isEmailTouched && isEmailValid && isEmailStopTyping && !emailAvailable ? "input-invalid" : ""}`}
                placeholder="Enter your email"
              />
              {email && isEmailValid && emailAvailable && (
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="validation-icon success"
                />
              )}
              {isEmailTouched && isEmailStopTyping && (!isEmailValid || !emailAvailable || email.length === 0) && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
            </div>
            {isEmailTouched && email.length === 0 && (
              <IonText className="error-message">
                Email is required
              </IonText>
            )}
            {isEmailTouched && !isEmailValid && email.length > 0 && (
              <IonText className="error-message">
                Please enter a valid email address
              </IonText>
            )}
            {isEmailTouched && isEmailStopTyping && !emailAvailable && email.length > 0 && (
              <IonText className="error-message">
                Email already taken
              </IonText>
            )}
          </div>

          {/* Address */}
          <div className={`input-group ${isLastNameTouched && lastName.trim().length < 2 ? "input-error" : ""}`}>
            <label className="floating-label">
              <IonIcon icon={locationOutline} className="label-icon" />
              Address
            </label>
            <div className="input-container">
              <textarea
                value={address}
                maxLength={255}
                style={{ resize: 'none' }}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => setIsAddressTouched(true)}
                className={`no-scroll styled-input ${isAddressTouched && address.trim().length < 20 ? "input-invalid" : address.trim().length >= 20 ? "input-valid" : ""}`}
                placeholder="Barangay, Town, Province/City"
              />
              {isAddressTouched && address.trim().length < 20 && (
                <IonIcon
                  icon={alertCircleOutline}
                  className="validation-icon error"
                />
              )}
              {isAddressTouched && address.length > 20 && (
                <IonIcon
                    icon={checkmarkCircleOutline}
                    className="validation-icon success"
                  />
              )}
            </div>
            {isAddressTouched && address.trim().length === 0 && (
              <IonText className="error-message">
                Address is required
              </IonText>
            )}
            {isAddressTouched &&
              address.trim().length > 0 &&
              address.trim().length < 20 && (
                <IonText className="error-message">
                  At least 20 characters
                </IonText>
              )}
          </div>

          {/* Student fields */}
          {selectedRole === "student" && (
            <>
              {/* Student Id */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={idCardOutline} className="label-icon" />
                  Student ID
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onFocus={() => setIsStudentIdTouched(true)}
                    onBlur={() => {
                      setIsStudentIdTouched(true)
                      setIsStudentIdStopTyping(true)
                      checkUserId()
                    }}
                    className={`styled-input ${isStudentIdTouched && isStudentIdStopTyping && (studentId.length < 5 || !userIdAvailable) ? "input-invalid" : studentId.length >= 5 && userIdAvailable ? "input-valid" : ""}`}
                    placeholder="Enter your student ID"
                  />
                  {studentId && studentId.length > 5 && userIdAvailable && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                  {isStudentIdTouched && isStudentIdStopTyping && (studentId.length < 5 || !userIdAvailable) && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                </div>
                {isStudentIdTouched && studentId.length === 0 && (
                  <IonText className="error-message">
                    Student ID is required
                  </IonText>
                )}
                {isStudentIdTouched &&
                  studentId.length > 0 &&
                  studentId.length < 5 && (
                    <IonText className="error-message">
                      At least 5 characters
                    </IonText>
                  )}
                {isStudentIdTouched && isStudentIdStopTyping && studentId.length > 5 && !userIdAvailable && (
                  <IonText className="error-message">
                    Student ID already exists
                  </IonText>
                )}
              </div>

              {/* Year */}
              <div className={`input-group ${isYearTouched && year.length === 0 ? "input-error" : ""}`}>
                <label className="floating-label">
                  <IonIcon icon={statsChartOutline} className="label-icon" />
                  Year Level
                </label>
                <div className="input-container">
                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      setIsYearTouched(true);
                    }}
                    onBlur={() => setIsYearTouched(true)}
                    className={`styled-input ${isYearTouched && year.length === 0 ? "input-invalid" : year.length > 0 ? "input-valid" : ""}`}
                  >
                    <option value="">Select year level</option>
                    <option value="2">2nd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {isYearTouched && year.length == 0 && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                  {isYearTouched && year.length != 0 && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                </div>
                {isYearTouched && year.length === 0 && (
                  <IonText className="error-message">
                    Please select your year level
                  </IonText>
                )}
              </div>
              
              {/* Program */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={schoolOutline} className="label-icon" />
                  Program/Course
                </label>
                <div className="input-container">
                  <select
                    value={program}
                    onChange={(e) => {
                      setProgram(e.target.value);
                      setIsProgramTouched(true);
                    }}
                    onBlur={() => setIsProgramTouched(true)}
                    className={`styled-input ${isProgramTouched && program.length === 0 ? "input-invalid" : program.length > 0 ? "input-valid" : ""}`}
                  >
                    <option value="">Select program</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSIS">BSIS</option>
                  </select>
                  {isProgramTouched && program.length == 0 && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                  {isProgramTouched && program.length != 0 && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                </div>
                {isProgramTouched && program.length === 0 && (
                  <IonText className="error-message">
                    Program is required
                  </IonText>
                )}
              </div>

              {/* Major */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={codeSlashOutline} className="label-icon" />
                  Major
                </label>
                <div className="input-container">
                  <select
                    value={major}
                    onChange={(e) => {
                      setMajor(e.target.value);
                      setIsMajorTouched(true);
                    }}
                    onBlur={() => setIsMajorTouched(true)}
                    className={`styled-input ${isMajorTouched && major.length === 0 ? "input-invalid" : major.length > 0 ? "input-valid" : ""}`}
                  >
                    <option value="">Select Major</option>
                    <option value="Web. and Mobile Application Developer">Web. and Mobile Application Developer</option>
                    <option value="Cybersecurity and Networking">Cybersecurity and Networking</option>
                  </select>
                  {isMajorTouched && major.length == 0 && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                  {isMajorTouched && major.length != 0 && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                </div>
                {isMajorTouched && major.length === 0 && (
                  <IonText className="error-message">
                    Major is required
                  </IonText>
                )}
              </div>

              {/* Section */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={businessOutline} className="label-icon" />
                  Section
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    value={section}
                    maxLength={50}
                    onChange={(e) => setSection(e.target.value)}
                    onFocus={() => setIsSectionTouched(true)}
                    onBlur={() => setIsSectionTouched(true)}
                    className={`styled-input ${isSectionTouched && section.length === 0 ? "input-invalid" : section.length >= 1 ? "input-valid" : ""}`}
                    placeholder="Enter your section (e.g. A, B)"
                  />
                  {section && section.length >= 1 && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                  {isSectionTouched && section.length === 0 && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                </div>
                {isSectionTouched && section.length === 0 && (
                  <IonText className="error-message">Section is required</IonText>
                )}
              </div>
            </>
          )}

          {/* Supervisor fields */}
          {selectedRole === "supervisor" && (
            <>
              {/* Employee ID */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={idCardOutline} className="label-icon" />
                  Employee ID
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    onFocus={() => setIsEmployeeIdTouched(true)}
                    onBlur={() => {
                      setIsEmployeeIdTouched(true)
                      setIsEmailStopTyping(true)
                      checkUserId()
                    }}
                    className={`styled-input ${isEmployeeIdTouched && isEmailStopTyping && (employeeId.length < 3 || !userIdAvailable) ? "input-invalid" : employeeId.length >= 3 && isEmailStopTyping && userIdAvailable? "input-valid" : ""}`}
                    placeholder="Enter your employee ID"
                  />
                  {employeeId && employeeId.length > 3 && userIdAvailable && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                  {isEmployeeIdTouched && isEmailStopTyping && (employeeId.length < 3 || !userIdAvailable) && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                </div>
                {isEmployeeIdTouched && employeeId.length > 1 &&  employeeId.length === 0 && (
                  <IonText className="error-message">
                    Employee ID is required
                  </IonText>
                )}
                {isEmployeeIdTouched && employeeId.length < 3 && (
                  <IonText className="error-message">
                    At least 3 characters
                  </IonText>
                )}
                {isEmployeeIdTouched && isEmailStopTyping && employeeId.length > 3 && !userIdAvailable && (
                  <IonText className="error-message">
                    Employee ID already taken
                  </IonText>
                )}
              </div>

              {/* Office */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={businessOutline} className="label-icon" />
                  Office
                </label>
                <div className="input-container">
                  <select
                    value={officeId}
                    onChange={(e) => {
                      setOfficeId(e.target.value);
                      setOfficeName(e.target.options[e.target.selectedIndex].text);
                    }}
                    onFocus={() => setIsOfficeIdTouched(true)}
                    onBlur={() => setIsOfficeIdTouched(true)}
                    className={`styled-input ${isOfficeIdTouched && officeId.length === 0 ? "input-invalid" : officeId.length >= 1 ? "input-valid" : ""}`}
                  >
                    <option value="">Select Office</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </select>
                  {officeId && officeId.length > 0 && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                  {isOfficeIdTouched && officeId.length === 0 && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                </div>
                {isOfficeIdTouched && officeId.length === 0 && (
                  <IonText className="error-message">Office is required</IonText>
                )}
              </div>

              {/* Position */}
              <div className="input-group">
                <label className="floating-label">
                  <IonIcon icon={briefcaseOutline} className="label-icon" />
                  Position
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    value={position}
                    maxLength={255}
                    onChange={(e) => setPosition(e.target.value)}
                    onFocus={() => setIsPositionTouched(true)}
                    onBlur={() => setIsPositionTouched(true)}
                    className={`styled-input ${isPositionTouched && position.length === 0 ? "input-invalid" : position.length >= 1 ? "input-valid" : ""}`}
                    placeholder="Enter your position"
                  />
                  {position && position.length >= 1 && (
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      className="validation-icon success"
                    />
                  )}
                  {isPositionTouched && position.length === 0 && (
                    <IonIcon
                      icon={alertCircleOutline}
                      className="validation-icon error"
                    />
                  )}
                </div>
                {isPositionTouched && position.length === 0 && (
                  <IonText className="error-message">Position is required</IonText>
                )}
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`register-button ${formReady && (birthDate >= minBirthdayDate && birthDate <= maxBirthdayDate) ? "button-ready" : ""}`}
            disabled={!formReady || (birthDate < minBirthdayDate || birthDate > maxBirthdayDate)}
          >
            <span>Continue</span>
            <IonIcon icon={arrowForwardOutline} className="button-icon" />
          </button>
        </form>
      </div>
    );
  };

  // ── PHOTO UPLOAD STEP ─────────────────────────────────────────────────────
  const renderPhotoStep = () => (
    <div className="photo-step-container">
      <button className="back-button" onClick={handleBack}>
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div className="register-header" style={{ marginBottom: 8 }}>
        <IonText className="header-text">
          <h1 className="title" style={{ color: "black" }}>Profile Photo</h1>
          <p className="subtitle" style={{ color: "black" }}>
            Upload a photo so others can recognise you
          </p>
        </IonText>
      </div>

      {/* Step indicator */}
      <div className="photo-step-indicator">
        <div className="psi-step done">
          <span>1</span>
          <small>Details</small>
        </div>
        <div className="psi-line done" />
        <div className="psi-step active">
          <span>2</span>
          <small>Photo</small>
        </div>
        <div className="psi-line" />
        <div className="psi-step">
          <span>3</span>
          <small>Terms</small>
        </div>
      </div>

      <div className="photo-upload-card">
        <AvatarCropInput 
          value={croppedPhoto} 
          onChange={(newVal) => setCroppedPhoto(newVal)} 
        />
        
        {croppedPhoto && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p className="photo-preview-name">
              {firstName} {lastName}
            </p>
            <p className="photo-preview-role">
              {selectedRole === "student" ? `${program} · ${year}` : officeName ?? ""}
            </p>
          </div>
        )}

        {registrationError && (
          <IonText className="error-message" style={{ marginTop: 12, display: 'block', textAlign: 'center' }}>
            {registrationError}
          </IonText>
        )}
      </div>

      {/* CTA buttons */}
      <div className="photo-cta-row">
        <button
          className="register-button button-ready photo-proceed-btn"
          onClick={handleProfilePictureSubmit}
        >
          <span>
            {croppedPhoto ? "Continue with this photo" : "Skip & Continue"}
          </span>
          <IonIcon icon={arrowForwardOutline} className="button-icon" />
        </button>
      </div>
    </div>
  );

  // ── Terms Modal ───────────────────────────────────────────────────────────
  // Handled by TermsModal component now

  // ── Loading overlay ───────────────────────────────────────────────────────
  const renderLoadingOverlay = () => (
    <div className="loading-overlay">
      <div className="lo-spinner-wrap">
        <div className="lo-spinner-outer" />
        <div className="lo-spinner-inner">
          <img src="/logo.svg" alt="OJTrack" style={{ width: 34, height: 34 }} />
        </div>
      </div>
      <div className="lo-text-wrap">
        <div className="lo-message">{redirectMessage}</div>
        <div className="lo-dots">
          {[0, 1, 2].map((i) => (
            <div key={i} className="lo-dot" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen forceOverscroll={false} className={`register-page ${showTermsModal ? "no-scroll" : ""}`}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>
        {registrationStep === "role" && renderRoleSelection()}
        {registrationStep === "username" && renderUsernameCheck()}
        {registrationStep === "form" && renderForm()}
        {registrationStep === "photo" && renderPhotoStep()}
        {showTermsModal && (
          <TermsModal 
            mode="register"
            onClose={handleDeclineTerms}
            onAccept={handleRegister}
          />
        )}
        {isRedirecting && renderLoadingOverlay()}
      </IonContent>
    </IonPage>
  );
}

export default Register;

