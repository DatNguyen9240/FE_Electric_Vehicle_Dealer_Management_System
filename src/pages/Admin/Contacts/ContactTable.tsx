import React from 'react';

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
  handledBy?: string;
  handledAt?: string;
}

interface ContactTableProps {
  contacts: Contact[];
  onUpdate: (id: string, updates: Partial<Contact>) => void;
  onViewDetails: (id: string) => void;
  role?: 'admin' | 'staff';
}

const ContactTable: React.FC<ContactTableProps> = ({ contacts = [], onUpdate, onViewDetails, role = 'staff' }) => {
  const [contactsState, setContactsState] = React.useState<Contact[]>(contacts);

  // Keep local state in sync when parent passes new contacts
  React.useEffect(() => {
    setContactsState(contacts);
  }, [contacts]);

  // Update local row state only (called by select onChange)
  const handleLocalStatusChange = (id: string, status: string) => {
    setContactsState((prevContacts) =>
      prevContacts.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  // Called when the user confirms the update (Update button)
  const handleConfirmUpdate = (id: string) => {
    const contact = contactsState.find((c) => c.id === id);
    if (!contact) return;
    const updates: Partial<Contact> = { status: contact.status, note: 'Đã gọi cho khách' };
    // update local and notify parent (which should call API)
    setContactsState((prevContacts) =>
      prevContacts.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    onUpdate(id, updates);
  };

  const onViewDetailsContact = (id: string) => onViewDetails(id);
  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      default:
        return s;
    }
  };

  const getStatusClasses = (s: string) => {
    switch (s) {
      case 'new':
        return 'bg-blue-50 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700';
      case 'closed':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Phone</th>
            <th className="px-4 py-3 text-left font-semibold">Subject</th>
            <th className="px-4 py-3 text-left font-semibold">Message</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {!contactsState || contactsState.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No contacts available</td>
            </tr>
          ) : (
            contactsState.map((contact) => (
              <tr key={contact.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-xs text-gray-500">{contact.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{contact.email}</td>
                <td className="px-4 py-3">{contact.phone || 'N/A'}</td>
                <td className="px-4 py-3">{contact.subject}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{contact.message}</td>
                <td className="px-4 py-3">
                  {role === 'admin' ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(contact.status)}`}>
                      {getStatusLabel(contact.status)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                        value={contact.status}
                        onChange={(e) => handleLocalStatusChange(contact.id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(contact.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {role !== 'admin' && (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => handleConfirmUpdate(contact.id)}
                      >
                        Update
                      </button>
                    )}
                    <button
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      onClick={() => onViewDetailsContact(contact.id)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContactTable;