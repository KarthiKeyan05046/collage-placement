import { Company, MaxCompaniesPolicy, PolicyResult, Student } from "../types.js";

/**
 * The function `checkMaxCompaniesPolicy` determines if a student is eligible to apply to more
 * companies based on a maximum applications policy.
 * @param {Student} student - The `student` parameter represents a student object with the following
 * properties:
 * @param policy - The `policy` parameter is an object that contains information about the maximum
 * number of applications allowed for a student. It has two properties:
 * @returns The function `checkMaxCompaniesPolicy` returns a `PolicyResult` object, which contains
 * information about whether a student is eligible based on the maximum companies policy. The
 * `PolicyResult` object has two properties: `eligible` (a boolean indicating eligibility) and
 * `reasons` (an array of strings explaining the eligibility status based on the policy criteria).
 */
export function checkMaxCompaniesPolicy(student: Student, policy: { enabled: boolean; maxApplications: number }): PolicyResult {
    if (!policy.enabled) {
      return { eligible: true, reasons: ["✅ Max Companies Policy disabled"] };
    }
    if (!student.isPlaced) {
      return { eligible: true, reasons: ["✅ Student is not placed till now"] };
    }
    const eligible = student.companiesApplied < policy.maxApplications;
    return {
      eligible,
      reasons: eligible
        ? [`✅ Applied to ${student.companiesApplied}, max allowed ${policy.maxApplications}`]
        : [`❌ Applied to ${student.companiesApplied}, exceeds max allowed ${policy.maxApplications}`]
    };
}