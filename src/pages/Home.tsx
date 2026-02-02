import { useSQLite } from "../hooks/useSQLite";
import { SyncService } from "../services/syncService";
import { useEffect, useState } from "react";
import { 
  IonButton, 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel,
  IonSpinner,
  IonInput
} from "@ionic/react";

const Home: React.FC = () => {
  const { db, initialized } = useSQLite("mydb");
  const [users, setUsers] = useState<any[]>([]);
  const [syncService, setSyncService] = useState<SyncService | null>(null);
  const [syncing, setSyncing] = useState(false);
  
  // Form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const setupDatabase = async () => {
      if (!db || !initialized) return;

      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL
        );
      `);

      const sync = new SyncService(db);
      setSyncService(sync);
      
      setSyncing(true);
      await sync.fullSync();
      setSyncing(false);
      
      sync.startAutoSync(30000); // Auto-sync every 30s
      
      await loadUsers();
    };

    setupDatabase();
  }, [db, initialized]);

  const loadUsers = async () => {
    if (!db) return;
    try {
      const result = await db.query("SELECT * FROM users");
      setUsers(result.values || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const addUser = async () => {
    if (!db || !syncService || !username || !password) return;
    
    try {
      // Insert locally
      const result = await db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password]
      );
      
      console.log('User added locally with ID:', result.changes?.lastId);
      
      // Track the change for syncing
      syncService.trackChange({
        id: result.changes?.lastId || null,
        username,
        password,
        action: 'INSERT'
      });
      
      // Clear form
      setUsername("");
      setPassword("");
      
      // Reload users
      await loadUsers();
      
      // Immediately sync to server
      await syncService.pushChanges();
      
      console.log('User synced to server');
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (id: number) => {
    if (!db || !syncService) return;
    
    try {
      await db.run('DELETE FROM users WHERE id = ?', [id]);
      
      // Track the change
      syncService.trackChange({
        id,
        username: '',
        password: '',
        action: 'DELETE'
      });
      
      await loadUsers();
      await syncService.pushChanges();
      
      console.log('User deleted and synced');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const manualSync = async () => {
    if (!syncService) return;
    
    setSyncing(true);
    try {
      await syncService.bidirectionalSync();
      await loadUsers();
      console.log('Manual sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>OJTrack - Mobile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Sync Button */}
        <IonButton 
          expand="block" 
          onClick={manualSync} 
          disabled={!initialized || syncing}
        >
          {syncing ? <><IonSpinner name="crescent" /> Syncing...</> : 'Sync Now'}
        </IonButton>

        {/* Add User Form */}
        <h2>Add User (Mobile)</h2>
        <IonItem>
          <IonLabel position="floating">Username</IonLabel>
          <IonInput
            value={username}
            onIonInput={(e) => setUsername(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        <IonButton 
          expand="block" 
          onClick={addUser}
          disabled={!initialized || !username || !password}
        >
          Add User from Mobile
        </IonButton>

        {/* Users List */}
        <h2>All Users: {users.length}</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <IonList>
            {users.map((user) => (
              <IonItem key={user.id}>
                <IonLabel>
                  <h3>{user.username}</h3>
                  <p>ID: {user.id}</p>
                </IonLabel>
                <IonButton 
                  color="danger" 
                  onClick={() => deleteUser(user.id)}
                  slot="end"
                >
                  Delete
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;