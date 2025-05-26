import { Company, Policies, Student, PolicyResult, StudentWithPolicyEligibility, StudentWithPolicyEligibilityAndReasons } from "./types.js";
import {
    checkDreamOfferPolicy,
    checkMaxCompaniesPolicy,
    checkCgpaThresholdPolicy,
    checkPlacementPercentagePolicy,
    checkOfferCategoryPolicy,
    checkDreamCompanyPolicy
} from "./lib/index.js";




// Define policy keys as a union type
type PolicyKey = keyof Omit<StudentWithPolicyEligibility, keyof Student>;

export class PlacementEngine {
    private students: Map<number, Student>;
    private company: Company;
    private policies: Policies;

    constructor(students: Student[], company: Company, policies: Policies) {
        if (!students || !Array.isArray(students) || students.length === 0) {
            throw new Error("Students must be provided as a non-empty array");
        }
        if (!company || !policies) {
            throw new Error("Company and policies must be provided");
        }
        if (!Object.keys(policies).every(key => ['dreamCompanyPolicy', 'maxCompaniesPolicy', 'cgpaThresholdPolicy', 'placementPercentagePolicy', 'offerCategoryPolicy', 'dreamOfferPolicy'].includes(key))) {
            throw new Error("Policies object must contain all required policy keys");
        }

        this.students = new Map(students.map(student => {
            if (!student.id) {
                throw new Error("Each student must have a valid ID");
            }
            return [student.id, { ...student }];
        }));
        this.company = { ...company };
        this.policies = { ...policies };
    }

    private calculatePlacementPercentage(): number {
        const placedStudents = Array.from(this.students.values()).filter(student => student.isPlaced).length;
        return this.students.size > 0 ? (placedStudents / this.students.size) * 100 : 0;
    }

    private getStudentPolicyEligibility(student: Student): StudentWithPolicyEligibility {
        const policyChecks: { key: PolicyKey; check: () => PolicyResult }[] = [
            { key: "dreamCompanyPolicy", check: () => checkDreamCompanyPolicy(student, this.company, this.policies.dreamCompanyPolicy) },
            { key: "maxCompaniesPolicy", check: () => checkMaxCompaniesPolicy(student, this.policies.maxCompaniesPolicy) },
            { key: "cgpaThresholdPolicy", check: () => checkCgpaThresholdPolicy(student, this.company, this.policies.cgpaThresholdPolicy) },
            { key: "placementPercentagePolicy", check: () => checkPlacementPercentagePolicy(student, this.calculatePlacementPercentage(), this.policies.placementPercentagePolicy) },
            { key: "offerCategoryPolicy", check: () => checkOfferCategoryPolicy(student, this.company, this.policies.offerCategoryPolicy) },
            { key: "dreamOfferPolicy", check: () => checkDreamOfferPolicy(student, this.company, this.policies.dreamOfferPolicy) }
        ];

        const eligibility: StudentWithPolicyEligibility = {
            ...student,
            dreamCompanyPolicy: false,
            maxCompaniesPolicy: false,
            cgpaThresholdPolicy: false,
            placementPercentagePolicy: false,
            offerCategoryPolicy: false,
            dreamOfferPolicy: false
        };

        let failed = false;

        for (const policy of policyChecks) {
            if (!failed) {
                const result = policy.check();
                eligibility[policy.key] = result.eligible;
                if (!result.eligible) {
                    failed = true;
                }
            } else {
                eligibility[policy.key] = false;
            }
        }

        return eligibility;
    }

    public processPlacements(): Map<number, PolicyResult> {
        const results = new Map<number, PolicyResult>();
        
        for (const [studentId, student] of this.students) {
            const result = this.checkStudentEligibility(student);
            results.set(studentId, result);
        }

        return results;
    }

    private checkStudentEligibility(student: Student): PolicyResult {
        const reasons: string[] = [];
        let eligible = true;

        const policyChecks = [
            { name: "DreamCompanyPolicy", key: "dreamCompanyPolicy", check: () => checkDreamCompanyPolicy(student, this.company, this.policies.dreamCompanyPolicy) },
            { name: "MaxCompaniesPolicy", key: "maxCompaniesPolicy", check: () => checkMaxCompaniesPolicy(student, this.policies.maxCompaniesPolicy) },
            { name: "CgpaThresholdPolicy", key: "cgpaThresholdPolicy", check: () => checkCgpaThresholdPolicy(student, this.company, this.policies.cgpaThresholdPolicy) },
            { name: "PlacementPercentagePolicy", key: "placementPercentagePolicy", check: () => checkPlacementPercentagePolicy(student, this.calculatePlacementPercentage(), this.policies.placementPercentagePolicy) },
            { name: "OfferCategoryPolicy", key: "offerCategoryPolicy", check: () => checkOfferCategoryPolicy(student, this.company, this.policies.offerCategoryPolicy) },
            { name: "DreamOfferPolicy", key: "dreamOfferPolicy", check: () => checkDreamOfferPolicy(student, this.company, this.policies.dreamOfferPolicy) }
        ];

        // Special case: Dream Company Policy can override others if eligible
        const dreamCompanyCheck = policyChecks.find(p => p.key === "dreamCompanyPolicy")!.check();
        if (dreamCompanyCheck.eligible && this.policies.dreamCompanyPolicy.enabled) {
            return {
                eligible: true,
                reasons: dreamCompanyCheck.reasons
            };
        }

        for (const policy of policyChecks) {
            if (policy.key === "dreamCompanyPolicy") continue; // Skip if already checked
            const result = policy.check();
            if (!result.eligible) {
                eligible = false;
                reasons.push(...result.reasons);
                return { eligible, reasons };
            }
            reasons.push(...result.reasons);
        }

        if (eligible && reasons.length === 0) {
            reasons.push("Eligible by default policy");
        }

        return { eligible, reasons };
    }

    public getEligibleStudents(): StudentWithPolicyEligibilityAndReasons[] {
       const allStudents = this.getAllStudents();
       return allStudents.filter(student => student.eligible === true);
    }
    public getAllStudents(): StudentWithPolicyEligibilityAndReasons[] {
        const results = this.processPlacements();
        return Array.from(this.students.values())
            .map(student => {
                return {
                    student: this.getStudentPolicyEligibility(student),
                    eligible: results.get(student.id)?.eligible ?? false,
                    reasons: results.get(student.id)?.reasons || []
                }
            });
    }

    public getIneligibleStudents(): StudentWithPolicyEligibilityAndReasons[] {
        const allStudents = this.getAllStudents();
        return allStudents.filter(student => student.eligible === false);
    }

    public updatePlacementStatus(studentId: number): void {
        const student = this.students.get(studentId);

        if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
        }

        const result = this.checkStudentEligibility(student);
        if (result.eligible) {
            student.isPlaced = true;
            student.currentSalary = this.company.offeredSalary;
            student.companiesApplied += 1;
        } else {
            throw new Error(`Student ${studentId} is not eligible for ${this.company.name}: ${result.reasons.join(", ")}`);
        }
    }

    public getCompany(): Company {
        return { ...this.company };
    }

    public updatePolicies(newPolicies: Partial<Policies>): void {
        this.policies = { ...this.policies, ...newPolicies };
    }

    public getPolicyWiseData(): Array<{
        policyKey: string;
        policy: string;
        eligible: boolean;
        eligiblePercentage: number;
        inEligiblePercentage: number;
        eligibleStudents: number[];
        inEligibleStudents: number[];
    }> {
        const results = this.processPlacements();
        const policyStats = new Map<string, {
            eligible: number;
            ineligible: number;
            eligibleStudents: number[];
            ineligibleStudents: number[];
        }>();

        const policies = [
            { name: "DreamCompanyPolicy", key: "dreamCompanyPolicy" },
            { name: "MaxCompaniesPolicy", key: "maxCompaniesPolicy" },
            { name: "CgpaThresholdPolicy", key: "cgpaThresholdPolicy" },
            { name: "PlacementPercentagePolicy", key: "placementPercentagePolicy" },
            { name: "OfferCategoryPolicy", key: "offerCategoryPolicy" },
            { name: "DreamOfferPolicy", key: "dreamOfferPolicy" }
        ];

        // Initialize stats for each policy
        policies.forEach(policy => {
            policyStats.set(policy.key, {
                eligible: 0,
                ineligible: 0,
                eligibleStudents: [],
                ineligibleStudents: []
            });
        });

        // Process each student's results
        for (const [studentId, result] of results) {
            const student = this.students.get(studentId)!;
            let failed = false;

            const policyChecks = [
                { key: "dreamCompanyPolicy", check: () => checkDreamCompanyPolicy(student, this.company, this.policies.dreamCompanyPolicy) },
                { key: "maxCompaniesPolicy", check: () => checkMaxCompaniesPolicy(student, this.policies.maxCompaniesPolicy) },
                { key: "cgpaThresholdPolicy", check: () => checkCgpaThresholdPolicy(student, this.company, this.policies.cgpaThresholdPolicy) },
                { key: "placementPercentagePolicy", check: () => checkPlacementPercentagePolicy(student, this.calculatePlacementPercentage(), this.policies.placementPercentagePolicy) },
                { key: "offerCategoryPolicy", check: () => checkOfferCategoryPolicy(student, this.company, this.policies.offerCategoryPolicy) },
                { key: "dreamOfferPolicy", check: () => checkDreamOfferPolicy(student, this.company, this.policies.dreamOfferPolicy) }
            ];

            for (const policy of policyChecks) {
                const stats = policyStats.get(policy.key)!;
                const policyResult = policy.check();

                if (!policyResult.eligible && !failed) {
                    stats.ineligible += 1;
                    stats.ineligibleStudents.push(studentId);
                    failed = true;
                } else if (!failed) {
                    stats.eligible += 1;
                    stats.eligibleStudents.push(studentId);
                }
            }
        }

        // Convert to requested format
        return policies.map(({ key, name }) => {
            const stats = policyStats.get(key)!;
            const total = stats.eligible + stats.ineligible;
            const eligiblePercentage = total > 0 ? (stats.eligible / total) * 100 : 0;
            const inEligiblePercentage = total > 0 ? (stats.ineligible / total) * 100 : 0;

            return {
                policyKey: key,
                policy: name,
                eligible: stats.eligible > 0,
                eligiblePercentage: Number(eligiblePercentage.toFixed(2)),
                inEligiblePercentage: Number(inEligiblePercentage.toFixed(2)),
                eligibleStudents: stats.eligibleStudents,
                inEligibleStudents: stats.ineligibleStudents
            };
        });
    }

    public outputData() {
        const allStudents = this.getAllStudents();
        const eligibleStudents = allStudents.filter(student => student.eligible === true);
        const ineligibleStudents = allStudents.filter(student => student.eligible === false);
        const totalStudents = this.students.size;
        const placedStudents = allStudents.filter(student => student.student.isPlaced === true).length;
        const unPlacedStudents = allStudents.filter(student => student.student.isPlaced === false).length;
        const unPlacedStudentsPercentage = totalStudents > 0 ? (unPlacedStudents / totalStudents) * 100 : 0;
        const placedStudentsPercentage = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;
        const eligibleStudentsPercentage = totalStudents > 0 ? (eligibleStudents.length / totalStudents) * 100 : 0;
        const ineligibleStudentsPercentage = totalStudents > 0 ? (ineligibleStudents.length / totalStudents) * 100 : 0;
        const company = this.getCompany();
        
        return {
            allStudents: allStudents,
            eligibleStudents: eligibleStudents,
            ineligibleStudents: ineligibleStudents,
            policyWiseData: this.getPolicyWiseData(),
            company: company,
            totalStudents,
            unPlacedStudents,
            placedStudents,
            unPlacedStudentsPercentage,
            placedStudentsPercentage,
            eligibleStudentsPercentage,
            ineligibleStudentsPercentage,
            placement: {
                totalStudents: allStudents.length,
                placedStudents: placedStudents,
                placementPercentage: placedStudentsPercentage,
                unPlacedStudents: unPlacedStudents,
                unPlacedStudentsPercentage: unPlacedStudentsPercentage,
                placedStudentsPercentage: placedStudentsPercentage,
            }
        };
    }
}