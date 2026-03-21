import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/EmptyState';
import { Phone, Mail, Plus, Trash2, User, Users } from 'lucide-react';
import { toast } from 'sonner';

export function ContactsScreen() {
  const { contacts, setContacts } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('');
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleAdd = () => {
    const trimmedName = newContact.name.trim();
    const trimmedRole = newContact.role.trim();

    // Validate required fields
    if (!trimmedName || !trimmedRole) {
      toast.error('Please enter a name and role');
      return;
    }

    // Validate email if provided
    if (newContact.email && !validateEmail(newContact.email)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    const contact = {
      id: Date.now(),
      name: trimmedName,
      role: trimmedRole,
      phone: newContact.phone.trim() || undefined,
      email: newContact.email.trim() || undefined,
      notes: newContact.notes.trim() || undefined
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    setShowAdd(false);
    setNewContact({ name: '', role: '', phone: '', email: '', notes: '' });
    setEmailError('');
    toast.success(`${trimmedName} added to your support network!`);
  };

  const handleDelete = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Contact removed from your network');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Support Network</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-3">
        {contacts.map(contact => (
          <Card key={contact.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 flex items-center justify-center text-white font-bold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {contact.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCall(contact.phone!)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {contact.phone}
                  </Button>
                )}
                {contact.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleEmail(contact.email!)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {contact.email}
                  </Button>
                )}
                {contact.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {contacts.length === 0 && (
          <EmptyState
            icon={Users}
            title="Build Your Support Network"
            description="Recovery is stronger with support. Add your sponsor, therapist, support group members, or trusted friends. Having quick access to your support network can make all the difference in challenging moments."
            actionLabel="Add First Contact"
            onAction={() => setShowAdd(true)}
            iconColor="text-blue-500"
          />
        )}
      </div>

      {/* Add Contact Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Input
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  placeholder="Sponsor, Therapist, Friend, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone (optional)</label>
                <Input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email (optional)</label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="john@example.com"
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Additional information..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!newContact.name || !newContact.role} className="flex-1">
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

