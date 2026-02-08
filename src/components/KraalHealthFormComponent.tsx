import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { KraalHealthForm as KraalHealthFormType } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface KraalHealthFormProps {
    onComplete: (data: KraalHealthFormType) => void;
    onBack: () => void;
    showWeeklyCleaning?: boolean;
}

export function KraalHealthFormComponent({ onComplete, onBack, showWeeklyCleaning = false }: KraalHealthFormProps) {
    const { language } = useContext(AppContext);
    const t = translations[language];

    const [formData, setFormData] = useState<KraalHealthFormType>({
        cleanlinessChecked: true,
        waterTroughCleaned: true,
        fenceCondition: true,
        moatCondition: 'Dry',
        pestControlTaken: true,
        staffStatus: true,
        weeklyCleaningType: showWeeklyCleaning ? undefined : 'None',
    });

    const handleSubmit = () => {
        onComplete(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">{t.kraalHealthForm}</h3>

                <div className="space-y-6">
                    {/* Cleanliness Checked */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.cleanlinessChecked}</Label>
                        <RadioGroup
                            value={formData.cleanlinessChecked ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, cleanlinessChecked: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="clean-yes" />
                                <Label htmlFor="clean-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="clean-no" />
                                <Label htmlFor="clean-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Water Trough Cleaned */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.waterTroughCleaned}</Label>
                        <RadioGroup
                            value={formData.waterTroughCleaned ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, waterTroughCleaned: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="water-yes" />
                                <Label htmlFor="water-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="water-no" />
                                <Label htmlFor="water-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Fence Condition */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.fenceCondition}</Label>
                        <RadioGroup
                            value={formData.fenceCondition ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, fenceCondition: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="fence-yes" />
                                <Label htmlFor="fence-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="fence-no" />
                                <Label htmlFor="fence-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Moat Condition */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.moatCondition}</Label>
                        <Select
                            value={formData.moatCondition}
                            onValueChange={(value: any) => setFormData({ ...formData, moatCondition: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Dry">{t.dry}</SelectItem>
                                <SelectItem value="Wet">{t.wet}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pest Control */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.pestControlTaken}</Label>
                        <RadioGroup
                            value={formData.pestControlTaken ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, pestControlTaken: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="pest-yes" />
                                <Label htmlFor="pest-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="pest-no" />
                                <Label htmlFor="pest-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Staff Status */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.staffStatus}</Label>
                        <RadioGroup
                            value={formData.staffStatus ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, staffStatus: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="staff-yes" />
                                <Label htmlFor="staff-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="staff-no" />
                                <Label htmlFor="staff-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Weekly Cleaning (conditional) */}
                    {showWeeklyCleaning && (
                        <div className="space-y-2 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                            <Label className="font-medium text-purple-800">{t.weeklyCleaningType}</Label>
                            <Select
                                value={formData.weeklyCleaningType}
                                onValueChange={(value: any) => setFormData({ ...formData, weeklyCleaningType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={language === 'en' ? 'Select cleaning type' : 'सफाई का प्रकार चुनें'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sodium Hypochlorite">{t.sodiumHypochlorite}</SelectItem>
                                    <SelectItem value="Lime Water">{t.limeWater}</SelectItem>
                                    <SelectItem value="None">{t.none}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={onBack}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Back' : 'पीछे'}
                    </Button>
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Submit Log' : 'लॉग सबमिट करें'}
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
