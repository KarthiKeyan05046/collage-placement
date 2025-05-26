import { Company, DreamCompanyPolicy, PolicyResult, Student } from "../types.js";

/**
 * The function `checkDreamCompanyPolicy` determines if a student is eligible for a dream company
 * policy based on matching the student's dream company with a given company.
 * @param {Student} student - The `student` parameter represents a student object with information such
 * as `dreamCompanyName`.
 * @param {Company} company - The `company` parameter in the `checkDreamCompanyPolicy` function
 * represents the company that the student is interested in working for. It contains information about
 * the company, such as its name and other relevant details.
 * @param {DreamCompanyPolicy} policy - The `policy` parameter in the `checkDreamCompanyPolicy`
 * function represents the DreamCompanyPolicy that specifies whether the policy is enabled or disabled
 * for a particular student and company combination. The function checks if the policy is enabled or
 * disabled and then determines the eligibility of the student for the dream company based on
 * @returns a `PolicyResult` object, which contains information about whether the student is eligible
 * based on the DreamCompanyPolicy. The `eligible` property indicates if the student meets the
 * criteria, and the `reasons` property provides an array of reasons explaining the eligibility status.
 */
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
  