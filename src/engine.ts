
import {
  Company,
  Policies,
  Student,
  PolicyResult,
  StudentWithPolicyEligibility,
  StudentWithPolicyEligibilityAndReasons
} from "./types.js";
import {
  checkDreamOfferPolicy,
  checkMaxCompaniesPolicy,
  checkCgpaThresholdPolicy,
  checkPlacementPercentagePolicy,
  checkOfferCategoryPolicy,
  checkDreamCompanyPolicy
} from "./lib/index.js";
import { fetchPoliciesFromRemoteUrl } from "./lib/fetchPolicies.js";

// Define policy keys as a union type
type PolicyKey = keyof Omit<StudentWithPolicyEligibility, keyof Student>;

const POLICY_CONFIG = [
  { name: "Dream Company", key: "dreamCompanyPolicy", checker: checkDreamCompanyPolicy },
  { name: "Max Companies", key: "maxCompaniesPolicy", checker: checkMaxCompaniesPolicy },
  { name: "CGPA Threshold", key: "cgpaThresholdPolicy", checker: checkCgpaThresholdPolicy },
  { name: "Placement Percentage Policy", key: "placementPercentagePolicy", checker: checkPlacementPercentagePolicy },
  { name: "Offer Category Policy", key: "offerCategoryPolicy", checker: checkOfferCategoryPolicy },
  { name: "Dream Offer Policy", key: "dreamOfferPolicy", checker: checkDreamOfferPolicy }
] as const;

const REQUIRED_POLICY_KEYS = POLICY_CONFIG.map(p => p.key);

export class PlacementEngine {
  private students: Map<number, Student>;
  private company: Company;
  private policies: Policies;

  private constructor(students: Student[], company: Company, policies: Policies) {
    this.validateInputs(students, company, policies);
    this.students = new Map(students.map(student => {
      this.validateStudent(student);
      return [student.id, { ...student }];
    }));
    this.company = { ...company };
    this.policies = { ...policies };
  }

  /**
   * Factory method to support both object and remote URL for policies.
   */
  static async create(
    students: Student[] = [],
    company: Company,
    policies: Policies | string = {} as Policies
  ): Promise<PlacementEngine> {
    let loadedPolicies: Policies;
    

    if (typeof policies === "string") {
      try {
        const data = await fetchPoliciesFromRemoteUrl(policies);
        console.log(data);
        loadedPolicies = data as Policies;
      } catch (error) {
        throw new Error(`Failed to fetch policies from URL: ${error}`);
      }
    } else {
      loadedPolicies = policies;
    }

    return new PlacementEngine(students, company, loadedPolicies);
  }

  private validateInputs(students: Student[], company: Company, policies: Policies): void {
    if (!students || !Array.isArray(students) || students.length === 0) {
      throw new Error("Students must be provided as a non-empty array");
    }
    if (!company || !policies) {
      throw new Error("Company and policies must be provided");
    }
    if (!this.validatePoliciesObject(policies)) {
      throw new Error(`Policies object must contain all required policy keys: ${REQUIRED_POLICY_KEYS.join(', ')}`);
    }
  }

  private validateStudent(student: Student): void {
    if (!student.id) {
      throw new Error("Each student must have a valid ID");
    }
  }

  private validatePoliciesObject(policies: Policies): boolean {
    return REQUIRED_POLICY_KEYS.every(key => key in policies);
  }

  private calculatePlacementPercentage(): number {
    const placedStudents = Array.from(this.students.values()).filter(student => student.isPlaced).length;
    return this.students.size > 0 ? (placedStudents / this.students.size) * 100 : 0;
  }

  private createPolicyCheck(student: Student, policyConfig: typeof POLICY_CONFIG[number]): () => PolicyResult {
    const { key, checker } = policyConfig;

    switch (key) {
      case "dreamCompanyPolicy":
        return () => checker(student, this.company, this.policies[key]);
      case "maxCompaniesPolicy":
        return () => checker(student, this.policies[key]);
      case "cgpaThresholdPolicy":
        return () => checker(student, this.company, this.policies[key]);
      case "placementPercentagePolicy":
        return () => checker(student, this.calculatePlacementPercentage(), this.policies[key]);
      case "offerCategoryPolicy":
        return () => checker(student, this.company, this.policies[key]);
      case "dreamOfferPolicy":
        return () => checker(student, this.company, this.policies[key]);
      default:
        throw new Error(`Unknown policy key: ${key}`);
    }
  }


    private getStudentPolicyEligibility(student: Student): StudentWithPolicyEligibility {
        const eligibility: StudentWithPolicyEligibility = {
            ...student,
            ...Object.fromEntries(REQUIRED_POLICY_KEYS.map(key => [key, false]))
        } as StudentWithPolicyEligibility;

        let failed = false;

        for (const policyConfig of POLICY_CONFIG) {
            if (!failed) {
                const check = this.createPolicyCheck(student, policyConfig);
                const result = check();
                eligibility[policyConfig.key] = result.eligible;
                if (!result.eligible) {
                    failed = true;
                }
            } else {
                eligibility[policyConfig.key] = false;
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
        // Special case: Dream Company Policy can override others if eligible
        const dreamCompanyCheck = this.createPolicyCheck(student, POLICY_CONFIG[0])();
        if (dreamCompanyCheck.eligible && this.policies.dreamCompanyPolicy.enabled) {
            return {
                eligible: true,
                reasons: dreamCompanyCheck.reasons
            };
        }

        const reasons: string[] = [];
        
        // Check remaining policies (skip dream company policy as it's already checked)
        for (const policyConfig of POLICY_CONFIG.slice(1)) {
            const check = this.createPolicyCheck(student, policyConfig);
            const result = check();
            
            if (!result.eligible) {
                return {
                    eligible: false,
                    reasons: [...reasons, ...result.reasons]
                };
            }
            reasons.push(...result.reasons);
        }

        return {
            eligible: true,
            reasons: reasons.length > 0 ? reasons : ["Eligible by default policy"]
        };
    }

    public getEligibleStudents(): StudentWithPolicyEligibilityAndReasons[] {
        return this.getAllStudents().filter(student => student.eligible === true);
    }

    public getAllStudents(): StudentWithPolicyEligibilityAndReasons[] {
        const results = this.processPlacements();
        
        return Array.from(this.students.values()).map(student => ({
            student: this.getStudentPolicyEligibility(student),
            eligible: results.get(student.id)?.eligible ?? false,
            reasons: results.get(student.id)?.reasons || []
        }));
    }

    public getIneligibleStudents(): StudentWithPolicyEligibilityAndReasons[] {
        return this.getAllStudents().filter(student => student.eligible === false);
    }

    public updatePlacementStatus(studentId: number): void {
        const student = this.students.get(studentId);

        if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
        }

        const result = this.checkStudentEligibility(student);
        if (!result.eligible) {
            throw new Error(`Student ${studentId} is not eligible for ${this.company.name}: ${result.reasons.join(", ")}`);
        }

        student.isPlaced = true;
        student.currentSalary = this.company.offeredSalary;
        student.companiesApplied += 1;
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
        const policyStats = this.initializePolicyStats();

        this.processPolicyStats(results, policyStats);

        return this.formatPolicyStats(policyStats);
    }

    private initializePolicyStats(): Map<string, {
        eligible: number;
        ineligible: number;
        eligibleStudents: number[];
        ineligibleStudents: number[];
    }> {
        const policyStats = new Map();
        
        POLICY_CONFIG.forEach(policy => {
            policyStats.set(policy.key, {
                eligible: 0,
                ineligible: 0,
                eligibleStudents: [],
                ineligibleStudents: []
            });
        });

        return policyStats;
    }

    private processPolicyStats(
        results: Map<number, PolicyResult>,
        policyStats: Map<string, {
            eligible: number;
            ineligible: number;
            eligibleStudents: number[];
            ineligibleStudents: number[];
        }>
    ): void {
        for (const [studentId] of results) {
            const student = this.students.get(studentId)!;
            let failed = false;

            for (const policyConfig of POLICY_CONFIG) {
                const stats = policyStats.get(policyConfig.key)!;
                const check = this.createPolicyCheck(student, policyConfig);
                const policyResult = check();

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
    }

    private formatPolicyStats(policyStats: Map<string, {
        eligible: number;
        ineligible: number;
        eligibleStudents: number[];
        ineligibleStudents: number[];
    }>): Array<{
        policyKey: string;
        policy: string;
        eligible: boolean;
        eligiblePercentage: number;
        inEligiblePercentage: number;
        eligibleStudents: number[];
        inEligibleStudents: number[];
    }> {
        return POLICY_CONFIG.map(({ key, name }) => {
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

    private getStudentStates() {
        const allStudents = this.getAllStudents()
        const placedStudents = allStudents.filter(student => student.student.isPlaced === true);
        const unPlacedStudents = allStudents.filter(student => student.student.isPlaced === false);
        const eligibleStudents = allStudents.filter(student => student.eligible === true);
        const ineligibleStudents = allStudents.filter(student => student.eligible === false);

        return {
            allStudents,
            placedStudents,
            unPlacedStudents,
            eligibleStudents,
            ineligibleStudents
        };
    }

    private calculatePercentages(states: ReturnType<typeof this.getStudentStates>) {
        const { allStudents, placedStudents, unPlacedStudents, eligibleStudents, ineligibleStudents } = states;
        const totalStudents = allStudents.length;
        return {
            unPlacedStudentsPercentage: totalStudents > 0 ? (unPlacedStudents.length / totalStudents) * 100 : 0,
            placedStudentsPercentage: totalStudents > 0 ? (placedStudents.length / totalStudents) * 100 : 0,
            eligibleStudentsPercentage: totalStudents > 0 ? (eligibleStudents.length / totalStudents) * 100 : 0,
            ineligibleStudentsPercentage: totalStudents > 0 ? (ineligibleStudents.length / totalStudents) * 100 : 0
        };
    }

    public getSummaryReport() {
        const states = this.getStudentStates();
        const percentages = this.calculatePercentages(states);
        const company = this.getCompany();
        return {
            data: {
                allStudents: states.allStudents,
                eligibleStudents: states.eligibleStudents,
                ineligibleStudents: states.ineligibleStudents,
                placedStudents: states.placedStudents,
                unPlacedStudents: states.unPlacedStudents,
            },
            company,
            policyWiseData: this.getPolicyWiseData(),
            percentages,
            counts: {
                totalStudents: states.allStudents.length,
                placedStudents: states.placedStudents.length,
                unPlacedStudents: states.unPlacedStudents.length,
                eligibleStudents: states.eligibleStudents.length,
                ineligibleStudents: states.ineligibleStudents.length,
            }
        };
    }
}