import { GameSession, UserProfile } from '../types';

const USERS_KEY = 'sm_users_collection';
const SESSIONS_KEY = 'sm_game_sessions';
const CURRENT_USER_ID_KEY = 'sm_current_user_id';
const CLOUD_DB_KEY = 'sm_mock_cloud_db'; // Simulates the remote server

// --- Mock Cloud Infrastructure ---
// In a real app, this would be a REST API or Firebase connection.
// We simulate network delay and server storage here.

interface CloudPacket {
  user: UserProfile;
  sessions: GameSession[];
  lastUpdated: number;
}

const mockCloudDB = {
  // Simulate hashing an email to get a consistent ID
  generateId: async (email: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  },

  save: async (userId: string, data: CloudPacket): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    const db = JSON.parse(localStorage.getItem(CLOUD_DB_KEY) || '{}');
    db[userId] = data;
    localStorage.setItem(CLOUD_DB_KEY, JSON.stringify(db));
    return true;
  },

  fetch: async (userId: string): Promise<CloudPacket | null> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    const db = JSON.parse(localStorage.getItem(CLOUD_DB_KEY) || '{}');
    return db[userId] || null;
  }
};

export const storageService = {
  // --- User Management ---

  getAllUsers: (): UserProfile[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Local Login
  loginOrRegisterLocal: (username: string): { user: UserProfile, isNew: boolean } => {
    const users = storageService.getAllUsers();
    const normalizedName = username.trim().toLowerCase();
    
    // Look for existing local user
    let user = users.find(u => u.username.toLowerCase() === normalizedName);
    let isNew = false;

    if (!user) {
      user = {
        id: Date.now().toString(),
        username: username.trim(),
        createdAt: Date.now(),
      };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      isNew = true;
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
    return { user, isNew };
  },

  // Cloud Login
  loginOrRegisterCloud: async (username: string, email: string): Promise<{ user: UserProfile, isNew: boolean, restored: boolean }> => {
    const userId = await mockCloudDB.generateId(email);
    
    // 1. Check if we have this user locally first
    const users = storageService.getAllUsers();
    let localUser = users.find(u => u.id === userId);

    // 2. Check Cloud
    const cloudData = await mockCloudDB.fetch(userId);

    let user: UserProfile;
    let isNew = false;
    let restored = false;

    if (cloudData) {
      // User exists in cloud! Restore them locally.
      user = cloudData.user;
      
      // Update local storage with cloud sessions
      const allSessions = storageService.getAllSessions();
      // Filter out old sessions for this user to avoid dupes, keep other users' sessions
      const otherSessions = allSessions.filter(s => s.ownerId !== userId);
      const mergedSessions = [...otherSessions, ...cloudData.sessions];
      
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(mergedSessions));
      restored = true;
    } else {
      // New Cloud User (or at least not in cloud yet)
      if (localUser) {
        // Existed locally, but not in cloud. Just link email.
        user = { ...localUser, email, username }; 
      } else {
        // Brand new
        user = {
          id: userId,
          username: username,
          email: email,
          createdAt: Date.now(),
        };
        isNew = true;
      }
    }

    // Save/Update User Locally
    const otherUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify([...otherUsers, user]));
    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);

    return { user, isNew, restored };
  },

  getCurrentUser: (): UserProfile | null => {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!currentId) return null;

    const users = storageService.getAllUsers();
    return users.find(u => u.id === currentId) || null;
  },

  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  },

  // --- Session Management ---

  saveSessions: (sessions: GameSession[]): void => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getAllSessions: (): GameSession[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getUserSessions: (userId: string): GameSession[] => {
    const allSessions = storageService.getAllSessions();
    return allSessions
      .filter(s => s.ownerId === userId)
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  },

  saveSession: (session: GameSession): void => {
    const sessions = storageService.getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    
    storageService.saveSessions(sessions);
  },

  deleteSession: (sessionId: string): void => {
    const sessions = storageService.getAllSessions().filter(s => s.id !== sessionId);
    storageService.saveSessions(sessions);
  },

  // --- Sync Operations ---

  syncToCloud: async (user: UserProfile): Promise<boolean> => {
    if (!user.email) return false;
    
    // Get latest data
    const sessions = storageService.getUserSessions(user.id);
    const userId = user.id; // Should already be hash of email if logged in via cloud
    
    const packet: CloudPacket = {
      user: { ...user, lastSynced: Date.now() },
      sessions,
      lastUpdated: Date.now()
    };

    try {
      await mockCloudDB.save(userId, packet);
      
      // Update local user "lastSynced"
      const users = storageService.getAllUsers();
      const updatedUser = { ...user, lastSynced: packet.lastUpdated };
      const otherUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem(USERS_KEY, JSON.stringify([...otherUsers, updatedUser]));
      
      return true;
    } catch (e) {
      console.error("Sync failed", e);
      return false;
    }
  },

  // --- Backup & Restore (File Based) ---

  exportData: (): string => {
    const data = {
      users: storageService.getAllUsers(),
      sessions: storageService.getAllSessions(),
      version: 1,
      exportedAt: Date.now()
    };
    return JSON.stringify(data, null, 2);
  },

  generateBackupFile: (username: string): File => {
    const json = storageService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `scoremaster_backup_${username}_${new Date().toISOString().split('T')[0]}.json`;
    return new File([blob], filename, { type: 'application/json' });
  },

  shareBackup: async (username: string): Promise<boolean> => {
    const file = storageService.generateBackupFile(username);
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'ScoreMaster AI Backup',
          text: `Backup for ${username}`,
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.users || !data.sessions) return false;

      const currentUsers = storageService.getAllUsers();
      const newUsers = data.users.filter((u: UserProfile) => !currentUsers.find(cu => cu.id === u.id));
      localStorage.setItem(USERS_KEY, JSON.stringify([...currentUsers, ...newUsers]));

      const currentSessions = storageService.getAllSessions();
      const newSessions = data.sessions.filter((s: GameSession) => !currentSessions.find(cs => cs.id === s.id));
      localStorage.setItem(SESSIONS_KEY, JSON.stringify([...currentSessions, ...newSessions]));
      
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};