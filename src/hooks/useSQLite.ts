import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

let isWebInitialized = false;

export const useSQLite = (dbName: string = 'mydb') => {
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        // Initialize web polyfill once
        if (Capacitor.getPlatform() === 'web' && !isWebInitialized) {
          jeepSqlite(window);
          const sqlite = new SQLiteConnection(CapacitorSQLite);
          await sqlite.initWebStore();
          isWebInitialized = true;
        }

        // Create connection
        const sqlite = new SQLiteConnection(CapacitorSQLite);
        const connection = await sqlite.createConnection(
          dbName,
          false,
          'no-encryption',
          1,
          false
        );
        
        await connection.open();
        setDb(connection);
        setInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, [dbName]);

  return { db, initialized };
};