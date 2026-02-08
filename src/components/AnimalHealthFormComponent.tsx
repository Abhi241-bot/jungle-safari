import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { AnimalHealthForm as AnimalHealthFormType } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface AnimalHealthFormProps {
    onComplete: (data: AnimalHealthFormType) => void;
    onBack: () => void;
}

export function AnimalHealthFormComponent({ onComplete, onBack }: AnimalHealthFormProps) {
    const { language } = useContext(AppContext);
    const t = translations[language];

    const [formData, setFormData] = useState<AnimalHealthFormType>({
        feedTaken: true,
        stoolCondition: 'Normal',
        eveningFeedTaken: true,
        isInjured: false,
        birthObserved: false,
        deathObserved: false,
        femaleInHeat: false,
        abnormalBehavior: false,
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
                <h3 className="text-lg font-semibold mb-4 text-blue-700">{t.animalHealthForm}</h3>

                <div className="space-y-6">
                    {/* Feed Taken */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.feedTaken}</Label>
                        <RadioGroup
                            value={formData.feedTaken ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, feedTaken: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="feed-yes" />
                                <Label htmlFor="feed-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="feed-no" />
                                <Label htmlFor="feed-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>

                        {!formData.feedTaken && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-orange-300">
                                <div>
                                    <Label>{t.speciesNotFed}</Label>
                                    <Input
                                        value={formData.speciesNotFed || ''}
                                        onChange={(e) => setFormData({ ...formData, speciesNotFed: e.target.value })}
                                        placeholder={language === 'en' ? 'Enter species/animal name' : 'प्रजाति/जानवर का नाम दर्ज करें'}
                                    />
                                </div>
                                <div>
                                    <Label>{t.feedConsumption}</Label>
                                    <Select
                                        value={formData.feedConsumption}
                                        onValueChange={(value: any) => setFormData({ ...formData, feedConsumption: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={language === 'en' ? 'Select consumption' : 'खपत चुनें'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10%">10%</SelectItem>
                                            <SelectItem value="30%">30%</SelectItem>
                                            <SelectItem value="50%">50%</SelectItem>
                                            <SelectItem value=">60%">&gt;60%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stool Condition */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.stoolCondition}</Label>
                        <Select
                            value={formData.stoolCondition}
                            onValueChange={(value: any) => setFormData({ ...formData, stoolCondition: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Normal">{t.normal}</SelectItem>
                                <SelectItem value="Hard">{t.hard}</SelectItem>
                                <SelectItem value="Soft">{t.soft}</SelectItem>
                                <SelectItem value="Worms">{t.worms}</SelectItem>
                                <SelectItem value="Blood">{t.blood}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Evening Feed */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.eveningFeedTaken}</Label>
                        <RadioGroup
                            value={formData.eveningFeedTaken ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, eveningFeedTaken: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="evening-yes" />
                                <Label htmlFor="evening-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="evening-no" />
                                <Label htmlFor="evening-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Injury */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.isInjured}</Label>
                        <RadioGroup
                            value={formData.isInjured ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, isInjured: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="injury-yes" />
                                <Label htmlFor="injury-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="injury-no" />
                                <Label htmlFor="injury-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>

                        {formData.isInjured && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-red-300">
                                <div>
                                    <Label>{t.injuryType}</Label>
                                    <Select
                                        value={formData.injuryType}
                                        onValueChange={(value: any) => setFormData({ ...formData, injuryType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={language === 'en' ? 'Select type' : 'प्रकार चुनें'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Minor">{t.minor}</SelectItem>
                                            <SelectItem value="Severe">{t.severe}</SelectItem>
                                            <SelectItem value="Head">{t.head}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{t.injuryDetails}</Label>
                                    <Textarea
                                        value={formData.injuryDetails || ''}
                                        onChange={(e) => setFormData({ ...formData, injuryDetails: e.target.value })}
                                        placeholder={language === 'en' ? 'Describe the injury...' : 'चोट का वर्णन करें...'}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Birth */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.birthObserved}</Label>
                        <RadioGroup
                            value={formData.birthObserved ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, birthObserved: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="birth-yes" />
                                <Label htmlFor="birth-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="birth-no" />
                                <Label htmlFor="birth-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>

                        {formData.birthObserved && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-green-300">
                                <div>
                                    <Label>{t.species}</Label>
                                    <Input
                                        value={formData.birthDetails?.species || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            birthDetails: { ...formData.birthDetails!, species: e.target.value }
                                        })}
                                        placeholder={language === 'en' ? 'Species' : 'प्रजाति'}
                                    />
                                </div>
                                <div>
                                    <Label>{language === 'en' ? 'Enclosure Number' : 'बाड़ा संख्या'}</Label>
                                    <Input
                                        value={formData.birthDetails?.enclosure || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            birthDetails: { ...formData.birthDetails!, enclosure: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{t.motherName}</Label>
                                        <Input
                                            value={formData.birthDetails?.motherName || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                birthDetails: { ...formData.birthDetails!, motherName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.fatherName}</Label>
                                        <Input
                                            value={formData.birthDetails?.fatherName || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                birthDetails: { ...formData.birthDetails!, fatherName: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>{t.motherCaring}</Label>
                                    <RadioGroup
                                        value={formData.birthDetails?.motherCaring ? 'yes' : 'no'}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            birthDetails: { ...formData.birthDetails!, motherCaring: value === 'yes' }
                                        })}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="caring-yes" />
                                            <Label htmlFor="caring-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="caring-no" />
                                            <Label htmlFor="caring-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label>{t.feedingFrequency}</Label>
                                    <Select
                                        value={formData.birthDetails?.feedingFrequency}
                                        onValueChange={(value: any) => setFormData({
                                            ...formData,
                                            birthDetails: { ...formData.birthDetails!, feedingFrequency: value }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Once">{t.once}</SelectItem>
                                            <SelectItem value="Twice">{t.twice}</SelectItem>
                                            <SelectItem value="Thrice">{t.thrice}</SelectItem>
                                            <SelectItem value="Four or more">{t.fourOrMore}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Death */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.deathObserved}</Label>
                        <RadioGroup
                            value={formData.deathObserved ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, deathObserved: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="death-yes" />
                                <Label htmlFor="death-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="death-no" />
                                <Label htmlFor="death-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>

                        {formData.deathObserved && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-400">
                                <div>
                                    <Label>{t.species}</Label>
                                    <Input
                                        value={formData.deathDetails?.species || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            deathDetails: { ...formData.deathDetails!, species: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label>{t.sex}</Label>
                                    <Select
                                        value={formData.deathDetails?.sex}
                                        onValueChange={(value: any) => setFormData({
                                            ...formData,
                                            deathDetails: { ...formData.deathDetails!, sex: value }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">{t.male}</SelectItem>
                                            <SelectItem value="Female">{t.female}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{t.age}</Label>
                                    <Select
                                        value={formData.deathDetails?.age}
                                        onValueChange={(value: any) => setFormData({
                                            ...formData,
                                            deathDetails: { ...formData.deathDetails!, age: value }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Infant">{t.infant}</SelectItem>
                                            <SelectItem value="Young">{t.young}</SelectItem>
                                            <SelectItem value="Adult">{t.adult}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Female in Heat */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.femaleInHeat}</Label>
                        <RadioGroup
                            value={formData.femaleInHeat ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, femaleInHeat: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="heat-yes" />
                                <Label htmlFor="heat-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="heat-no" />
                                <Label htmlFor="heat-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>

                        {formData.femaleInHeat && (
                            <div className="mt-4 pl-4 border-l-2 border-pink-300">
                                <Label>{t.matingOccurred}</Label>
                                <RadioGroup
                                    value={formData.matingOccurred ? 'yes' : 'no'}
                                    onValueChange={(value) => setFormData({ ...formData, matingOccurred: value === 'yes' })}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="mating-yes" />
                                        <Label htmlFor="mating-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="mating-no" />
                                        <Label htmlFor="mating-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                    </div>

                    {/* Abnormal Behavior */}
                    <div className="space-y-2">
                        <Label className="font-medium">{t.abnormalBehavior}</Label>
                        <RadioGroup
                            value={formData.abnormalBehavior ? 'yes' : 'no'}
                            onValueChange={(value) => setFormData({ ...formData, abnormalBehavior: value === 'yes' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="behavior-yes" />
                                <Label htmlFor="behavior-yes">{language === 'en' ? 'Yes' : 'हाँ'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="behavior-no" />
                                <Label htmlFor="behavior-no">{language === 'en' ? 'No' : 'नहीं'}</Label>
                            </div>
                        </RadioGroup>

                        {formData.abnormalBehavior && (
                            <div className="mt-4 pl-4 border-l-2 border-yellow-300">
                                <Label>{t.abnormalBehaviorDetails}</Label>
                                <Textarea
                                    value={formData.abnormalBehaviorDetails || ''}
                                    onChange={(e) => setFormData({ ...formData, abnormalBehaviorDetails: e.target.value })}
                                    placeholder={language === 'en' ? 'Describe the behavior...' : 'व्यवहार का वर्णन करें...'}
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={onBack}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Back' : 'पीछे'}
                    </Button>
                    <Button onClick={handleSubmit}>
                        {language === 'en' ? 'Continue to Kraal Health' : 'बाड़ा स्वास्थ्य पर जाएं'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
