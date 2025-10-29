import React, { useState, useEffect } from 'react';
import { Outlet } from '../types';

interface OutletsProps {
  outlets: Outlet[];
  onAdd: (outlet: Omit<Outlet, 'id'>) => Promise<void>;
  onUpdate: (outlet: Outlet) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const Outlets: React.FC<OutletsProps> = ({ outlets, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOutlet, setCurrentOutlet] = useState<Outlet | Omit<Outlet, 'id'> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentOutlet({ name: '', location: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (outlet: Outlet) => {
    setCurrentOutlet(outlet);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentOutlet(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentOutlet) return;
    const { name, value } = e.target;
    setCurrentOutlet({ ...currentOutlet, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet) return;
    if (isEditing) {
      await onUpdate(currentOutlet as Outlet);
    } else {
      await onAdd(currentOutlet as Omit<Outlet, 'id'>);
    }
    closeModal();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Manage Outlets</h1>
        <button
          onClick={openModalForNew}
          className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
        >
          New Outlet
        </button>
      </div>
      
      <div className="space-y-3">
        {outlets.length > 0 ? (
          outlets.map(outlet => (
            <div key={outlet.id} className="bg-brand-surface p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">{outlet.name}</p>
                <p className="text-sm text-brand-text-secondary">{outlet.location}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => openModalForEdit(outlet)} className="text-yellow-400 hover:text-yellow-300">Edit</button>
                <button onClick={() => onDelete(outlet.id)} className="text-red-500 hover:text-red-400">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-brand-text-secondary text-center">No outlets found.</p>
        )}
      </div>

      {isModalOpen && currentOutlet && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">{isEditing ? 'Edit Outlet' : 'Create Outlet'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Outlet Name" value={currentOutlet.name} onChange={handleChange} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <input type="text" name="location" placeholder="Location" value={currentOutlet.location} onChange={handleChange} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
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

export default Outlets;
