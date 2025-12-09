import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContext, User as AppUser } from '../App';
import { mockAnimals, translations } from './mockData';
import { ArrowLeft, Send, Loader, AlertTriangle, Server, Mic, Square, Play, Trash2, FileText, HeartPulse, Camera, Video, Share2, Smile, Meh, Frown, Angry, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label'; // This import was missing
import { toast } from 'sonner';
import { Input } from './ui/input'; // For file inputs
import { useReactMediaRecorder } from 'react-media-recorder';
import { motion } from 'motion/react';
import { Checkbox } from './ui/checkbox';

// Define the structure of the data returned from the API
interface ProcessedData {
  date_or_day: string;
  animal_observed_on_time: boolean;
  clean_drinking_water_provided: boolean;
  enclosure_cleaned_properly: boolean;
  normal_behaviour_status: boolean;
  normal_behaviour_details: string | null;
  daily_animal_health_monitoring: string;
  [key: string]: any; // Allow for other properties
}

export function DailyLogEntry() {
  const { currentUser, language, setCurrentScreen, selectedAnimal } = useContext(AppContext);
  const t = translations[language];

  // Form State
  const [generalObservationText, setGeneralObservationText] = useState(''); // Renamed for clarity
  const [healthStatus, setHealthStatus] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good'); // Overall health
  const [moodPercentage, setMoodPercentage] = useState(50); // 0-100, 0: Agitated, 100: Calm
  const [appetitePercentage, setAppetitePercentage] = useState(50); // 0-100, 0: Low, 100: High
  const [movementPercentage, setMovementPercentage] = useState(50); // 0-100, 0: Slow, 100: Active
  const [injuriesText, setInjuriesText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gateImageFile, setGateImageFile] = useState<File | null>(null); // New state for gate image
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedUsersToShare, setSelectedUsersToShare] = useState<string[]>([]); // Array of user IDs to share with

  const [allUsers, setAllUsers] = useState<AppUser[]>([]); // State for live user data
  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const { // Media Recorder Hook
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({ 
    audio: true, 
    video: false,
    onStop: (blobUrl, blob) => handleAudioTranscription(blob)
  });

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const animal = selectedAnimal || mockAnimals[0];

  useEffect(() => {
    // Fetch all users for the sharing component
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setAllUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users for sharing:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleAudioTranscription = async (blob: Blob) => {
    if (!blob) return;

    toast.info(t.transcribingAudio);
    setIsLoading(true);

    // Construct a prefix with the current state of the sliders
    let prefix = `Overall Health Status: ${healthStatus}. Mood: ${moodPercentage}%. Appetite: ${appetitePercentage}%. Movement: ${movementPercentage}%. `;
    if (injuriesText.trim()) {
      prefix += `Injuries Report: ${injuriesText}. `;
    }

    const formData = new FormData();
    formData.append('audio', blob, 'observation.wav');
    formData.append('date', new Date().toISOString());
    formData.append('prefix', prefix); // Send the slider data as a prefix
    formData.append('animalId', selectedAnimal?.id || ''); // Add animalId

    try {
      const response = await axios.post(`${API_BASE_URL}/process_audio_observation`, formData);
      setProcessedData(response.data); // Set the structured data from the AI
      setGeneralObservationText(response.data.daily_animal_health_monitoring); // Populate the text area with the summary
      toast.success(t.observationProcessedSuccess);
    } catch (err: any) {
      toast.error(t.processingError);
      console.error("Audio Processing Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    // Reset form states
    setGeneralObservationText('');
    setHealthStatus('good');
    setMoodPercentage(50);
    setAppetitePercentage(50);
    setMovementPercentage(50);
    setInjuriesText('');
    setImageFile(null);
    setGateImageFile(null);
    setVideoFile(null);
    setSelectedUsersToShare([]);
    clearBlobUrl(); // Clear audio recording
    // Reset API states
    setError(null);
    setProcessedData(null);
  };

  const handleSubmitLog = async () => {
     if (isLoading) return;
 
     // Prioritize recorded audio over typed text
     const hasAudio = false; // Audio is now transcribed directly to text
     const hasText = generalObservationText.trim() || injuriesText.trim()
 
     if (!hasAudio && !hasText) {
       toast.error(t.enterObservation); // This toast is for the main submit button
       return;
     }
 
     resetState();
     setIsLoading(true);
 
     try {
       // Construct a comprehensive observation text for the AI
       let fullObservationText = `Overall Health Status: ${healthStatus}. `;
       fullObservationText += `Mood: ${moodPercentage}% (${moodPercentage < 50 ? t.agitated : t.calm}). `;
       fullObservationText += `Appetite: ${appetitePercentage}% (${appetitePercentage < 50 ? t.low : t.high}). `;
       fullObservationText += `Movement: ${movementPercentage}% (${movementPercentage < 50 ? t.slow : t.active}). `;
       if (injuriesText.trim()) {
         fullObservationText += `Injuries Report: ${injuriesText}. `;
       }
       if (generalObservationText.trim()) {
         fullObservationText += `General Observation: ${generalObservationText}. `;
       }

       const formData = new FormData();
       if (gateImageFile) {
         formData.append('gateImage', gateImageFile);
       }
       if (imageFile) {
         formData.append('animalImage', imageFile);
       }
       if (videoFile) {
         formData.append('animalVideo', videoFile);
       }
 
       // Create the complete payload for the backend
       const payload = {
         animalId: selectedAnimal?.id,
         submittedBy: currentUser?.name,
         createdAt: new Date().toISOString(),
         healthStatus: healthStatus,
         moodPercentage: moodPercentage,
         appetitePercentage: appetitePercentage,
         movementPercentage: movementPercentage,
         injuriesText: injuriesText.trim(),
         generalObservationText: generalObservationText.trim(),
         observationText: fullObservationText, // Combined text for AI processing
         sharedWith: selectedUsersToShare,
       };

       formData.append('logData', JSON.stringify(payload));
 
       const response = await axios.post(`${API_BASE_URL}/process_text_observation`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
       setProcessedData(response.data);
       toast.success(t.observationProcessedSuccess);
       if (selectedUsersToShare.length > 0) console.log("TODO: Sharing with users:", selectedUsersToShare); // Placeholder for future sharing logic
 
       // Clear form after successful submission
       resetState();
 
     } catch (err: any) {
       const errorMessage = err.response?.data?.error || err.message || t.processingError;
       setError(errorMessage);
       toast.error(t.processingError);
       console.error("API Error:", err);
     } finally {
       setIsLoading(false);
     }
   };

  const healthOptions = [
    { status: 'excellent', icon: Smile, color: 'text-green-500' },
    { status: 'good', icon: Meh, color: 'text-blue-500' },
    { status: 'fair', icon: Frown, color: 'text-yellow-500' },
    { status: 'poor', icon: Angry, color: 'text-red-500' },
  ];

  // Helper to get users by role for sharing
  const getUsersByRole = (role: string) => allUsers.filter(user => user.role === role);

  const handleShareUserToggle = (userId: string) => {
    setSelectedUsersToShare(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-white">{t.dailyLog}</h1>
            <p className="text-sm text-white/80">
              {animal.name} - {animal.species}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Health Assessment */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-3">
            <HeartPulse className="w-5 h-5" /> {t.healthAssessment}
            Health Assessment
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {healthOptions.map((option) => (
              <Button
                key={option.status}
                variant={healthStatus === option.status ? 'default' : 'outline'}
                className={`h-20 flex flex-col gap-1 transition-all duration-200 ${healthStatus === option.status ? 'bg-green-600 text-white' : ''}`}
                onClick={() => setHealthStatus(option.status as any)}
              >
                <option.icon className={`w-7 h-7 ${healthStatus !== option.status ? option.color : ''}`} />
                <span className="text-xs capitalize">{t[option.status]}</span>
              </Button>
            ))}
          </div>
        </Card>
        
        {/* Mood, Appetite, Movement Sliders */}
        <Card className="p-4 bg-white shadow-md">
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 text-gray-700 mb-2">
                {t.mood} ({moodPercentage}%)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.agitated}</span>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={moodPercentage}
                  onChange={(e) => setMoodPercentage(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">{t.calm}</span>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-gray-700 mb-2">
                {t.appetite} ({appetitePercentage}%)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.low}</span>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={appetitePercentage}
                  onChange={(e) => setAppetitePercentage(parseInt(e.target.value))}
                  className="flex-1 accent-green-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">{t.high}</span>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-gray-700 mb-2">
                {t.movement} ({movementPercentage}%)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.slow}</span>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={movementPercentage}
                  onChange={(e) => setMovementPercentage(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">{t.active}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Injuries / Report */}
        <Card className="p-4 bg-white shadow-md">
          <Label htmlFor="injuries-report" className="flex items-center gap-2 text-gray-700 mb-2">
            <AlertTriangle className="w-5 h-5" /> {t.injuriesReport}
          </Label>
          <Textarea
            id="injuries-report"
            placeholder={t.enterInjuries}
            value={injuriesText}
            onChange={(e) => setInjuriesText(e.target.value)}
            className="h-24 text-base"
            disabled={isLoading}
          />
        </Card>

        {/* General Observation Textarea */}
        <Card className="p-4 bg-white shadow-md">
          <Label htmlFor="general-observation" className="flex items-center gap-2 text-gray-700 mb-2">
            <FileText className="w-5 h-5" /> {t.textLog}
          </Label>
          <Textarea
            id="general-observation"
            placeholder={t.observationPlaceholder}
            value={generalObservationText}
            onChange={(e) => setGeneralObservationText(e.target.value)}
            className="h-32 text-base"
            disabled={isLoading || mediaBlobUrl !== null} // Disable if audio is recorded
          />
        </Card>

        {/* Audio Recording */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-2">
            <Mic className="w-5 h-5" /> {t.voiceLog}
          </Label>
          <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-center flex-col gap-3">
            <p className="text-sm text-gray-600">{t.recorderStatus}: <span className="font-semibold text-gray-800">{status}</span></p>
            {mediaBlobUrl && <audio src={mediaBlobUrl} controls className="w-full" />}
            <div className="flex gap-2 w-full">
              {status !== 'recording' ? (
                <Button onClick={startRecording} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  <Play className="w-4 h-4 mr-2" /> {t.startRecording}
                </Button>
              ) : (
                <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  <Square className="w-4 h-4 mr-2" /> {t.stopRecording}
                </Button>
              )}
              {mediaBlobUrl && (
                <Button onClick={clearBlobUrl} variant="outline" size="icon" disabled={isLoading}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Media Upload Section */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-2">
            <Camera className="w-5 h-5" /> {t.mediaUploads}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild disabled={isLoading}>
              <Label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center">
                <Camera className="w-4 h-4 mr-2" /> {imageFile ? imageFile.name : t.uploadImage}
              </Label>
            </Button>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            
            <Button variant="outline" asChild disabled={isLoading}>
              <Label htmlFor="video-upload" className="cursor-pointer flex items-center justify-center">
                <Video className="w-4 h-4 mr-2" /> {videoFile ? videoFile.name : t.uploadVideo}
              </Label>
            </Button>
            <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          </div>
          {/* Gate Closed Image Upload */}
          <div className="mt-4 border-t pt-4">
             <Label className="flex items-center gap-2 text-red-700 mb-2">
               <AlertTriangle className="w-5 h-5" /> {language === 'en' ? 'Security: Gate Closed Photo *' : 'सुरक्षा: गेट बंद फोटो *'}
             </Label>
             <Button variant="outline" asChild disabled={isLoading} className="border-red-500 text-red-600 hover:bg-red-50 w-full">
               <Label htmlFor="gate-image-upload" className="cursor-pointer flex items-center justify-center">
                 <Camera className="w-4 h-4 mr-2" /> {gateImageFile ? gateImageFile.name : (language === 'en' ? 'Upload Gate Photo' : 'गेट फोटो अपलोड करें')}
               </Label>
             </Button>
             <input id="gate-image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setGateImageFile(e.target.files?.[0] || null)} />
          </div>
        </Card>

        {/* Sharing Options */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-2">
            <Share2 className="w-5 h-5" /> {t.shareWith}
          </Label>
          <p className="text-sm text-gray-500 mb-3">{t.selectUsersToShare}</p>
          
          <div className="space-y-4">
            {/* Zookeepers */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">{t.zookeepers} ({getUsersByRole('zookeeper').filter(u => selectedUsersToShare.includes(u.id.toString())).length} / {getUsersByRole('zookeeper').length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {getUsersByRole('zookeeper').map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`share-zookeeper-${user.id}`}
                      checked={selectedUsersToShare.includes(user.id.toString())}
                      onCheckedChange={() => handleShareUserToggle(user.id.toString())}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`share-zookeeper-${user.id}`} className="cursor-pointer flex items-center gap-1">
                      <User className="w-4 h-4" /> {user.name} <span className="text-xs text-gray-500">({t[user.role]})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Vet Doctors */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">{t.vetDoctors} ({getUsersByRole('vet').filter(u => selectedUsersToShare.includes(u.id.toString())).length} / {getUsersByRole('vet').length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {getUsersByRole('vet').map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`share-vet-${user.id}`}
                      checked={selectedUsersToShare.includes(user.id.toString())}
                      onCheckedChange={() => handleShareUserToggle(user.id.toString())}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`share-vet-${user.id}`} className="cursor-pointer flex items-center gap-1">
                      <User className="w-4 h-4" /> {user.name} <span className="text-xs text-gray-500">({t[user.role]})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Admins */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">{t.admins} ({getUsersByRole('admin').filter(u => selectedUsersToShare.includes(u.id.toString())).length} / {getUsersByRole('admin').length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {getUsersByRole('admin').map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`share-admin-${user.id}`}
                      checked={selectedUsersToShare.includes(user.id.toString())}
                      onCheckedChange={() => handleShareUserToggle(user.id.toString())}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`share-admin-${user.id}`} className="cursor-pointer flex items-center gap-1">
                      <User className="w-4 h-4" /> {user.name} <span className="text-xs text-gray-500">({t[user.role]})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Forest Officers */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">{t.forestOfficers} ({getUsersByRole('officer').filter(u => selectedUsersToShare.includes(u.id.toString())).length} / {getUsersByRole('officer').length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {getUsersByRole('officer').map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`share-officer-${user.id}`}
                      checked={selectedUsersToShare.includes(user.id.toString())}
                      onCheckedChange={() => handleShareUserToggle(user.id.toString())}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`share-officer-${user.id}`} className="cursor-pointer flex items-center gap-1">
                      <User className="w-4 h-4" /> {user.name} <span className="text-xs text-gray-500">({t[user.role]})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitLog}
          disabled={isLoading || (!generalObservationText.trim() && !injuriesText.trim() && !mediaBlobUrl)}
          className="w-full mt-4 h-14 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-lg"
        >
          {isLoading ? <Loader className="animate-spin mr-2" /> : <Send className="mr-2" />}
          {isLoading ? t.processing : t.submitFullLog}
        </Button>

        {/* Results Section */}
        {error && (
          <Card className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800">
            <div className="flex items-center">
              <AlertTriangle className="mr-3" />
              <div>
                <p className="font-bold">{t.errorOccurred}</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {processedData && (
          <Card className="p-4 bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center mb-3">
              <Server className="mr-3 text-green-700" />
              <h2 className="text-lg font-semibold text-green-800">{t.processedData}</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Date:</strong> {processedData.date_or_day}</p>
              <p><strong>Health Summary:</strong> {processedData.daily_animal_health_monitoring}</p>
              <p><strong>Animal Observed on Time:</strong> {processedData.animal_observed_on_time ? 'Yes' : 'No'}</p>
              <p><strong>Clean Water Provided:</strong> {processedData.clean_drinking_water_provided ? 'Yes' : 'No'}</p>
              <p><strong>Enclosure Cleaned:</strong> {processedData.enclosure_cleaned_properly ? 'Yes' : 'No'}</p>
              <p><strong>Normal Behavior:</strong> {processedData.normal_behaviour_status ? 'Yes' : 'No'}</p>
              {!processedData.normal_behaviour_status && processedData.normal_behaviour_details && (
                <p><strong>Abnormal Behavior Details:</strong> {processedData.normal_behaviour_details}</p>
              )}
              <p><strong>Feed & Supplements Available:</strong> {processedData.feed_and_supplements_available ? 'Yes' : 'No'}</p>
              <p><strong>Feed Given as Prescribed:</strong> {processedData.feed_given_as_prescribed ? 'Yes' : 'No'}</p>
              {processedData.other_animal_requirements && <p><strong>Other Requirements:</strong> {processedData.other_animal_requirements}</p>}
              <p><strong>Carnivorous Feeding Chart:</strong> {processedData.carnivorous_animal_feeding_chart}</p>
              <p><strong>Medicine Stock Register:</strong> {processedData.medicine_stock_register}</p>
              <p><strong>Daily Wildlife Monitoring:</strong> {processedData.daily_wildlife_monitoring}</p>
              <p><strong>Signature:</strong> {processedData.incharge_signature}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
