'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: Date;
}

export function UsersList({ users: initialUsers, currentUserRole }: { users: User[]; currentUserRole: string }) {
  const [users, setUsers] = useState(initialUsers);
  const isSuperAdmin = currentUserRole === 'SuperAdmin';

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (res.ok) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleBanToggle = async (userId: string, banned: boolean) => {
    const res = await fetch('/api/admin/users/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, banned }),
    });

    if (res.ok) {
      setUsers(users.map(u => u.id === userId ? { ...u, banned } : u));
    }
  };

  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left p-4 font-medium">Name</th>
            <th className="text-left p-4 font-medium">Email</th>
            <th className="text-left p-4 font-medium">User ID</th>
            <th className="text-left p-4 font-medium">Role</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Joined</th>
            {isSuperAdmin && <th className="text-left p-4 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="p-4">{u.name}</td>
              <td className="p-4 text-muted-foreground">{u.email}</td>
              <td className="p-4 font-mono text-xs text-muted-foreground">{u.id}</td>
              <td className="p-4">
                {isSuperAdmin ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-2 py-1 rounded-md border text-xs"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    u.role === 'Admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {u.role}
                  </span>
                )}
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  u.banned ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {u.banned ? 'Banned' : 'Active'}
                </span>
              </td>
              <td className="p-4 text-muted-foreground text-sm">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              {isSuperAdmin && (
                <td className="p-4">
                  <button
                    onClick={() => handleBanToggle(u.id, !u.banned)}
                    className={`px-3 py-1 rounded-md text-xs ${
                      u.banned ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {u.banned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
