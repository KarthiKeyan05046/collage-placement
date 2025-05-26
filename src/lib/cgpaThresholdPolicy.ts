
import { Company, CgpaThresholdPolicy, Student, PolicyResult } from "../types.js";

/**
 * The function `checkCgpaThresholdPolicy` determines a student's eligibility for a company based on
 * CGPA threshold policy.
 * @param {Student} student - The `student` parameter represents a student object with information such
 * as their CGPA (Cumulative Grade Point Average).
 * @param {Company} company - The `company` parameter represents the company for which the CGPA
 * threshold policy is being checked. It likely contains information about the company, such as the
 * offered salary for a position.
 * @param {CgpaThresholdPolicy} policy - The `checkCgpaThresholdPolicy` function takes in three
 * parameters:
 * @returns The function `checkCgpaThresholdPolicy` returns a `PolicyResult` object. This object
 * contains two properties:
 * 1. `eligible`: A boolean value indicating whether the student meets the CGPA threshold policy
 * criteria.
 * 2. `reasons`: An array of strings providing reasons for the eligibility determination, such as
 * whether the policy is enabled, the company salary meets the threshold, and whether the student
 */
export function checkCgpaThresholdPolicy(student: Student, company: Company, policy: CgpaThresholdPolicy): PolicyResult {
    if (!policy.enabled) {
      return { eligible: true, reasons: ["✅ CGPA Threshold Policy disabled"] };
    }
    if (company.offeredSalary < policy.highSalaryThreshold) {
      return { eligible: true, reasons: ["✅ Company salary below high-salary threshold"] };
    }
    const eligible = student.cgpa >= policy.minCgpa;
    return {
      eligible,
      reasons: eligible
        ? [`✅ CGPA ${student.cgpa} meets threshold ${policy.minCgpa}`]
        : [`❌ CGPA ${student.cgpa} below threshold ${policy.minCgpa}`]
    };
  }