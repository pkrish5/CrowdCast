"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift, FaTimes, FaPlus, FaEdit, FaTrash, FaCheck, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

type Incentive = {
  id: string;
  title: string;
  description: string;
  points: number;
  active: boolean;
};

type IncentiveManagementProps = {
  onClose: () => void;
};

const IncentiveManagement = ({ onClose }: IncentiveManagementProps) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [editingIncentive, setEditingIncentive] = useState<Incentive | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 100,
    active: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchIncentives = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const businessDoc = await getDoc(doc(db, 'businesses', currentUser.uid));
        
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          setIncentives(data.incentives || []);
        }
      } catch (error) {
        console.error('Error fetching incentives:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncentives();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleToggleActive = async (incentiveId: string, currentActive: boolean) => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      
      // Update Firestore
      await updateDoc(doc(db, 'businesses', currentUser.uid), {
        incentives: incentives.map(incentive => 
          incentive.id === incentiveId 
            ? { ...incentive, active: !currentActive }
            : incentive
        )
      });
      
      // Update local state
      setIncentives(prev => prev.map(incentive => 
        incentive.id === incentiveId 
          ? { ...incentive, active: !currentActive }
          : incentive
      ));
    } catch (error) {
      console.error('Error toggling incentive:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditIncentive = (incentive: Incentive) => {
    setEditingIncentive(incentive);
    setFormData({
      title: incentive.title,
      description: incentive.description,
      points: incentive.points,
      active: incentive.active
    });
    setIsEditing(true);
  };

  const handleDeleteIncentive = async (incentiveId: string) => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      
      // Update Firestore
      await updateDoc(doc(db, 'businesses', currentUser.uid), {
        incentives: incentives.filter(incentive => incentive.id !== incentiveId)
      });
      
      // Update local state
      setIncentives(prev => prev.filter(incentive => incentive.id !== incentiveId));
    } catch (error) {
      console.error('Error deleting incentive:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setSaving(true);
      
      if (isEditing && editingIncentive) {
        // Update existing incentive
        const updatedIncentives = incentives.map(incentive => 
          incentive.id === editingIncentive.id 
            ? { 
                ...incentive, 
                title: formData.title,
                description: formData.description,
                points: formData.points,
                active: formData.active
              }
            : incentive
        );
        
        // Update Firestore
        await updateDoc(doc(db, 'businesses', currentUser.uid), {
          incentives: updatedIncentives
        });
        
        // Update local state
        setIncentives(updatedIncentives);
      } else {
        // Create new incentive
        const newIncentive: Incentive = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          points: formData.points,
          active: formData.active
        };
        
        // Update Firestore
        await updateDoc(doc(db, 'businesses', currentUser.uid), {
          incentives: [...incentives, newIncentive]
        });
        
        // Update local state
        setIncentives(prev => [...prev, newIncentive]);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        points: 100,
        active: true
      });
      setIsEditing(false);
      setEditingIncentive(null);
    } catch (error) {
      console.error('Error saving incentive:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      points: 100,
      active: true
    });
    setIsEditing(false);
    setEditingIncentive(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-300 bg-clip-text text-transparent">
            Manage Incentives
          </h2>
          <p className="text-white/70 mt-1">
            Create and manage customer incentives
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-black/30 border border-white/10 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">
          {isEditing ? 'Edit Incentive' : 'Create New Incentive'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              placeholder="e.g., 10% Off Next Visit"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              placeholder="Describe the incentive..."
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Points Required</label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <label className="text-white/70 text-sm mr-2">Active</label>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="sr-only"
              />
              <div className={`block w-12 h-6 rounded-full ${formData.active ? 'bg-cyan-500' : 'bg-white/20'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.active ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Incentive' : 'Create Incentive'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Incentives List */}
      <div className="bg-black/30 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Your Incentives</h3>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : incentives.length > 0 ? (
          <div className="space-y-4">
            {incentives.map(incentive => (
              <div key={incentive.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{incentive.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{incentive.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    incentive.active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {incentive.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaGift className="text-cyan-400 mr-1" />
                    <span className="text-white">{incentive.points} points</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditIncentive(incentive)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleToggleActive(incentive.id, incentive.active)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {incentive.active ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button 
                      onClick={() => handleDeleteIncentive(incentive.id)}
                      className="text-white/70 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-white/50">
            <FaGift className="mx-auto text-3xl mb-2" />
            <p>No incentives created yet</p>
            <p className="text-sm mt-1">Create an incentive to start rewarding your customers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncentiveManagement; 