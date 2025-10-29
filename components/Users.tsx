import React, { useState, useEffect } from 'react';
import { User, Outlet, Role } from '../types';

interface UsersProps {
  users: User[];
  outlets: Outlet[];
  onAdd: (user: Omit<User, 'id'>) => Promise<void>;
  onUpdate: (user: User) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const Users: React.FC<UsersProps> = ({ users, outlets, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | Omit<User, 'id'> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentUser({ username: '', password: '', role: 'user', outletId: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!currentUser) return;
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (isEditing) {
      await onUpdate(currentUser as User);
    } else {
      await onAdd(currentUser as Omit<User, 'id'>);
    }
    closeModal();
  };

  const getOutletName = (outletId?: string) => {
    if (!outletId) return 'N/A';
    return outlets.find(o => o.id === outletId)?.name ?? 'Unknown';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Manage Users</h1>
        <button
          onClick={openModalForNew}
          className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
        >
          New User
        </button>
      </div>
      
      <div className="space-y-3">
        {users.length > 0 ? (
          users.map(user => (
            <div key={user.id} className="bg-brand-surface p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold capitalize">{user.username} <span className="text-xs font-normal text-brand-text-secondary">({user.role})</span></p>
                <p className="text-sm text-brand-text-secondary">Outlet: {getOutletName(user.outletId)}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => openModalForEdit(user)} className="text-yellow-400 hover:text-yellow-300">Edit</button>
                <button onClick={() => onDelete(user.id)} className="text-red-500 hover:text-red-400">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-brand-text-secondary text-center">No users found.</p>
        )}
      </div>

      {isModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">{isEditing ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="username" placeholder="Username" value={currentUser.username} onChange={handleChange} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <input type="password" name="password" placeholder="Password" value={currentUser.password} onChange={handleChange} required={!isEditing} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <select name="role" value={currentUser.role} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select name="outletId" value={currentUser.outletId || ''} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option value="">No Outlet</option>
                {outlets.map(outlet => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
              </select>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
