export interface Student {
    id: number;
    name: string;
    cgpa: number;
    isPlaced: boolean;
    currentSalary: number;
    companiesApplied: number;
    dreamOfferAmount: number;
    dreamCompanyName: string;
    eligible: boolean;
    branch?:          string;
    year?:            number;
    email?:           string;
    phone?:           string;
}

export interface Company {
    name:          string;
    offeredSalary: number;
    category:      string;
    location?:     string;
    jobRole?:      string;
    requirements?: string[];
    deadline?:     Date;
}

export interface PolicyResult {
    eligible: boolean;
    reasons:  string[];
}

export interface Policies {
    maxCompaniesPolicy:        MaxCompaniesPolicy;
    dreamOfferPolicy:          DreamOfferPolicy;
    dreamCompanyPolicy:        DreamCompanyPolicy;
    cgpaThresholdPolicy:       CgpaThresholdPolicy;
    placementPercentagePolicy: PlacementPercentagePolicy;
    offerCategoryPolicy:       OfferCategoryPolicy;
}

export interface CgpaThresholdPolicy {
    enabled: boolean;
    minCgpa: number;
    highSalaryThreshold: number;
}

export interface DreamCompanyPolicy {
    enabled: boolean;
}

export interface DreamOfferPolicy {
    enabled: boolean;
}

export interface MaxCompaniesPolicy {
    enabled:         boolean;
    maxApplications: number;
}

export interface OfferCategoryPolicy {
    enabled: boolean;
    l1Threshold: number;
    l2Threshold: number;
    l3Threshold: number;
    requiredHikePercentageL2: number;
}

export interface PlacementPercentagePolicy {
    enabled:          boolean;
    targetPercentage: number;
}

export type PolicyType = keyof Policies;

export interface PolicyCheck {
    (student: Student, company: Company, policy: any, ...args: any[]): PolicyResult;
}


// Define extended student type with policy eligibility
export type StudentWithPolicyEligibility = Student & {
    dreamCompanyPolicy: boolean;
    maxCompaniesPolicy: boolean;
    cgpaThresholdPolicy: boolean;
    placementPercentagePolicy: boolean;
    offerCategoryPolicy: boolean;
    dreamOfferPolicy: boolean;
};

export type StudentWithPolicyEligibilityAndReasons =  {
    student: StudentWithPolicyEligibility;
    eligible: boolean;
    reasons: string[];
};


