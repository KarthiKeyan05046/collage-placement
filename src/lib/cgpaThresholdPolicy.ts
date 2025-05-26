import { Company, CgpaThresholdPolicy, Student, PolicyResult } from "../types.js";

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