import React, { useEffect, useState } from 'react';
import api from '../../libs/axios';
import { toast } from 'react-toastify';
import ContactTable from '../Admin/Contacts/ContactTable';
import type { Contact } from '../Admin/Contacts/ContactTable';
import { useTitle } from '../../contexts/TitleContext/useTitle';

interface ContactPageProps {
  role: 'admin' | 'staff';
}

const ContactPage: React.FC<ContactPageProps> = ({ role }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { setTitle } = useTitle();

  // Fetch contacts from the backend (reusable)
  const fetchContacts = async () => {
    try {
      const response = await api.get('/contact');
      setContacts(response.data.messages);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    setTitle('Manage Contacts');
    fetchContacts();
  }, [setTitle]);

  const handleUpdate = async (id: string, updates: Partial<Contact>) => {
    try {
      await api.patch(`/contact/${id}`, updates);
      // After successful update, re-fetch the contacts to ensure data is fresh
      await fetchContacts();
      toast.success('Contact updated successfully');
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const response = await api.get(`/contact/${id}`);
      setSelectedContact(response.data.contactMessage);
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };
  
  // Close modal on Escape and lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedContact(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedContact]);

  return (
    <div>
      <div>
        <ContactTable contacts={contacts} role={role} onUpdate={handleUpdate} onViewDetails={handleViewDetails} />

        {selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedContact(null)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 z-10">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-semibold">Contact Details</h2>
                <button
                  aria-label="Close"
                  className="text-gray-500 hover:text-gray-900"
                  onClick={() => setSelectedContact(null)}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {selectedContact.name}</p>
                <p><strong>Email:</strong> {selectedContact.email}</p>
                <p><strong>Phone:</strong> {selectedContact.phone || 'N/A'}</p>
                <p><strong>Subject:</strong> {selectedContact.subject}</p>
                <p><strong>Message:</strong> {selectedContact.message}</p>
                <p><strong>Status:</strong> {selectedContact.status}</p>
                <p><strong>Note:</strong> {selectedContact.note || 'N/A'}</p>
                <p><strong>Handled By:</strong> {selectedContact.handledBy || 'N/A'}</p>
                <p><strong>Handled At:</strong> {selectedContact.handledAt || 'N/A'}</p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-100 rounded mr-2"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;