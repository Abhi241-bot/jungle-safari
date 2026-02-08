// Enhanced Type Definitions for Jungle Safari Management System

export interface ObservationQuestions {
    q1_feeding_digestion: string;
    q2_injury_illness: string;
    q3_behavior_activity: string;
    q4_mating_pregnancy: string;
    q5_death_critical: string;
    q6_enclosure_condition: string;
    q7_hygiene_safety: string;
    q8_staff_status: string;
    q9_other_notes: string;
}

export interface AnimalHealthForm {
    feedTaken: boolean;
    feedConsumption?: '10%' | '30%' | '50%' | '>60%';
    speciesNotFed?: string;
    stoolCondition: 'Hard' | 'Soft' | 'Worms' | 'Blood' | 'Normal';
    eveningFeedTaken: boolean;
    isInjured: boolean;
    injuryType?: 'Minor' | 'Severe' | 'Head';
    injuryDetails?: string;
    birthObserved: boolean;
    birthDetails?: {
        species: string;
        enclosure: string;
        motherName: string;
        fatherName: string;
        motherCaring: boolean;
        feedingFrequency: 'Once' | 'Twice' | 'Thrice' | 'Four or more';
    };
    deathObserved: boolean;
    deathDetails?: {
        species: string;
        sex: 'Male' | 'Female';
        age: 'Infant' | 'Young' | 'Adult';
    };
    femaleInHeat: boolean;
    matingOccurred?: boolean;
    abnormalBehavior: boolean;
    abnormalBehaviorDetails?: string;
}

export interface KraalHealthForm {
    cleanlinessChecked: boolean;
    waterTroughCleaned: boolean;
    fenceCondition: boolean;
    moatCondition: 'Dry' | 'Wet';
    pestControlTaken: boolean;
    staffStatus: boolean;
    weeklyCleaningType?: 'Sodium Hypochlorite' | 'Lime Water' | 'None';
}

export interface EnhancedObservation {
    id?: string;
    animalId: string;
    submittedBy: string;
    createdAt: string;
    logType: 'morning' | 'evening';

    // Original observation text
    observationText: string;

    // Structured questions
    questions: ObservationQuestions;

    // Structured forms
    animalHealth: AnimalHealthForm;
    kraalHealth: KraalHealthForm;

    // Media
    imageUrl?: string;
    videoUrl?: string;
    gateImageUrl?: string;
    audioUrl?: string;

    // AI-extracted fields (existing)
    date_or_day?: string;
    animal_observed_on_time?: boolean;
    clean_drinking_water_provided?: boolean;
    enclosure_cleaned_properly?: boolean;
    normal_behaviour_status?: boolean;
    normal_behaviour_details?: string;
    feed_and_supplements_available?: boolean;
    feed_given_as_prescribed?: boolean;
    other_animal_requirements?: string;
    incharge_signature?: string;
    daily_animal_health_monitoring?: string;
    carnivorous_animal_feeding_chart?: string;
    medicine_stock_register?: string;
    daily_wildlife_monitoring?: string;

    // Metadata
    sharedWith?: string[];
    isComplete: boolean;
}

export interface HospitalRecord {
    id?: string;
    animalId: string;
    animalName: string;
    date: string;
    observation: string;
    tests: string;
    dosage: string;
    remarks: string;
    createdBy: string;
    createdAt: string;
}

export interface Message {
    id?: string;
    from: string;
    fromRole: 'admin' | 'vet';
    to: string[]; // User IDs or 'all'
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export interface LogSchedule {
    userId: string;
    date: string;
    morningSubmitted: boolean;
    morningSubmittedAt?: string;
    eveningSubmitted: boolean;
    eveningSubmittedAt?: string;
    morningReminders: number;
    eveningReminders: number;
    escalated: boolean;
}
