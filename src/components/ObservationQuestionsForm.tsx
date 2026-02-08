import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ObservationQuestions, AnimalHealthForm, KraalHealthForm } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ObservationQuestionsFormProps {
    onComplete: (questions: ObservationQuestions) => void;
    onBack?: () => void;
}

export function ObservationQuestionsForm({ onComplete, onBack }: ObservationQuestionsFormProps) {
    const { language } = useContext(AppContext);
    const t = translations[language];

    const [answers, setAnswers] = useState<ObservationQuestions>({
        q1_feeding_digestion: '',
        q2_injury_illness: '',
        q3_behavior_activity: '',
        q4_mating_pregnancy: '',
        q5_death_critical: '',
        q6_enclosure_condition: '',
        q7_hygiene_safety: '',
        q8_staff_status: '',
        q9_other_notes: '',
    });

    const questions = [
        { key: 'q1_feeding_digestion', label: t.q1 },
        { key: 'q2_injury_illness', label: t.q2 },
        { key: 'q3_behavior_activity', label: t.q3 },
        { key: 'q4_mating_pregnancy', label: t.q4 },
        { key: 'q5_death_critical', label: t.q5 },
        { key: 'q6_enclosure_condition', label: t.q6 },
        { key: 'q7_hygiene_safety', label: t.q7 },
        { key: 'q8_staff_status', label: t.q8 },
        { key: 'q9_other_notes', label: t.q9 },
    ];

    const handleSubmit = () => {
        // Check if at least some questions are answered
        const hasAnswers = Object.values(answers).some(answer => answer.trim() !== '');
        if (!hasAnswers) {
            alert(t.enterObservation);
            return;
        }
        onComplete(answers);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t.dailyLog}</h3>
                <p className="text-sm text-gray-600 mb-6">
                    {language === 'en'
                        ? 'Please answer the following questions about today\'s observations:'
                        : 'कृपया आज के अवलोकन के बारे में निम्नलिखित प्रश्नों के उत्तर दें:'}
                </p>

                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <div key={question.key} className="space-y-2">
                            <Label className="font-medium">
                                {index + 1}. {question.label}
                            </Label>
                            <Textarea
                                value={answers[question.key as keyof ObservationQuestions]}
                                onChange={(e) => setAnswers({ ...answers, [question.key]: e.target.value })}
                                placeholder={language === 'en' ? 'Enter your answer...' : 'अपना उत्तर दर्ज करें...'}
                                rows={3}
                                className="w-full"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-6">
                    {onBack && (
                        <Button variant="outline" onClick={onBack}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t.cancel}
                        </Button>
                    )}
                    <Button onClick={handleSubmit} className="ml-auto">
                        {language === 'en' ? 'Continue to Forms' : 'फॉर्म पर जाएं'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
