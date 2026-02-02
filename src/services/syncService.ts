import axios from "axios";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

const API_URL = import.meta.env.VITE_API_URL;

console.log("🔧 API_URL:", API_URL);

interface PendingChange {
  id: number | null;
  username: string;
  password: string;
  action: "INSERT" | "UPDATE" | "DELETE";
}

export class SyncService {
  private db: SQLiteDBConnection;
  private lastSyncTimestamp: string | null = null;
  private pendingChanges: PendingChange[] = [];

  constructor(db: SQLiteDBConnection) {
    this.db = db;
  }

  // Track a change made locally
  trackChange(change: PendingChange) {
    this.pendingChanges.push(change);
    console.log("Change tracked:", change);
    console.log("Pending changes:", this.pendingChanges.length);
  }

  // Push local changes to server
  async pushChanges() {
    if (this.pendingChanges.length === 0) {
      console.log("No pending changes to push");
      return;
    }

    try {
      console.log(`Pushing ${this.pendingChanges.length} changes to server...`);

      const { data } = await axios.post(`${API_URL}/sync/push`, {
        users: this.pendingChanges,
      });

      console.log("Push response:", data);

      // Clear pending changes after successful push
      this.pendingChanges = [];
      console.log("Pending changes cleared");
    } catch (error) {
      console.error("Push changes error:", error);
    }
  }

  // Full sync (initial) - PULL from server
  async fullSync() {
    try {
      console.log("Fetching all users from server...");
      const { data } = await axios.get(`${API_URL}/users`);

      const users = data.users || data || [];

      if (!Array.isArray(users)) {
        console.error("Users is not an array:", users);
        return;
      }

      console.log(`Received ${users.length} users from server`);

      // Clear local data
      await this.db.execute("DELETE FROM users");

      // Insert all users
      for (const user of users) {
        await this.db.run(
          "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
          [user.id, user.username, user.password],
        );
      }

      this.lastSyncTimestamp = new Date().toISOString();
      console.log("Full sync completed");
    } catch (error) {
      console.error("Full sync error:", error);
    }
  }

  // Incremental sync - PULL from server
  async pullChanges() {
    try {
      console.log("Pulling changes from server...");
      const { data } = await axios.get(`${API_URL}/users`);

      const users = data.users || data || [];

      if (!Array.isArray(users)) {
        console.error("Users is not an array:", users);
        return;
      }

      console.log(`Received ${users.length} users from server`);

      // Get current local users
      const localResult = await this.db.query("SELECT id FROM users");
      const localIds = new Set(localResult.values?.map((u: any) => u.id) || []);

      // Sync each user
      for (const user of users) {
        if (localIds.has(user.id)) {
          // Update existing
          await this.db.run(
            "UPDATE users SET username = ?, password = ? WHERE id = ?",
            [user.username, user.password, user.id],
          );
        } else {
          // Insert new
          await this.db.run(
            "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
            [user.id, user.username, user.password],
          );
        }
      }

      // Delete users that no longer exist on server
      const serverIds = new Set(users.map((u: any) => u.id));
      for (const localId of localIds) {
        if (!serverIds.has(localId)) {
          await this.db.run("DELETE FROM users WHERE id = ?", [localId]);
        }
      }

      console.log("Pull changes completed");
    } catch (error) {
      console.error("Pull changes error:", error);
    }
  }

  // Full bi-directional sync
  async bidirectionalSync() {
    try {
      // 1. Push local changes first
      await this.pushChanges();

      // 2. Then pull server changes
      await this.pullChanges();

      console.log("Bi-directional sync completed");
    } catch (error) {
      console.error("Bi-directional sync error:", error);
    }
  }

  // Auto-sync
  startAutoSync(intervalMs: number = 30000) {
    setInterval(() => {
      console.log("Auto-sync triggered");
      this.bidirectionalSync();
    }, intervalMs);
  }
}
