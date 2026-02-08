import React, { useContext, useState, useEffect } from 'react';
import { AppContext, User } from '../App';
import { translations } from './mockData';
import { Message } from '../types';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { ArrowLeft, Send, Mail, MailOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function MessagingHub() {
    const { currentUser, language, setCurrentScreen } = useContext(AppContext);
    const t = translations[language];

    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [sendToAll, setSendToAll] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });

    // Check if user can send messages (admin or vet)
    const canSendMessages = currentUser?.role === 'admin' || currentUser?.role === 'vet';

    useEffect(() => {
        fetchMessages();
        if (canSendMessages) {
            fetchUsers();
        }
    }, []);

    const fetchMessages = async () => {
        try {
            const endpoint = canSendMessages
                ? `${API_BASE_URL}/messages/sent`
                : `${API_BASE_URL}/messages/inbox/${currentUser?.id}`;

            const response = await axios.get(endpoint);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error(t.errorOccurred);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`);
            // Filter to get only zookeepers
            const zookeepers = response.data.filter((u: User) => u.role === 'zookeeper');
            setUsers(zookeepers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleRecipientToggle = (userId: string) => {
        if (selectedRecipients.includes(userId)) {
            setSelectedRecipients(selectedRecipients.filter(id => id !== userId));
        } else {
            setSelectedRecipients([...selectedRecipients, userId]);
        }
    };

    const handleSendMessage = async () => {
        if (!formData.subject || !formData.message) {
            toast.error(language === 'en' ? 'Please fill all fields' : 'कृपया सभी फ़ील्ड भरें');
            return;
        }

        if (!sendToAll && selectedRecipients.length === 0) {
            toast.error(language === 'en' ? 'Please select at least one recipient' : 'कृपया कम से कम एक प्राप्तकर्ता चुनें');
            return;
        }

        try {
            const payload = {
                from: currentUser?.id,
                fromRole: currentUser?.role,
                to: sendToAll ? ['all'] : selectedRecipients,
                subject: formData.subject,
                message: formData.message,
                createdAt: new Date().toISOString(),
                read: false,
            };

            await axios.post(`${API_BASE_URL}/messages`, payload);
            toast.success(language === 'en' ? 'Message sent successfully' : 'संदेश सफलतापूर्वक भेजा गया');

            resetForm();
            setIsDialogOpen(false);
            fetchMessages();
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.error || t.errorOccurred);
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            await axios.put(`${API_BASE_URL}/messages/${messageId}/read`);
            fetchMessages();
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const resetForm = () => {
        setFormData({ subject: '', message: '' });
        setSelectedRecipients([]);
        setSendToAll(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => setCurrentScreen('dashboard')}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {language === 'en' ? 'Back' : 'पीछे'}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {canSendMessages ? t.messages : t.inbox}
                    </h1>
                    {canSendMessages ? (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.sendMessage}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{t.sendMessage}</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 mt-4">
                                    <div>
                                        <Label>{t.selectRecipients}</Label>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                                                <Checkbox
                                                    checked={sendToAll}
                                                    onCheckedChange={(checked) => {
                                                        setSendToAll(checked as boolean);
                                                        if (checked) setSelectedRecipients([]);
                                                    }}
                                                />
                                                <Label className="font-semibold text-blue-700">{t.allZookeepers}</Label>
                                            </div>

                                            {!sendToAll && (
                                                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                                                    {users.map(user => (
                                                        <div key={user.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={selectedRecipients.includes(user.id)}
                                                                onCheckedChange={() => handleRecipientToggle(user.id)}
                                                            />
                                                            <Label>{user.name}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>{t.messageSubject}</Label>
                                        <Input
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder={language === 'en' ? 'Enter subject...' : 'विषय दर्ज करें...'}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.messageBody}</Label>
                                        <Textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder={language === 'en' ? 'Enter message...' : 'संदेश दर्ज करें...'}
                                            rows={6}
                                        />
                                    </div>

                                    <Button onClick={handleSendMessage} className="w-full">
                                        <Send className="w-4 h-4 mr-2" />
                                        {t.sendMessage}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <div className="w-32"></div>
                    )}
                </div>

                {/* Messages List */}
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {language === 'en' ? 'No messages yet' : 'अभी तक कोई संदेश नहीं'}
                            </p>
                        </Card>
                    ) : (
                        messages.map(message => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card
                                    className={`p-6 cursor-pointer transition-all ${!message.read && !canSendMessages ? 'bg-blue-50 border-blue-200' : ''
                                        }`}
                                    onClick={() => !canSendMessages && !message.read && markAsRead(message.id!)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`p-3 rounded-full ${!message.read && !canSendMessages ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}>
                                                {!message.read && !canSendMessages ? (
                                                    <Mail className="w-5 h-5 text-white" />
                                                ) : (
                                                    <MailOpen className="w-5 h-5 text-gray-600" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="font-semibold text-lg">{message.subject}</h3>
                                                    {!message.read && !canSendMessages && (
                                                        <Badge variant="default" className="bg-blue-500">
                                                            {language === 'en' ? 'New' : 'नया'}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-gray-700 mb-3">{message.message}</p>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>
                                                        {canSendMessages
                                                            ? `${language === 'en' ? 'To' : 'को'}: ${message.to.includes('all') ? t.allZookeepers : `${message.to.length} ${language === 'en' ? 'recipients' : 'प्राप्तकर्ता'}`}`
                                                            : `${language === 'en' ? 'From' : 'से'}: ${message.fromRole === 'admin' ? t.admin : t.vet}`
                                                        }
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
