import React, { useState, useRef, useCallback, useEffect } from "react";
import { IonPage, IonContent, IonText, IonIcon, IonLoading } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { mailOutline, lockClosedOutline, personOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline, arrowBackOutline, 
  arrowForwardOutline, schoolOutline, briefcaseOutline, alertCircleOutline, calendarOutline, documentTextOutline, closeOutline, 
  checkmarkOutline, cameraOutline, imageOutline, trashOutline, callOutline, locationOutline, idCardOutline, statsChartOutline, 
  maleFemaleOutline, 
  codeSlashOutline,
  businessOutline} from "ionicons/icons";
import "../css/Register.css";
import API from "../api/api";

type UserRole = "student" | "supervisor" | null;
type RegistrationStep = "role" | "username" | "form" | "photo";

// ─── Crop state ──────────────────────────────────────────────────────────────
interface CropState {
  x: number;
  y: number;
  scale: number;
}

function Register() {
  const history = useHistory();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("role");

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

  const [employeeId, setEmployeeId] = useState("");
  const [offices, setOffices] = useState<{ id: number; name: string }[]>([]);
  const [officeName, setOfficeName] = useState("");
  const [officeId, setOfficeId] = useState("");

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
  const [isYearTouched, setIsYearTouched] = useState(false);
  const [isEmployeeIdTouched, setIsEmployeeIdTouched] = useState(false);
  const [isOfficeIdTouched, setIsOfficeIdTouched] = useState(false);

  // Stop Typing
  const [isEmailStopTyping, setIsEmailStopTyping] = useState(false);
  const [isStudentIdStopTyping, setIsStudentIdStopTyping] = useState(false);
  const [isEmployeeIdStopTyping, setIsEmployeeIdStopTyping] = useState(false);

  // Terms & Conditions
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsScrolledToEnd, setTermsScrolledToEnd] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Loading/redirect
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");

  // ── Photo + Crop state ────────────────────────────────────────────────────
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null); 
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropState, setCropState] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; cx: number; cy: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);

  const CROP_SIZE = 280;

  const [registrationError, setRegistrationError] = useState("");
  
  //  ── Form data ───────────────────────────────────────────────────────
  const formDataRef = useRef<Record<string, any> | null>(null);
  
  //  ── Form helpers ─────────────────────────────────────────────────────
  const maxBirthdayDate = new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split("T")[0];
  const minBirthdayDate = new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0];

  const validateContactNumber = (v: string) => /^09\d{9}$/.test(v);
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePassword = (v: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v);

  const checkEmail = async () => {
    setEmailError("");

    if (isEmailValid) {
      try {
        const response = await API.post("/users/exists/email", { email: email });
        if (response.data.available) {
          setEmailAvailable(true);
          setEmailError("");
        } else {
          setEmailAvailable(false);
          setEmailError("Email is already taken");
        }
      } catch (error) {
        console.log("Error: ", error);
        setEmailError("Email is already taken");
        setEmailAvailable(false);
      }
    }
  }

  const checkUserId = async () => {
    setUserIdError("");

    const userId = selectedRole === "student" ? studentId : employeeId;

    if (studentId.length > 5 || employeeId.length > 3) {
      try {
        const response = await API.post("/users/exists/user_id", { userId: userId });
        if (response.data.available) {
          setUserIdAvailable(true);
          setUserIdError("");
        } else {
          setUserIdAvailable(false);
          setUserIdError("User ID is already taken");
        }
      } catch (error) {
        console.log("Error: ", error);
        setUserIdAvailable(false);
        setUserIdError("User ID is already taken");
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
        major.length > 0
      : employeeId.length >= 3 && 
        userIdError.length === 0 &&
        officeId.length >= 1);


  useEffect(() => {
    async function fetchOffices() {
      try {
        const res = await API.post("/offices/list");
        setOffices(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchOffices();
  }, [])

  // HANDLERS
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep("username");
  };

  const handleBackFromUsername = () => {
    setSelectedRole(null);
    setRegistrationStep("role");
    setUsername("");
    setUsernameError("");
    setUsernameAvailable(false);
  };

  const handleBack = () => {
    if (registrationStep === "photo") setRegistrationStep("form");
    else if (registrationStep === "form") setRegistrationStep("username");
    else if (registrationStep === "username") handleBackFromUsername();
    else history.push("/login");
  };

  const handleUsernameCheck = async () => {
    setUsernameError("");
    setIsCheckingUsername(true);

    try {
      const response = await API.post("/users/exists/username", { username: username });
      if (response.data.available) {
        setUsernameAvailable(true);
      } else {
        setUsernameError("Username is already taken");
      }
    } catch (error) {
      console.log("Error: ", error);
      setUsernameError("Username is already taken");
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
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
      };
    }

    setRegistrationStep("photo");
  };

  // ── Photo upload handler ──────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target?.result as string);
      setCropState({ x: 0, y: 0, scale: 1 });
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Crop drag handlers ────────────────────────────────────────────────────
  const onDragStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      dragStart.current = {
        mx: clientX,
        my: clientY,
        cx: cropState.x,
        cy: cropState.y,
      };
    },
    [cropState],
  );

  const onDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !dragStart.current) return;
      const dx = clientX - dragStart.current.mx;
      const dy = clientY - dragStart.current.my;
      setCropState((prev) => ({
        ...prev,
        x: dragStart.current!.cx + dx,
        y: dragStart.current!.cy + dy,
      }));
    },
    [isDragging],
  );

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // ── Apply crop — draw onto canvas, export as dataURL ─────────────────────
  const applyCrop = useCallback(() => {
    const img = cropImgRef.current;
    if (!img || !rawImageSrc) return;

    const canvas = document.createElement("canvas");
    const OUTPUT = 400;
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d")!;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();

    // The crop window is CROP_SIZE px wide on screen.
    // Image is rendered at its natural size * scale, offset by (x, y).
    const displayRatio = (CROP_SIZE * cropState.scale) / img.naturalWidth;
    // Pixel coords of the top-left of the crop circle in the image coordinate space
    const srcX = -cropState.x / displayRatio;
    const srcY = -cropState.y / displayRatio;
    const srcW = CROP_SIZE / displayRatio;
    const srcH = CROP_SIZE / displayRatio;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);

    const result = canvas.toDataURL("image/jpeg", 0.92);
    setCroppedPhoto(result);
    setIsCropping(false);
    setRawImageSrc(null);
  }, [rawImageSrc, cropState]);

  // ── After photo step → open Terms ─────────────────────────────────────────
  const handleProfilePictureSubmit = () => {
    if (formDataRef.current && croppedPhoto) {
      formDataRef.current.profilePhoto = croppedPhoto;
    }
    setTermsScrolledToEnd(false);
    setTermsAccepted(false);
    setShowTermsModal(true);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40)
      setTermsScrolledToEnd(true);
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
    if (!termsAccepted || !formDataRef.current) return;

    try {
      const response = await API.post(`/auth/register/${selectedRole}`, formDataRef.current);

      if (response.data.newUserId) {
        formDataRef.current = null;
        setRedirectMessage("Account created! Redirecting to login...");
        setIsRedirecting(true);
        setTimeout(() => history.push("/login"), 2200);
      } else {
        setRegistrationError("Registration failed. Please try again later.")
      }
    } catch (error) {
      console.log("Error: ", error);
      setRegistrationError("Registration failed. Please try again later.");
    } finally {
      setShowTermsModal(false);
      setTimeout(() => {
        setRegistrationStep("role");
        setRedirectMessage("");
        setIsRedirecting(false);
      }, 3000)
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
          <span className="login-link" onClick={() => history.push("/login")}>
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
              <span
                style={{
                  fontWeight: "normal",
                  opacity: 0.6,
                  fontSize: "0.85em",
                }}
              >
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
              <span
                style={{
                  fontWeight: "normal",
                  opacity: 0.6,
                  fontSize: "0.85em",
                }}
              >
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
                    className={`styled-input ${isProgramTouched && program.length === 0 ? "input-invalid" : year.length > 0 ? "input-valid" : ""}`}
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
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`register-button ${formReady ? "button-ready" : ""}`}
            disabled={!formReady}
          >
            <span>Continue</span>
            <IonIcon icon={arrowForwardOutline} className="button-icon" />
          </button>
        </form>
      </div>
    );
  };

  // ── PHOTO UPLOAD + CROP STEP ──────────────────────────────────────────────
  const renderPhotoStep = () => (
    <div className="photo-step-container">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button className="back-button" onClick={handleBack}>
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div className="register-header" style={{ marginBottom: 8 }}>
        <IonText className="header-text">
          <h1 className="title" style={{ color: "black" }}>
            Profile Photo
          </h1>
          <p className="subtitle" style={{ color: "black" }}>
            Upload a photo so others can recognise you
          </p>
          <br />
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

      {/* Preview / upload zone */}
      <div className="photo-upload-card">
        {croppedPhoto ? (
          /* Already has a cropped photo — show preview */
          <div className="photo-preview-wrap">
            <div className="photo-preview-ring">
              <img
                src={croppedPhoto}
                alt="Profile"
                className="photo-preview-img"
              />
              <div className="photo-preview-check">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
            </div>
            <p className="photo-preview-name">
              {firstName} {lastName}
            </p>
            <p className="photo-preview-role">
              {selectedRole === "student" ? `${program} · ${year}` : officeName ?? ""}
            </p>
            <div className="photo-action-row">
              <button
                className="photo-action-btn secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <IonIcon icon={imageOutline} /> Change Photo
              </button>
              <button
                className="photo-action-btn danger"
                onClick={() => setCroppedPhoto(null)}
              >
                <IonIcon icon={trashOutline} /> Remove
              </button>
            </div>
            {registrationError && (
              <IonText className="error-message">
                {registrationError}
              </IonText>
            )}
          </div>
        ) : (
          /* No photo yet */
          <div
            className="photo-empty-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="photo-empty-circle">
              <div className="photo-empty-initials">
                {firstName?.[0]}
                {lastName?.[0]}
              </div>
              <div className="photo-empty-overlay">
                <IonIcon icon={cameraOutline} />
                <span>Upload</span>
              </div>
            </div>
            <p className="photo-empty-label">Tap to upload a profile photo</p>
            <p className="photo-empty-sub">JPG or PNG · Max 10 MB</p>
          </div>
        )}
      </div>

      {/* CTA buttons */}
      <div className="photo-cta-row">
        <button
          className={`register-button button-ready photo-proceed-btn`}
          onClick={handleProfilePictureSubmit}
        >
          <span>
            {croppedPhoto ? "Continue with this photo" : "Skip & Continue"}
          </span>
          <IonIcon icon={arrowForwardOutline} className="button-icon" />
        </button>
      </div>

      {/* ── Cropper overlay ── */}
      {isCropping && rawImageSrc && (
        <div className="cropper-overlay">
          <div className="cropper-modal">
            <div className="cropper-header">
              <div className="cropper-title-group">
                <div className="cropper-icon-badge">
                  <IonIcon icon={cameraOutline} />
                </div>
                <div>
                  <div className="cropper-title">Adjust your photo</div>
                  <div className="cropper-subtitle">
                    Drag to reposition · Pinch or scroll to zoom
                  </div>
                </div>
              </div>
              <button
                className="cropper-close"
                onClick={() => {
                  setIsCropping(false);
                  setRawImageSrc(null);
                }}
              >
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            {/* Crop viewport */}
            <div className="cropper-viewport-wrap">
              <div
                className="cropper-viewport"
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
                onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
                onMouseMove={(e) => {
                  if (isDragging) onDragMove(e.clientX, e.clientY);
                }}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  onDragStart(t.clientX, t.clientY);
                }}
                onTouchMove={(e) => {
                  const t = e.touches[0];
                  onDragMove(t.clientX, t.clientY);
                }}
                onTouchEnd={onDragEnd}
                onWheel={(e) => {
                  e.preventDefault();
                  setCropState((prev) => ({
                    ...prev,
                    scale: Math.max(
                      0.5,
                      Math.min(4, prev.scale - e.deltaY * 0.001),
                    ),
                  }));
                }}
              >
                {/* The actual image being dragged */}
                <img
                  ref={cropImgRef}
                  src={rawImageSrc}
                  alt="crop"
                  draggable={false}
                  style={{
                    position: "absolute",
                    transformOrigin: "center center",
                    transform: `translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale})`,
                    maxWidth: "none",
                    userSelect: "none",
                    pointerEvents: "none",
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                    objectFit: "cover",
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                />
                {/* Circular mask overlay */}
                <div
                  className="cropper-mask"
                  style={{ width: CROP_SIZE, height: CROP_SIZE }}
                />
                {/* Circle border */}
                <div
                  className="cropper-circle-border"
                  style={{ width: CROP_SIZE, height: CROP_SIZE }}
                />
              </div>
            </div>

            {/* Zoom slider */}
            <div className="cropper-zoom-row">
              <span className="cropper-zoom-label">–</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.01"
                value={cropState.scale}
                onChange={(e) =>
                  setCropState((prev) => ({
                    ...prev,
                    scale: parseFloat(e.target.value),
                  }))
                }
                className="cropper-zoom-slider"
              />
              <span className="cropper-zoom-label">+</span>
            </div>

            <div className="cropper-actions">
              <button
                className="cropper-btn secondary"
                onClick={() => {
                  setIsCropping(false);
                  setRawImageSrc(null);
                }}
              >
                Cancel
              </button>
              <button className="cropper-btn primary" onClick={applyCrop}>
                <IonIcon icon={checkmarkOutline} /> Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Terms Modal ───────────────────────────────────────────────────────────
  const renderTermsModal = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDeclineTerms();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 0",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "#F3E6F8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IonIcon
                icon={documentTextOutline}
                style={{ fontSize: 18, color: "#5f0076" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                Terms &amp; Conditions
              </div>
              <div style={{ fontSize: 11.5, color: "#9CA3AF" }}>
                Read carefully before creating your account
              </div>
            </div>
          </div>
          <button
            onClick={handleDeclineTerms}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              color: "#6B7280",
              cursor: "pointer",
              display: "flex",
              padding: 4,
            }}
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>
        <div
          style={{
            margin: "12px 20px 0",
            padding: "8px 14px",
            borderRadius: 8,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            transition: "all 0.3s",
            background: termsScrolledToEnd
              ? "rgba(34,197,94,0.08)"
              : "rgba(95,0,118,0.07)",
            border: `1px solid ${termsScrolledToEnd ? "rgba(34,197,94,0.25)" : "rgba(95,0,118,0.2)"}`,
            color: termsScrolledToEnd ? "#16A34A" : "#5f0076",
          }}
        >
          <IonIcon
            icon={
              termsScrolledToEnd ? checkmarkCircleOutline : arrowForwardOutline
            }
            style={{
              fontSize: 14,
              transform: termsScrolledToEnd ? "none" : "rotate(90deg)",
              transition: "transform 0.3s",
            }}
          />
          {termsScrolledToEnd
            ? "You've finished reading — you may now accept below"
            : "Scroll to the bottom to unlock the agreement checkbox"}
        </div>
        <div
          style={{ overflowY: "auto", flex: 1, padding: "14px 20px 8px" }}
          onScroll={handleTermsScroll}
        >
          {[
            [
              "1. Acceptance of Terms",
              "By creating an account on OJTrack, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you may not use our service.",
            ],
            [
              "2. User Accounts",
              "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration.\n\nYou must not share your login credentials with any third party. OJTrack reserves the right to suspend or terminate accounts that violate these terms.",
            ],
            [
              "3. Use of the Platform",
              "OJTrack is intended solely for on-the-job training (OJT) management. Prohibited activities include submitting false attendance records, impersonating another user, or attempting unauthorised access.",
            ],
            [
              "4. Privacy & Data Collection",
              "We collect personal information such as your name, email, student/employee ID, and profile photo for the purpose of operating OJTrack. Your data will not be sold to third parties.\n\nBy registering, you consent to data collection per our Privacy Policy.",
            ],
            [
              "5. Student Responsibilities",
              "Students must accurately log their OJT hours and submit timely reports. Falsification of records may result in permanent account suspension.",
            ],
            [
              "6. Supervisor Responsibilities",
              "Supervisors must review and validate student submissions honestly and fairly.",
            ],
            [
              "7. Intellectual Property",
              "All content and features of OJTrack are the exclusive property of OJTrack and protected by applicable intellectual property laws.",
            ],
            [
              "8. Limitation of Liability",
              "OJTrack shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
            ],
            [
              "9. Modifications to Terms",
              "OJTrack may modify these Terms at any time. Continued use after changes constitutes acceptance of the revised terms.",
            ],
            [
              "10. Contact",
              "Questions? Contact the OJTrack system administrator at your institution.",
            ],
          ].map(([title, body], i, arr) => (
            <div
              key={i}
              style={{
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5f0076",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginBottom: 7,
                }}
              >
                {title}
              </div>
              {(body as string).split("\n\n").map((para, j) => (
                <p
                  key={j}
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    lineHeight: 1.75,
                    marginBottom:
                      j < (body as string).split("\n\n").length - 1 ? 8 : 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            padding: "12px 20px 24px",
            borderTop: "1px solid #F3F4F6",
            flexShrink: 0,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 11,
              marginBottom: 14,
              cursor: termsScrolledToEnd ? "pointer" : "default",
              opacity: termsScrolledToEnd ? 1 : 0.38,
              pointerEvents: termsScrolledToEnd ? "auto" : "none",
              transition: "opacity 0.25s",
            }}
          >
            <div
              onClick={() => termsScrolledToEnd && setTermsAccepted((v) => !v)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                flexShrink: 0,
                marginTop: 1,
                border: `2px solid ${termsAccepted ? "#5f0076" : "#D1D5DB"}`,
                background: termsAccepted ? "#5f0076" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {termsAccepted && (
                <IonIcon
                  icon={checkmarkOutline}
                  style={{ color: "#fff", fontSize: 13 }}
                />
              )}
            </div>
            <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
              I have read and agree to the{" "}
              <strong style={{ color: "#111827" }}>Terms and Conditions</strong>
            </span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleDeclineTerms}
              style={{
                flex: 1,
                padding: "12px",
                background: "#F9FAFB",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                color: "#6B7280",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Decline
            </button>
            <button
              onClick={handleRegister}
              disabled={!termsAccepted}
              style={{
                flex: 2,
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                background: termsAccepted ? "#5f0076" : "#E5E7EB",
                border: "none",
                borderRadius: 10,
                color: termsAccepted ? "#fff" : "#9CA3AF",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                cursor: termsAccepted ? "pointer" : "default",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <IonIcon icon={checkmarkCircleOutline} /> I Agree &amp; Create
              Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Loading overlay ───────────────────────────────────────────────────────
  const renderLoadingOverlay = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn   { from{opacity:0}to{opacity:1} }
        @keyframes spin     { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.75} }
        @keyframes dotBounce{ 0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1} }
      `}</style>
      <div
        style={{
          position: "relative",
          width: 88,
          height: 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "4px solid #F3E6F8",
            borderTop: "4px solid #5f0076",
            animation: "spin 0.85s linear infinite",
          }}
        />
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#5f0076,#7a1896)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 24px rgba(95,0,118,0.4)",
            animation: "pulse 1.8s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: 26 }}>📊</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 10,
          }}
        >
          {redirectMessage}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#5f0076",
                animation: `dotBounce 1.3s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen className="register-page">
        {registrationStep === "role" && renderRoleSelection()}
        {registrationStep === "username" && renderUsernameCheck()}
        {registrationStep === "form" && renderForm()}
        {registrationStep === "photo" && renderPhotoStep()}
        {showTermsModal && renderTermsModal()}
        {isRedirecting && renderLoadingOverlay()}
      </IonContent>
    </IonPage>
  );
}

export default Register;
