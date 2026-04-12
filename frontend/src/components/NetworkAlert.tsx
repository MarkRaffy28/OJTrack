import React, { useEffect, useState } from 'react';
import { IonModal, IonContent, IonIcon, IonText, IonButton } from '@ionic/react';
import { warning, close } from 'ionicons/icons';
import { useNetwork } from '@context/networkContext';
import '@css/NetworkAlert.css';

const NetworkAlert: React.FC = () => {
    const { isConnected } = useNetwork();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setShowModal(!isConnected);
    }, [isConnected]);

    const handleRetry = () => {
        setShowModal(!isConnected);
    };

    const handleDismiss = () => {
        setShowModal(false);
    };

    return (
        <IonModal
            isOpen={showModal}
            className="network-alert-modal"
            backdropDismiss={true}
            onDidDismiss={handleDismiss}
        >
            <div className="alert-wrapper network-alert-modal-inner">
                <button className="network-alert-close-btn" onClick={handleDismiss}>
                    <IonIcon icon={close} />
                </button>

                <div className="alert-icon-container">
                    <IonIcon icon={warning} className="alert-icon" color="warning" />
                </div>
                <IonText className="ion-text-center">
                    <h2>No Connection</h2>
                    <p>Your device is currently offline. Please check your internet settings to continue using OJTrack.</p>
                </IonText>
                <IonButton expand="block" className="network-retry-btn" onClick={handleRetry}>
                    TRY AGAIN
                </IonButton>
            </div>
        </IonModal>
    );
};

export default NetworkAlert;