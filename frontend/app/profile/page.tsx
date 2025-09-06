'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  addresses?: Address[];
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  county?: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    street: '',
    city: '',
    state: '',
    county: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchAddresses();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setEditData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          avatar: data.data.avatar || ''
        });
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        router.push('/auth/login');
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      setError('An error occurred while fetching profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/address', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAddresses(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/address/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        setSuccess('Address deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('An error occurred while deleting address');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        // Refresh addresses to get updated default status
        await fetchAddresses();
        setSuccess('Default address updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('An error occurred while setting default address');
    }
  };

  const handleCreateAddress = async () => {
    try {
      // Basic validation
      if (!newAddressData.street || !newAddressData.city || !newAddressData.state || !newAddressData.pincode) {
        setError('Please fill in all required fields (street, city, state, pincode)');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3000/api/address', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddressData),
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses([...addresses, data.data]);
        setShowAddressForm(false);
        setNewAddressData({
          street: '',
          city: '',
          state: '',
          county: '',
          pincode: '',
          country: 'India',
          isDefault: false
        });
        setSuccess('Address created successfully!');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh addresses to ensure proper ordering
        await fetchAddresses();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create address');
      }
    } catch (error) {
      console.error('Error creating address:', error);
      setError('An error occurred while creating address');
    }
  };

  const handleCancelAddAddress = () => {
    setShowAddressForm(false);
    setNewAddressData({
      street: '',
      city: '',
      state: '',
      county: '',
      pincode: '',
      country: 'India',
      isDefault: false
    });
    setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20 group">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-xl font-semibold text-white">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div 
                      onClick={() => setShowAvatarModal(true)}
                      className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phone && (
                    <p className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {user.phone}
                    </p>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Statistics */}
        

        {/* Alert Messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Profile Information */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder="Enter phone number (e.g., +1234567890)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <p className="text-gray-900">{user.role}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Addresses</h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showAddressForm ? 'Cancel' : 'Add Address'}
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium text-gray-900 mb-4">Add New Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={newAddressData.street}
                      onChange={(e) => setNewAddressData({...newAddressData, street: e.target.value})}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newAddressData.city}
                      onChange={(e) => setNewAddressData({...newAddressData, city: e.target.value})}
                      placeholder="New York"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={newAddressData.state}
                      onChange={(e) => setNewAddressData({...newAddressData, state: e.target.value})}
                      placeholder="NY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={newAddressData.pincode}
                      onChange={(e) => setNewAddressData({...newAddressData, pincode: e.target.value})}
                      placeholder="10001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      value={newAddressData.county}
                      onChange={(e) => setNewAddressData({...newAddressData, county: e.target.value})}
                      placeholder="Manhattan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={newAddressData.country}
                      onChange={(e) => setNewAddressData({...newAddressData, country: e.target.value})}
                      placeholder="India"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newAddressData.isDefault}
                      onChange={(e) => setNewAddressData({...newAddressData, isDefault: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                  </label>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleCreateAddress}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Address
                  </button>
                  <button
                    onClick={handleCancelAddAddress}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {isLoadingAddresses ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new address.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className={`p-4 border rounded-lg ${address.isDefault ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'}`}
                  >
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-3">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Default Address
                      </span>
                    )}
                    <div className="space-y-2 mb-3">
                      <p className="font-medium text-gray-900">{address.street}</p>
                      <p className="text-gray-600">
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      {address.county && (
                        <p className="text-gray-600">{address.county}</p>
                      )}
                      <p className="text-gray-600">{address.country}</p>
                      <p className="text-xs text-gray-500">
                        Added on {formatDate(address.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => router.push(`/address/edit/${address.id}`)}
                        className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-md hover:bg-indigo-50 flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      {!address.isDefault && (
                        <>
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Set Default
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/product')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3 group-hover:bg-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v4a4 4 0 008 0v-4M8 11h8" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Browse Products</h3>
                <p className="text-sm text-gray-600 mt-1">Discover eco-friendly items</p>
              </button>

              <button
                onClick={() => router.push('/product/create')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3 group-hover:bg-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Sell Product</h3>
                <p className="text-sm text-gray-600 mt-1">List a new product for sale</p>
              </button>

              <button
                onClick={() => router.push('/orders')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-600 mt-1">View your purchase history</p>
              </button>

              <button
                onClick={() => router.push('/cart')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3 group-hover:bg-orange-200">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 006 16h12a1 1 0 000-2H6.414l.293-.293z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Shopping Cart</h3>
                <p className="text-sm text-gray-600 mt-1">View items in your cart</p>
              </button>

              {user.role === 'ADMIN' && (
                <button
                  className="p-4 border border-purple-300 rounded-lg hover:bg-purple-50 text-left transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-purple-900">Admin Panel</h3>
                  <p className="text-sm text-purple-600 mt-1">Manage platform settings</p>
                </button>
              )}

              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-3 group-hover:bg-indigo-200">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Manage Addresses</h3>
                <p className="text-sm text-gray-600 mt-1">Add or edit delivery addresses</p>
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3 group-hover:bg-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Edit Profile</h3>
                <p className="text-sm text-gray-600 mt-1">Update your account information</p>
              </button>

              <button
                onClick={handleLogout}
                className="p-4 border border-red-300 rounded-lg hover:bg-red-50 text-left transition-colors group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-3 group-hover:bg-red-200">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="font-medium text-red-900">Logout</h3>
                <p className="text-sm text-red-600 mt-1">Sign out of your account</p>
              </button>
            </div>
          </div>
        </div>

        {/* Avatar Edit Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile Picture</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={editData.avatar}
                  onChange={(e) => setEditData({...editData, avatar: e.target.value})}
                  placeholder="Enter profile picture URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a valid URL for your profile picture
                </p>
              </div>
              {editData.avatar && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="flex justify-center">
                    <div className="relative h-20 w-20">
                      <Image
                        src={editData.avatar}
                        alt="Preview"
                        fill
                        className="rounded-full object-cover"
                        onError={() => {
                          setError('Invalid image URL');
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}