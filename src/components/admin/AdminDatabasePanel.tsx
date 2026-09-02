import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  Search, 
  Download, 
  HardDrive,
  Lock,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserProfile, AdminDatabaseStats } from '../../types/dating';

interface AdminDatabasePanelProps {
  currentUser: UserProfile;
  onClose?: () => void;
  onRefreshAllUsers?: () => void;
}

export const AdminDatabasePanel: React.FC<AdminDatabasePanelProps> = ({
  currentUser,
  onClose,
  onRefreshAllUsers,
}) => {
  const [stats, setStats] = useState<AdminDatabaseStats | null>(null);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchDatabaseInfo = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/database-stats', {
          headers: { 'x-admin-email': currentUser.email || '' },
        }),
        fetch('/api/admin/users', {
          headers: { 'x-admin-email': currentUser.email || '' },
        }),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setDbUsers(Array.isArray(u) ? u : []);
      }
    } catch (e) {
      console.error('Failed to load SQL database data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}" from the Cloud SQL database? This action is permanent.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-email': currentUser.email || '' },
      });

      if (res.ok) {
        setFeedbackMsg(`User "${name}" successfully deleted from Cloud SQL database.`);
        fetchDatabaseInfo();
        if (onRefreshAllUsers) onRefreshAllUsers();
      }
    } catch {
      setFeedbackMsg('Failed to delete user.');
    }
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentUser.email || '',
        },
        body: JSON.stringify({ verified: !currentStatus }),
      });

      if (res.ok) {
        setFeedbackMsg(`Verification updated.`);
        fetchDatabaseInfo();
        if (onRefreshAllUsers) onRefreshAllUsers();
      }
    } catch {
      setFeedbackMsg('Failed to update verification.');
    }
  };

  const handleExportSqlFile = () => {
    setIsExporting(true);
    try {
      const sqlLines: string[] = [
        `-- ==========================================================`,
        `-- HUBB DATING APP: CLOUD SQL POSTGRESQL DUMP FILE`,
        `-- Region: europe-west2 (Cloud SQL)`,
        `-- Exported by Admin: ${currentUser.name} (${currentUser.email})`,
        `-- Export Timestamp: ${new Date().toISOString()}`,
        `-- ==========================================================`,
        ``,
        `CREATE TABLE IF NOT EXISTS users (`,
        `  id TEXT PRIMARY KEY,`,
        `  name TEXT NOT NULL,`,
        `  username TEXT NOT NULL UNIQUE,`,
        `  email TEXT NOT NULL UNIQUE,`,
        `  role TEXT NOT NULL DEFAULT 'user',`,
        `  age INTEGER DEFAULT 0,`,
        `  gender TEXT DEFAULT 'Non-binary',`,
        `  pronouns TEXT DEFAULT '',`,
        `  distance_km INTEGER DEFAULT 0,`,
        `  location_city TEXT DEFAULT '',`,
        `  verified BOOLEAN DEFAULT true,`,
        `  photo_description TEXT DEFAULT '',`,
        `  bio TEXT DEFAULT '',`,
        `  height_feet TEXT DEFAULT '',`,
        `  complexion TEXT DEFAULT '',`,
        `  race_ethnicity TEXT DEFAULT '',`,
        `  job_title TEXT DEFAULT '',`,
        `  relationship_goal TEXT DEFAULT '',`,
        `  created_at TIMESTAMP DEFAULT NOW()`,
        `);`,
        ``,
      ];

      dbUsers.forEach((u) => {
        const esc = (val: any) => (val ? `'${String(val).replace(/'/g, "''")}'` : "''");
        sqlLines.push(
          `INSERT INTO users (id, name, username, email, role, age, gender, pronouns, distance_km, location_city, verified, photo_description, bio, height_feet, complexion, race_ethnicity, job_title, relationship_goal) VALUES (` +
            `${esc(u.id)}, ${esc(u.name)}, ${esc(u.username)}, ${esc(u.email)}, ${esc(u.role || 'user')}, ${u.age || 0}, ${esc(u.gender)}, ${esc(u.pronouns)}, ${u.distance_km || 0}, ${esc(u.location_city || u.locationCity)}, ${u.verified ? 'TRUE' : 'FALSE'}, ${esc(u.photo_description || u.photoDescription)}, ${esc(u.bio)}, ${esc(u.height_feet || u.heightFeet)}, ${esc(u.complexion)}, ${esc(u.race_ethnicity || u.raceEthnicity)}, ${esc(u.job_title || u.jobTitle)}, ${esc(u.relationship_goal || u.relationshipGoal)}` +
            `) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();`
        );
      });

      const blob = new Blob([sqlLines.join('\n')], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hubb_database_dump_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackMsg('SQL dump file generated and downloaded.');
    } catch {
      setFeedbackMsg('Error exporting SQL file.');
    } finally {
      setIsExporting(false);
    }
  };

  const filtered = dbUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950/50 to-neutral-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  SQL Database Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Only
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                Persistent SQL database file managed securely on the server with table schemas and SQL export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDatabaseInfo}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportSqlFile}
              disabled={isExporting || dbUsers.length === 0}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .SQL File</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 text-xs font-bold"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Database Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Records</span>
            <span className="text-xl font-black text-white mt-1 block">
              {stats?.totalUsers ?? dbUsers.length}
            </span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Engine / Storage</span>
            <span className="text-xs font-bold text-indigo-300 mt-1.5 truncate block">
              {stats?.databaseEngine || 'SQL File (data/hubb_users.sqlite)'}
            </span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Database Status</span>
            <span className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected & Synchronized
            </span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Storage Mode</span>
            <span className="text-xs font-bold text-amber-300 mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              SQL Table: `users`
            </span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl text-xs text-indigo-200 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-neutral-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}

      {/* Database Search & Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search database records by name, @username, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-neutral-400 font-medium">
            Showing <strong className="text-white">{filtered.length}</strong> of {dbUsers.length} user records in SQL
          </div>
        </div>

        {/* Database Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-800">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-800/80 text-neutral-400 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-700">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Account ID & Handle</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4 text-right">SQL Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    No records found in the SQL users table.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isAdmin = user.role === 'admin' || user.email === 'simonchikondi8@gmail.com';
                  return (
                    <tr key={user.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {user.photos && user.photos[0] ? (
                            <img
                              src={user.photos[0]}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 flex-shrink-0">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white block">{user.name}</span>
                            <span className="text-[10px] text-neutral-400">
                              {user.locationCity || user.location_city || 'No location set'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-neutral-300 block">@{user.username || 'unknown'}</span>
                        <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[120px] block">
                          {user.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">{user.email || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAdmin
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVerify(user.id, !!user.verified)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                            user.verified
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                          title="Click to toggle verified badge"
                        >
                          {user.verified ? <Check className="w-2.5 h-2.5" /> : null}
                          {user.verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={user.id === currentUser.id}
                          className={`p-1.5 rounded-lg text-xs font-bold transition ${
                            user.id === currentUser.id
                              ? 'text-neutral-600 cursor-not-allowed'
                              : 'text-rose-400 hover:bg-rose-950/80 hover:text-rose-200 cursor-pointer'
                          }`}
                          title={user.id === currentUser.id ? "Cannot delete active logged-in admin" : "Delete record from Cloud SQL database"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
