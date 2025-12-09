import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContext, Animal } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText, Mic, Image as ImageIcon, Clock, Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader } from 'lucide-react';

interface LogEntry {
  id: string;
  animalId: string;
  submittedBy: string;
  createdAt: string; // ISO string
  healthStatus: string;
  moodPercentage: number;
  appetitePercentage: number;
  movementPercentage: number;
  injuriesText: string;
  generalObservationText: string;
  imageUrl?: string;
  videoUrl?: string;
}

export function LogHistory() {
  const { language, setCurrentScreen, selectedAnimal, setSelectedAnimal } = useContext(AppContext);
  const t = translations[language];
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterAnimal, setFilterAnimal] = useState<string>('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Clear selected animal when component mounts to avoid unintended filtering
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsResponse, animalsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/observations`),
          axios.get(`${API_BASE_URL}/animals`),
        ]);
        setLogs(logsResponse.data);
        setAnimals(animalsResponse.data);
      } catch (err) {
        setError(t.processingError);
        console.error("Failed to fetch log history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t.processingError]);

  // Get unique animal names from logs
  const uniqueAnimals = Array.from(new Set(logs.map(log => {
    const animal = animals.find(a => a.id === log.animalId);
    return animal ? `${animal.name} (${animal.species})` : 'Unknown Animal';
  })));

  // Filter logs by selected animal filter
  const animalLogs = filterAnimal === 'all'
    ? logs
    : logs.filter(log => {
        const animal = animals.find(a => a.id === log.animalId);
        return animal ? `${animal.name} (${animal.species})` === filterAnimal : false;
      });

  // Get logs for selected date
  const logsForDate = selectedDate
    ? animalLogs.filter(log => 
        new Date(log.createdAt).toDateString() === selectedDate.toDateString()
      )
    : [];

  // Get dates that have logs
  const datesWithLogs = animalLogs.map(log => new Date(log.createdAt));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-green-50 to-amber-50">
        <Loader className="animate-spin h-12 w-12 text-green-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 pb-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-r from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl">
              {language === 'en' ? 'Log History' : 'लॉग इतिहास'}
            </h1>
            <p className="text-sm text-green-100 mt-1">
              {animalLogs.length} {language === 'en' ? 'total logs' : 'कुल लॉग'}
            </p>
          </div>
          <CalendarIcon className="w-8 h-8" />
        </div>

        {/* Animal Filter */}
        <div className="mb-4">
          <Select value={filterAnimal} onValueChange={setFilterAnimal}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white h-12">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'en' ? '📋 All Animals' : '📋 सभी जानवर'}
              </SelectItem>
              {uniqueAnimals.map((animal) => (
                <SelectItem key={animal} value={animal}>
                  {animal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Calendar' : 'कैलेंडर'}
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
              <FileText className="w-4 h-4 mr-2" />
              {language === 'en' ? 'List' : 'सूची'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Active Filter Indicator */}
        {filterAnimal !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-green-700 dark:text-green-400" />
                  <span className="text-sm text-green-900 dark:text-green-100">
                    {language === 'en' ? 'Filtered by:' : 'फ़िल्टर:'} <strong>{filterAnimal}</strong>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterAnimal('all')}
                  className="h-7 text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="w-4 h-4 mr-1" />
                  {language === 'en' ? 'Clear' : 'हटाएं'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {viewMode === 'calendar' ? (
          <>
            {/* Calendar View */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
                modifiers={{
                  hasLog: datesWithLogs,
                }}
                modifiersStyles={{
                  hasLog: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    color: '#16a34a',
                  },
                }}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  {language === 'en' 
                    ? '• Underlined dates have logs' 
                    : '• रेखांकित तिथियों में लॉग हैं'}
                </p>
              </motion.div>
            </Card>
            </motion.div>

            {/* Logs for Selected Date */}
            {selectedDate && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-green-900 dark:text-green-100 px-2"
                >
                  {language === 'en' ? 'Logs for' : 'लॉग'} {selectedDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </motion.h3>
                
                {logsForDate.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-8 bg-white dark:bg-gray-800 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      </motion.div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {language === 'en' ? 'No logs for this date' : 'इस तिथि के लिए कोई लॉग नहीं'}
                      </motion.p>
                    </Card>
                  </motion.div>
                ) : (
                  logsForDate.map((log, index) => (
                    <LogCard key={log.id} log={log} animals={animals} index={index} language={language} />
                  ))
                )}
              </motion.div>
            )}
          </>
        ) : (
          /* List View - All Logs */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-green-900 dark:text-green-100">
                {language === 'en' ? 'All Logs' : 'सभी लॉग'}
              </h3>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                {animalLogs.length} {language === 'en' ? 'entries' : 'प्रविष्टियाँ'}
              </Badge>
            </div>
            
            {animalLogs.map((log, index) => (
              <LogCard key={log.id} log={log} animals={animals} index={index} language={language} showDate />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LogCard({ 
  log, 
  index, 
  animals,
  language,
  showDate = false 
}: { 
  log: LogEntry; 
  index: number; 
  animals: Animal[];
  language: 'en' | 'hi';
  showDate?: boolean;
}) {
  const getMoodColor = (value: number) => {
    if (value >= 75) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (value >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  const getMoodLabel = (value: number) => {
    if (value >= 75) return language === 'en' ? 'Good' : 'अच्छा';
    if (value >= 50) return language === 'en' ? 'Fair' : 'सामान्य';
    return language === 'en' ? 'Poor' : 'खराब';
  };

  const animal = animals.find(a => a.id === log.animalId);
  if (!animal) {
    return null; // Don't render a card if the animal isn't found
  }

  const hasNotes = !!log.generalObservationText.trim() || !!log.injuriesText.trim();
  const hasRecording = !!log.videoUrl; // We'll use the video icon for this
  const hasImages = !!log.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-green-200 dark:hover:border-green-800">
        <div className="flex gap-4">
          {/* Animal Image */}
          <motion.div 
            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ImageWithFallback
              src={animal.image}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Log Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-green-900 dark:text-green-100">{animal.name} ({animal.species})</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'en' ? 'by' : 'द्वारा'} {log.submittedBy}
                </p>
              </div>
              {showDate && (
                <Badge variant="outline" className="text-xs">
                  {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Badge>
              )}
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 + 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`px-2 py-1 rounded text-xs text-center transition-all ${getMoodColor(log.moodPercentage)}`}
              >
                {language === 'en' ? 'Mood' : 'मूड'}: {getMoodLabel(log.moodPercentage)}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.15 }}
                whileHover={{ scale: 1.05 }}
                className={`px-2 py-1 rounded text-xs text-center transition-all ${getMoodColor(log.appetitePercentage)}`}
              >
                {language === 'en' ? 'Appetite' : 'भूख'}: {log.appetitePercentage}%
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 + 0.2 }}
                whileHover={{ scale: 1.05 }}
                className={`px-2 py-1 rounded text-xs text-center transition-all ${getMoodColor(log.movementPercentage)}`}
              >
                {language === 'en' ? 'Movement' : 'गति'}: {log.movementPercentage}%
              </motion.div>
            </div>

            {/* Media Indicators */}
            <div className="flex gap-3 items-center">
              {hasRecording && (
                <Badge variant="outline" className="text-xs gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {language === 'en' ? 'Video' : 'वीडियो'}
                </Badge>
              )}
              {hasImages && (
                <Badge variant="outline" className="text-xs gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {language === 'en' ? 'Photos' : 'फोटो'}
                </Badge>
              )}
              {log.hasNotes && (
                <Badge variant="outline" className="text-xs gap-1">
                  <FileText className="w-3 h-3" />
                  {language === 'en' ? 'Notes' : 'नोट्स'}
                </Badge>
              )}
            </div>

            {/* Notes Preview */}
            {hasNotes && !hasImages && !hasRecording && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {log.generalObservationText || log.injuriesText}
              </p>
            )}

            {/* Image Preview */}
            {hasImages && (
              <div className="mt-2">
                <img src={log.imageUrl} alt="Observation" className="rounded-lg max-h-40" />
              </div>
            )}
            {/* Video Preview */}
            {hasRecording && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                <video src={log.videoUrl} controls className="rounded-lg max-h-40 w-full" />
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
