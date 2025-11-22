declare module '@pages/Admin/Contacts/ContactTable' {
  import React from 'react';

  export interface Contact {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
  }

  interface ContactTableProps {
    contacts: Contact[];
    onUpdate: (id: string, updates: Partial<Contact>) => void;
  }

  const ContactTable: React.FC<ContactTableProps>;
  export default ContactTable;
}