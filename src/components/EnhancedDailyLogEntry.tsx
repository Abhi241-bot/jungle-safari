import React, { useContext, useState, useEffect } from 'react';
import { AppContext, Animal } from '../App';
import { translations } from './mockData';
import { ObservationQuestions, AnimalHealthForm, KraalHealthForm } from '../types';
import { ObservationQuestionsForm } from './ObservationQuestionsForm';
import { AnimalHealthFormComponent } from './AnimalHealthFormComponent';
import { KraalHealthFormComponent } from './KraalHealthFormComponent';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { ArrowLeft, Camera, Video, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type LogStep = 'select-animal' | 'select-time' | 'questions' | 'animal-health' | 'kraal-health' | 'media' | 'complete';
type LogType = 'morning' | 'evening';

export function EnhancedDailyLogEntry() {
    const { currentUser, language, selectedAnimal, setSelectedAnimal, setCurrentScreen } = useContext(AppContext);
    const t = translations[language];

    const [currentStep, setCurrentStep] = useState<LogStep>('select-animal');
    const [logType, setLogType] = useState<LogType>('morning');
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [questionsData, setQuestionsData] = useState<ObservationQuestions | null>(null);
    const [animalHealthData, setAnimalHealthData] = useState<AnimalHealthForm | null>(null);
    const [kraalHealthData, setKraalHealthData] = useState<KraalHealthForm | null>(null);

    // Media uploads
    const [gateImage, setGateImage] = useState<File | null>(null);
    const [animalImage, setAnimalImage] = useState<File | null>(null);
    const [animalVideo, setAnimalVideo] = useState<File | null>(null);

    // Check if it's a weekly cleaning day (e.g., every Sunday)
    const isWeeklyCleaningDay = new Date().getDay() === 0;

    useEffect(() => {
        fetchAnimals();
    }, []);

    const fetchAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`);
            setAnimals(response.data);
        } catch (error) {
            console.error('Error fetching animals:', error);
            toast.error(t.errorOccurred);
        }
    };

    const getCurrentTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        return 'evening';
    };

    const handleAnimalSelect = (animalId: string) => {
        const animal = animals.find(a => a.id === animalId);
        if (animal) {
            setSelectedAnimal(animal);
            setCurrentStep('select-time');
        }
    };

    const handleTimeSelect = () => {
        setCurrentStep('questions');
    };

    const handleQuestionsComplete = (data: ObservationQuestions) => {
        setQuestionsData(data);
        setCurrentStep('animal-health');
    };

    const handleAnimalHealthComplete = (data: AnimalHealthForm) => {
        setAnimalHealthData(data);
        setCurrentStep('kraal-health');
    };

    const handleKraalHealthComplete = (data: KraalHealthForm) => {
        setKraalHealthData(data);
        setCurrentStep('media');
    };

    const handleFinalSubmit = async () => {
        if (!selectedAnimal || !questionsData || !animalHealthData || !kraalHealthData) {
            toast.error(t.errorOccurred);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            // Add media files
            if (gateImage) formData.append('gateImage', gateImage);
            if (animalImage) formData.append('animalImage', animalImage);
            if (animalVideo) formData.append('animalVideo', animalVideo);

            // Combine all observation text from questions
            const observationText = Object.entries(questionsData)
                .map(([key, value]) => value)
                .filter(v => v.trim())
                .join(' | ');

            // Create complete payload
            const payload = {
                animalId: selectedAnimal.id,
                submittedBy: currentUser?.name,
                createdAt: new Date().toISOString(),
                logType: logType,
                observationText: observationText,
                questions: questionsData,
                animalHealth: animalHealthData,
                kraalHealth: kraalHealthData,
                isComplete: true,
            };

            formData.append('logData', JSON.stringify(payload));

            const response = await axios.post(`${API_BASE_URL}/process_enhanced_observation`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('✅ Enhanced observation submitted:', response.data);
            toast.success(t.observationProcessedSuccess);
            setCurrentStep('complete');

            // Reset after 3 seconds
            setTimeout(() => {
                resetForm();
            }, 3000);

        } catch (error: any) {
            console.error('❌ Error submitting observation:', error);
            toast.error(error.response?.data?.error || t.processingError);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep('select-animal');
        setSelectedAnimal(null);
        setQuestionsData(null);
        setAnimalHealthData(null);
        setKraalHealthData(null);
        setGateImage(null);
        setAnimalImage(null);
        setAnimalVideo(null);
        setLogType(getCurrentTime() as LogType);
    };

    const handleBack = () => {
        if (currentStep === 'select-time') setCurrentStep('select-animal');
        else if (currentStep === 'questions') setCurrentStep('select-time');
        else if (currentStep === 'animal-health') setCurrentStep('questions');
        else if (currentStep === 'kraal-health') setCurrentStep('animal-health');
        else if (currentStep === 'media') setCurrentStep('kraal-health');
        else setCurrentScreen('dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t.cancel}
                    </Button>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800">{t.addLog}</h1>
                        {selectedAnimal && (
                            <p className="text-sm text-gray-600">{selectedAnimal.name} - {selectedAnimal.species}</p>
                        )}
                    </div>
                    <div className="w-24"></div>
                </div>

                {/* Progress Indicator */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        {['select-animal', 'select-time', 'questions', 'animal-health', 'kraal-health', 'media'].map((step, index) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === step ? 'bg-blue-600 text-white' :
                                        ['select-animal', 'select-time', 'questions', 'animal-health', 'kraal-health', 'media'].indexOf(currentStep) > index
                                            ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                {index < 5 && <div className="w-12 h-1 bg-gray-300 mx-1"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 'select-animal' && (
                        <motion.div
                            key="select-animal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">{t.myAnimals}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {animals.map(animal => (
                                        <div
                                            key={animal.id}
                                            onClick={() => handleAnimalSelect(animal.id)}
                                            className="p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <img src={animal.image} alt={animal.name} className="w-16 h-16 rounded-full object-cover" />
                                                <div>
                                                    <h4 className="font-semibold">{animal.name}</h4>
                                                    <p className="text-sm text-gray-600">{animal.species}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {currentStep === 'select-time' && (
                        <motion.div
                            key="select-time"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    {language === 'en' ? 'Select Log Type' : 'लॉग प्रकार चुनें'}
                                </h3>
                                <div className="space-y-4">
                                    <div
                                        onClick={() => setLogType('morning')}
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${logType === 'morning' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                                            }`}
                                    >
                                        <h4 className="font-semibold text-lg">{t.morningLog}</h4>
                                        <p className="text-sm text-gray-600">{t.deadline}: 11:30 AM</p>
                                    </div>
                                    <div
                                        onClick={() => setLogType('evening')}
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${logType === 'evening' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
                                            }`}
                                    >
                                        <h4 className="font-semibold text-lg">{t.eveningLog}</h4>
                                        <p className="text-sm text-gray-600">{t.deadline}: 4:30 PM</p>
                                    </div>
                                </div>
                                <Button onClick={handleTimeSelect} className="w-full mt-6">
                                    {language === 'en' ? 'Continue' : 'जारी रखें'}
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {currentStep === 'questions' && (
                        <ObservationQuestionsForm
                            onComplete={handleQuestionsComplete}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'animal-health' && (
                        <AnimalHealthFormComponent
                            onComplete={handleAnimalHealthComplete}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'kraal-health' && (
                        <KraalHealthFormComponent
                            onComplete={handleKraalHealthComplete}
                            onBack={handleBack}
                            showWeeklyCleaning={isWeeklyCleaningDay}
                        />
                    )}

                    {currentStep === 'media' && (
                        <motion.div
                            key="media"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">{t.mediaUploads}</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    {language === 'en' ? 'Optional: Upload photos or videos' : 'वैकल्पिक: फोटो या वीडियो अपलोड करें'}
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <Label>{language === 'en' ? 'Gate Image' : 'गेट की छवि'}</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setGateImage(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <div>
                                        <Label>{language === 'en' ? 'Animal Image' : 'जानवर की छवि'}</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setAnimalImage(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <div>
                                        <Label>{language === 'en' ? 'Animal Video' : 'जानवर का वीडियो'}</Label>
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setAnimalVideo(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6">
                                    <Button variant="outline" onClick={handleBack}>
                                        {language === 'en' ? 'Back' : 'पीछे'}
                                    </Button>
                                    <Button onClick={handleFinalSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t.processing}
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {t.submitObservation}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {currentStep === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {language === 'en' ? 'Log Submitted Successfully!' : 'लॉग सफलतापूर्वक सबमिट किया गया!'}
                            </h2>
                            <p className="text-gray-600">
                                {language === 'en' ? 'Redirecting to dashboard...' : 'डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
