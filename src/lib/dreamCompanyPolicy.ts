import { Company, DreamCompanyPolicy, PolicyResult, Student } from "../types.js";

export function checkDreamCompanyPolicy(student: Student, company: Company, policy: DreamCompanyPolicy): PolicyResult {
    if (!policy.enabled) {
      return { eligible: true, reasons: ["✅ Dream Company Policy disabled"] };
    }
    const eligible = student.dreamCompanyName.toLowerCase() === company.name.toLowerCase();
    return {
      eligible,
      reasons: eligible ? [`✅ Matches student's dream company ${student.dreamCompanyName} and company ${company.name}`] : [`❌ Not student's dream company ${student.dreamCompanyName} and company ${company.name}`]
    };
  }
  