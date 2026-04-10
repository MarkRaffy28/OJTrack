import React, { useRef, useState } from "react";
import { IonModal, IonButton, IonInput, IonItem, IonLabel, IonIcon, IonSpinner, IonText } from "@ionic/react";
import { serverOutline, refreshOutline, closeOutline, lockClosedOutline, checkmarkOutline } from "ionicons/icons";
import { switchServer, resetServer } from "@api/api";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

type Step = "password" | "options" | "switch-input";

interface ServerSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServerSwitchModal: React.FC<ServerSwitchModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const reset = () => {
    setStep("password");
    setPassword("");
    setServerUrl("");
    setError("");
    setSuccess("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setError("");
      setStep("options");
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  };

  const handleSwitch = async () => {
    if (!serverUrl.trim()) {
      setError("Please enter a server URL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await switchServer(serverUrl.trim());
      setSuccess(`Switched to ${serverUrl.trim()}`);
      setTimeout(handleClose, 1500);
    } catch {
      setError("Failed to switch server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await resetServer();
      setSuccess("Server reset to default.");
      setTimeout(handleClose, 1500);
    } catch {
      setError("Failed to reset server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} breakpoints={[0, 1]} initialBreakpoint={1}>
      <div style={modalStyles.container}>
        {/* Header */}
        <div style={modalStyles.header}>
          <div style={modalStyles.headerLeft}>
            <div style={modalStyles.iconWrap}>
              <IonIcon icon={serverOutline} style={modalStyles.headerIcon} />
            </div>
            <div>
              <p style={modalStyles.title}>Server Config</p>
              <p style={modalStyles.subtitle}>
                {step === "password" && "Authentication required"}
                {step === "options" && "Choose an action"}
                {step === "switch-input" && "Enter new server URL"}
              </p>
            </div>
          </div>
          <button style={modalStyles.closeBtn} onClick={handleClose}>
            <IonIcon icon={closeOutline} style={{ fontSize: 20 }} />
          </button>
        </div>

        <div style={modalStyles.divider} />

        {/* Body */}
        <div style={modalStyles.body}>

          {/* Step: Password */}
          {step === "password" && (
            <div style={modalStyles.stepWrap}>
              <div style={modalStyles.lockIconWrap}>
                <IonIcon icon={lockClosedOutline} style={modalStyles.lockIcon} />
              </div>
              <IonItem style={modalStyles.inputItem} lines="none">
                <IonLabel position="stacked" style={modalStyles.inputLabel}>Admin Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onIonInput={(e) => setPassword(e.detail.value ?? "")}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  style={modalStyles.input}
                  autofocus
                />
              </IonItem>
              {error && <IonText color="danger"><p style={modalStyles.errorText}>{error}</p></IonText>}
              <IonButton expand="block" style={modalStyles.primaryBtn} onClick={handlePasswordSubmit}>
                Unlock
              </IonButton>
            </div>
          )}

          {/* Step: Options */}
          {step === "options" && (
            <div style={modalStyles.stepWrap}>
              {success ? (
                <div style={modalStyles.successWrap}>
                  <div style={modalStyles.successIcon}>
                    <IonIcon icon={checkmarkOutline} style={{ fontSize: 28, color: "#fff" }} />
                  </div>
                  <p style={modalStyles.successText}>{success}</p>
                </div>
              ) : (
                <>
                  <button
                    style={modalStyles.optionCard}
                    onClick={() => { setError(""); setStep("switch-input"); }}
                  >
                    <div style={{ ...modalStyles.optionIconWrap, background: "#e8f0fe" }}>
                      <IonIcon icon={serverOutline} style={{ fontSize: 22, color: "#3367d6" }} />
                    </div>
                    <div>
                      <p style={modalStyles.optionTitle}>Switch Server</p>
                      <p style={modalStyles.optionDesc}>Connect to a different API endpoint</p>
                    </div>
                  </button>

                  <button
                    style={{ ...modalStyles.optionCard, marginTop: 12 }}
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <div style={{ ...modalStyles.optionIconWrap, background: "#fce8e6" }}>
                      {loading
                        ? <IonSpinner name="crescent" style={{ width: 22, height: 22, color: "#d93025" }} />
                        : <IonIcon icon={refreshOutline} style={{ fontSize: 22, color: "#d93025" }} />
                      }
                    </div>
                    <div>
                      <p style={modalStyles.optionTitle}>Reset to Default</p>
                      <p style={modalStyles.optionDesc}>Restore the original server URL</p>
                    </div>
                  </button>

                  {error && <IonText color="danger"><p style={modalStyles.errorText}>{error}</p></IonText>}
                </>
              )}
            </div>
          )}

          {/* Step: Switch Input */}
          {step === "switch-input" && (
            <div style={modalStyles.stepWrap}>
              {success ? (
                <div style={modalStyles.successWrap}>
                  <div style={modalStyles.successIcon}>
                    <IonIcon icon={checkmarkOutline} style={{ fontSize: 28, color: "#fff" }} />
                  </div>
                  <p style={modalStyles.successText}>{success}</p>
                </div>
              ) : (
                <>
                  <IonItem style={modalStyles.inputItem} lines="none">
                    <IonLabel position="stacked" style={modalStyles.inputLabel}>Server URL</IonLabel>
                    <IonInput
                      type="url"
                      value={serverUrl}
                      placeholder="https://your-server.ngrok.io"
                      onIonInput={(e) => setServerUrl(e.detail.value ?? "")}
                      onKeyDown={(e) => e.key === "Enter" && handleSwitch()}
                      style={modalStyles.input}
                      autofocus
                    />
                  </IonItem>
                  {error && <IonText color="danger"><p style={modalStyles.errorText}>{error}</p></IonText>}
                  <div style={modalStyles.rowBtns}>
                    <IonButton
                      fill="outline"
                      style={modalStyles.secondaryBtn}
                      onClick={() => { setError(""); setStep("options"); }}
                    >
                      Back
                    </IonButton>
                    <IonButton
                      expand="block"
                      style={{ ...modalStyles.primaryBtn, flex: 1 }}
                      onClick={handleSwitch}
                      disabled={loading}
                    >
                      {loading ? <IonSpinner name="crescent" /> : "Switch"}
                    </IonButton>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </IonModal>
  );
};

const modalStyles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#fff",
    borderRadius: "20px 20px 0 0",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 20px 16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "#f1f3f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 20,
    color: "#3367d6",
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#1a1a1a",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#888",
  },
  closeBtn: {
    background: "#f1f3f4",
    border: "none",
    borderRadius: 20,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#555",
  },
  divider: {
    height: 1,
    background: "#f0f0f0",
    margin: "0 20px",
  },
  body: {
    flex: 1,
    padding: "24px 20px",
    overflowY: "auto",
  },
  stepWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  lockIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  lockIcon: {
    fontSize: 26,
    color: "#555",
  },
  inputItem: {
    "--background": "#f7f8fa",
    "--border-radius": "12px",
    "--padding-start": "14px",
    "--padding-end": "14px",
    "--padding-top": "10px",
    "--padding-bottom": "10px",
    marginBottom: 4,
    borderRadius: 12,
  } as React.CSSProperties,
  inputLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    fontSize: 15,
    color: "#1a1a1a",
    marginTop: 4,
  },
  primaryBtn: {
    "--background": "#1a1a1a",
    "--border-radius": "12px",
    "--box-shadow": "none",
    fontWeight: 600,
    fontSize: 15,
    marginTop: 8,
    height: 48,
  } as React.CSSProperties,
  secondaryBtn: {
    "--border-radius": "12px",
    "--color": "#1a1a1a",
    "--border-color": "#e0e0e0",
    fontWeight: 600,
    height: 48,
    minWidth: 90,
  } as React.CSSProperties,
  rowBtns: {
    display: "flex",
    gap: 10,
    marginTop: 8,
    alignItems: "center",
  },
  errorText: {
    margin: "4px 2px 0",
    fontSize: 13,
    color: "#d93025",
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#f7f8fa",
    border: "1.5px solid #f0f0f0",
    borderRadius: 14,
    padding: "14px 16px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s",
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  optionDesc: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#888",
  },
  successWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    gap: 12,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#34a853",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 500,
    color: "#1a1a1a",
    textAlign: "center",
  },
};

// ─── SecretTrigger ────────────────────────────────────────────────────────────

const HOLD_DURATION = 10_000; // 10 seconds

interface SecretTriggerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const SecretTrigger: React.FC<SecretTriggerProps> = ({ children, style }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const PROGRESS_DELAY = 3_000;

  const startHold = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < PROGRESS_DELAY) return;
      setProgress(Math.min((elapsed / HOLD_DURATION) * 100, 100));
    }, 50);
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setProgress(0);
      setModalOpen(true);
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
    <>
      <div
        style={{ position: "relative", ...style }}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        {children}
        {progress > 0 && (
          <div style={triggerStyles.wrapper}>
            <svg width="28" height="28" style={triggerStyles.svg}>
              <circle cx="14" cy="14" r="11" fill="none" stroke="#e0e0e0" strokeWidth="2" />
              <circle
                cx="14"
                cy="14"
                r="11"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 11}`}
                strokeDashoffset={`${2 * Math.PI * 11 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "14px 14px",
                  transition: "stroke-dashoffset 0.05s linear",
                }}
              />
            </svg>
          </div>
        )}
      </div>
      <ServerSwitchModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

const triggerStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "absolute",
    top: -14,
    right: -14,
    pointerEvents: "none",
    zIndex: 999,
  },
  svg: {
    display: "block",
  },
};

export default SecretTrigger;
