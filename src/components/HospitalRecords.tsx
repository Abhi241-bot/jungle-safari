import React, { useContext, useState, useEffect } from 'react';
import { AppContext, Animal } from '../App';
import { translations } from './mockData';
import { HospitalRecord } from '../types';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function HospitalRecords() {
    const { currentUser, language, setCurrentScreen } = useContext(AppContext);
    const t = translations[language];

    const [records, setRecords] = useState<HospitalRecord[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HospitalRecord | null>(null);

    const [formData, setFormData] = useState<Partial<HospitalRecord>>({
        animalId: '',
        animalName: '',
        date: new Date().toISOString().split('T')[0],
        observation: '',
        tests: '',
        dosage: '',
        remarks: '',
    });

    // Check if user has write access (vet or admin)
    const hasWriteAccess = currentUser?.role === 'vet' || currentUser?.role === 'admin';

    useEffect(() => {
        fetchRecords();
        fetchAnimals();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hospital_records`);
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching hospital records:', error);
            toast.error(t.errorOccurred);
        }
    };

    const fetchAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`);
            setAnimals(response.data);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
    };

    const handleAnimalSelect = (animalId: string) => {
        const animal = animals.find(a => a.id === animalId);
        if (animal) {
            setFormData({
                ...formData,
                animalId: animal.id,
                animalName: animal.name,
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.animalId || !formData.observation || !formData.tests || !formData.dosage) {
            toast.error(language === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                createdBy: currentUser?.name,
                createdAt: new Date().toISOString(),
            };

            if (editingRecord) {
                await axios.put(`${API_BASE_URL}/hospital_records/${editingRecord.id}`, payload);
                toast.success(language === 'en' ? 'Record updated successfully' : 'रिकॉर्ड सफलतापूर्वक अपडेट किया गया');
            } else {
                await axios.post(`${API_BASE_URL}/hospital_records`, payload);
                toast.success(language === 'en' ? 'Record added successfully' : 'रिकॉर्ड सफलतापूर्वक जोड़ा गया');
            }

            fetchRecords();
            resetForm();
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error('Error saving record:', error);
            toast.error(error.response?.data?.error || t.errorOccurred);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (record: HospitalRecord) => {
        setEditingRecord(record);
        setFormData({
            animalId: record.animalId,
            animalName: record.animalName,
            date: record.date,
            observation: record.observation,
            tests: record.tests,
            dosage: record.dosage,
            remarks: record.remarks,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (recordId: string) => {
        if (!confirm(language === 'en' ? 'Are you sure you want to delete this record?' : 'क्या आप वाकई इस रिकॉर्ड को हटाना चाहते हैं?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/hospital_records/${recordId}`);
            toast.success(language === 'en' ? 'Record deleted successfully' : 'रिकॉर्ड सफलतापूर्वक हटाया गया');
            fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error(t.errorOccurred);
        }
    };

    const resetForm = () => {
        setFormData({
            animalId: '',
            animalName: '',
            date: new Date().toISOString().split('T')[0],
            observation: '',
            tests: '',
            dosage: '',
            remarks: '',
        });
        setEditingRecord(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => setCurrentScreen('dashboard')}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {language === 'en' ? 'Back' : 'पीछे'}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-800">{t.hospitalRecords}</h1>
                    {hasWriteAccess && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.addRecord}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingRecord
                                            ? (language === 'en' ? 'Edit Record' : 'रिकॉर्ड संपादित करें')
                                            : t.addRecord
                                        }
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 mt-4">
                                    <div>
                                        <Label>{language === 'en' ? 'Animal' : 'जानवर'} *</Label>
                                        <Select value={formData.animalId} onValueChange={handleAnimalSelect}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'en' ? 'Select animal' : 'जानवर चुनें'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {animals.map(animal => (
                                                    <SelectItem key={animal.id} value={animal.id}>
                                                        {animal.name} - {animal.species}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>{language === 'en' ? 'Date' : 'तारीख'} *</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.observation} *</Label>
                                        <Textarea
                                            value={formData.observation}
                                            onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                                            placeholder={language === 'en' ? 'Enter observations...' : 'अवलोकन दर्ज करें...'}
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.tests} *</Label>
                                        <Textarea
                                            value={formData.tests}
                                            onChange={(e) => setFormData({ ...formData, tests: e.target.value })}
                                            placeholder={language === 'en' ? 'Enter tests conducted...' : 'किए गए परीक्षण दर्ज करें...'}
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.dosage} *</Label>
                                        <Textarea
                                            value={formData.dosage}
                                            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                            placeholder={language === 'en' ? 'Enter dosage given...' : 'दी गई खुराक दर्ज करें...'}
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.remarks}</Label>
                                        <Textarea
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            placeholder={language === 'en' ? 'Enter remarks...' : 'टिप्पणियाँ दर्ज करें...'}
                                            rows={2}
                                        />
                                    </div>

                                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t.processing}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingRecord
                                                    ? (language === 'en' ? 'Update' : 'अपडेट करें')
                                                    : (language === 'en' ? 'Save' : 'सहेजें')
                                                }
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {!hasWriteAccess && <div className="w-32"></div>}
                </div>

                {/* Records Table */}
                <Card className="p-6">
                    {records.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {language === 'en' ? 'No hospital records found' : 'कोई अस्पताल रिकॉर्ड नहीं मिला'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{language === 'en' ? 'Date' : 'तारीख'}</TableHead>
                                        <TableHead>{language === 'en' ? 'Animal' : 'जानवर'}</TableHead>
                                        <TableHead>{t.observation}</TableHead>
                                        <TableHead>{t.tests}</TableHead>
                                        <TableHead>{t.dosage}</TableHead>
                                        <TableHead>{t.remarks}</TableHead>
                                        <TableHead>{language === 'en' ? 'Created By' : 'द्वारा बनाया गया'}</TableHead>
                                        {hasWriteAccess && <TableHead>{language === 'en' ? 'Actions' : 'क्रियाएँ'}</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map(record => (
                                        <TableRow key={record.id}>
                                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{record.animalName}</TableCell>
                                            <TableCell className="max-w-xs truncate">{record.observation}</TableCell>
                                            <TableCell className="max-w-xs truncate">{record.tests}</TableCell>
                                            <TableCell className="max-w-xs truncate">{record.dosage}</TableCell>
                                            <TableCell className="max-w-xs truncate">{record.remarks}</TableCell>
                                            <TableCell>{record.createdBy}</TableCell>
                                            {hasWriteAccess && (
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id!)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
