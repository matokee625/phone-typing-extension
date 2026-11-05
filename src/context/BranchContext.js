'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { branches } from '@/data/branches';

const BranchContext = createContext();

const BRANCH_STORAGE_KEY = 'quickmart_selected_branch';
const FULFILLMENT_STORAGE_KEY = 'quickmart_fulfillment_mode';

export function BranchProvider({ children }) {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: 'Grace Wanjiku',
    phone: '0712345678',
    email: 'grace.wanjiku@gmail.com',
    street: 'Rose Avenue, Off Argwings Kodhek, Kilimani',
    building: 'Silver Oak Apartments, Apt 4B',
    city: 'Nairobi',
    county: 'Nairobi',
    deliveryNotes: 'Please ring bell 4B or call on arrival',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBranchId = localStorage.getItem(BRANCH_STORAGE_KEY);
        if (savedBranchId) {
          const found = branches.find((b) => b.id === savedBranchId);
          if (found) setSelectedBranch(found);
        }
        const savedMode = localStorage.getItem(FULFILLMENT_STORAGE_KEY);
        if (savedMode) setFulfillmentMode(savedMode);
      } catch {
        // Ignore
      }
    }
  }, []);

  const changeBranch = (branchId) => {
    const found = branches.find((b) => b.id === branchId);
    if (found) {
      setSelectedBranch(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem(BRANCH_STORAGE_KEY, branchId);
      }
    }
  };

  const changeFulfillmentMode = (mode) => {
    setFulfillmentMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FULFILLMENT_STORAGE_KEY, mode);
    }
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranch,
        changeBranch,
        fulfillmentMode,
        changeFulfillmentMode,
        deliveryAddress,
        setDeliveryAddress,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}

