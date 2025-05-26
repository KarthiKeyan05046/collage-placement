import { Company, MaxCompaniesPolicy, PolicyResult, Student } from "../types.js";

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