import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Download, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../App';
import { LogDetailsSections } from './LogDetailsSections';

interface LogEntry {
    id: string;
    animalId: string;
    animalName: string;
    submittedAt: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    observations: string;
    processedData: any;
    moodPercentage?: number;
    appetitePercentage?: number;
    movementPercentage?: number;
}

interface ZookeeperLogsViewerProps {
    zookeeperId: string;
    zookeeperName: string;
    language: Language;
    isOpen: boolean;
    onClose: () => void;
}

export function ZookeeperLogsViewer({
    zookeeperId,
    zookeeperName,
    language,
    isOpen,
    onClose,
}: ZookeeperLogsViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [animalFilter, setAnimalFilter] = useState('');

    const t = {
        en: {
            title: 'Logs',
            description: 'View all logs submitted by',
            loading: 'Loading logs...',
            noLogs: 'No logs found',
            filterByDate: 'Filter by date',
            filterByAnimal: 'Filter by animal',
            clearFilters: 'Clear Filters',
            exportPDF: 'Export PDF',
            submittedAt: 'Submitted',
            animal: 'Animal',
            health: 'Health',
            observations: 'Observations',
            details: 'Details',
            mood: 'Mood',
            appetite: 'Appetite',
            movement: 'Movement',
            excellent: 'Excellent',
            good: 'Good',
            fair: 'Fair',
            poor: 'Poor',
        },
        hi: {
            title: 'लॉग',
            description: 'द्वारा सबमिट किए गए सभी लॉग देखें',
            loading: 'लॉग लोड हो रहे हैं...',
            noLogs: 'कोई लॉग नहीं मिला',
            filterByDate: 'तारीख से फ़िल्टर करें',
            filterByAnimal: 'जानवर से फ़िल्टर करें',
            clearFilters: 'फ़िल्टर साफ़ करें',
            exportPDF: 'PDF निर्यात करें',
            submittedAt: 'सबमिट किया गया',
            animal: 'जानवर',
            health: 'स्वास्थ्य',
            observations: 'अवलोकन',
            details: 'विवरण',
            mood: 'मूड',
            appetite: 'भूख',
            movement: 'गतिविधि',
            excellent: 'उत्कृष्ट',
            good: 'अच्छा',
            fair: 'ठीक',
            poor: 'खराब',
        },
    };

    const text = t[language];

    useEffect(() => {
        if (isOpen && zookeeperId) {
            fetchLogs();
        }
    }, [isOpen, zookeeperId]);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/logs/zookeeper/${zookeeperId}`);
            setLogs(response.data.logs || []);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            // Fallback to mock data
            setLogs([
                {
                    id: 'log1',
                    animalId: 'a1',
                    animalName: 'Tiger #1',
                    submittedAt: new Date().toISOString(),
                    healthStatus: 'good',
                    observations: 'Animal is active and eating well. No signs of distress.',
                    processedData: {},
                    moodPercentage: 75,
                    appetitePercentage: 80,
                    movementPercentage: 70,
                },
                {
                    id: 'log2',
                    animalId: 'a2',
                    animalName: 'Lion #2',
                    submittedAt: new Date(Date.now() - 3600000).toISOString(),
                    healthStatus: 'excellent',
                    observations: 'Very healthy, playful behavior observed.',
                    processedData: {},
                    moodPercentage: 90,
                    appetitePercentage: 95,
                    movementPercentage: 85,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        const matchesDate = dateFilter
            ? new Date(log.submittedAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
            : true;
        const matchesAnimal = animalFilter
            ? log.animalName.toLowerCase().includes(animalFilter.toLowerCase())
            : true;
        return matchesDate && matchesAnimal;
    });

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent':
                return 'bg-green-500';
            case 'good':
                return 'bg-blue-500';
            case 'fair':
                return 'bg-yellow-500';
            case 'poor':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getHealthText = (health: string) => {
        switch (health) {
            case 'excellent':
                return text.excellent;
            case 'good':
                return text.good;
            case 'fair':
                return text.fair;
            case 'poor':
                return text.poor;
            default:
                return health;
        }
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export
        console.log('Exporting logs to PDF...');
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-green-900">
                        {zookeeperName} - {text.title}
                    </SheetTitle>
                    <SheetDescription>
                        {text.description} {zookeeperName}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                placeholder={text.filterByDate}
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={animalFilter}
                                onChange={(e) => setAnimalFilter(e.target.value)}
                                placeholder={text.filterByAnimal}
                                className="w-full"
                            />
                        </div>
                        {(dateFilter || animalFilter) && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setDateFilter('');
                                    setAnimalFilter('');
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Export Button */}
                    <Button onClick={handleExportPDF} variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        {text.exportPDF}
                    </Button>

                    {/* Logs List */}
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">{text.loading}</div>
                    ) : filteredLogs.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500">{text.noLogs}</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredLogs.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="overflow-hidden">
                                        <div
                                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-gray-900">{log.animalName}</h4>
                                                        <Badge className={`${getHealthColor(log.healthStatus)} text-white text-xs`}>
                                                            {getHealthText(log.healthStatus)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {text.submittedAt}: {new Date(log.submittedAt).toLocaleString(language === 'en' ? 'en-US' : 'hi-IN')}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon">
                                                    {expandedLogId === log.id ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedLogId === log.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden bg-gray-50/50"
                                                >
                                                    <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                                                        <LogDetailsSections
                                                            log={{
                                                                ...log,
                                                                ...(log.processedData || {}),
                                                                // Ensure observation text is visible if strict matching fails
                                                                observationText: log.observations || log.processedData?.observationText || log.processedData?.observation
                                                            }}
                                                            language={language}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
