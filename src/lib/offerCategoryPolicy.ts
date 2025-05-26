import { Company, OfferCategoryPolicy, PolicyResult, Student } from "../types.js";

/**
 * The function `checkOfferCategoryPolicy` determines if a student is eligible for a job offer based on
 * their current salary category and company offer.
 * @param {Student} student - The `student` parameter represents a student object with information such
 * as current salary and placement status.
 * @param {Company} company - The `company` parameter represents the company for which you are checking
 * the offer category policy. It likely contains information such as the offered salary to the student.
 * @param {OfferCategoryPolicy} policy - The `policy` parameter in the `checkOfferCategoryPolicy`
 * function represents an Offer Category Policy that defines certain criteria and thresholds related to
 * student salaries and offer categories. This policy is used to determine if a student is eligible to
 * apply for a job offer from a company based on their current salary category and
 * @returns The function `checkOfferCategoryPolicy` returns a `PolicyResult` object, which contains
 * information about the eligibility of a student to apply for a job offer based on the offer category
 * policy. The `PolicyResult` object includes a boolean `eligible` field indicating whether the student
 * is eligible, and a `reasons` field providing an array of reasons explaining the eligibility status.
 */
export function checkOfferCategoryPolicy(student: Student, company: Company, policy: OfferCategoryPolicy): PolicyResult {
    if (!policy.enabled) {
      return { eligible: true, reasons: ["✅ Offer Category Policy disabled"] };
    }
    if (!student.isPlaced) {
      return { eligible: true, reasons: ["✅ Student is not placed"] };
    }
  
    const getCategory = (salary: number) => {
      if (salary >= policy.l1Threshold) return "L1";
      if (salary >= policy.l2Threshold) return "L2";
      return "L3";
    };
  
    const currentCategory = getCategory(student.currentSalary);
    if (currentCategory === "L1") {
      return { eligible: false, reasons: ["❌ Student in L1 category cannot apply to other companies"] };
    }
  
    if (currentCategory === "L2") {
      const requiredSalary = student.currentSalary * (1 + policy.requiredHikePercentageL2 / 100);
      const eligible = company.offeredSalary >= requiredSalary;
      return {
        eligible,
        reasons: eligible
          ? [`✅ Company salary ${company.offeredSalary} meets required hike for L2 student`]
          : [`❌ Company salary ${company.offeredSalary} below required ${requiredSalary} for L2 student`]
      };
    }
  
    return { eligible: true, reasons: ["✅ L3 student, no restrictions from Offer Category Policy"] };
  }