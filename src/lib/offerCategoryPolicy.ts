import { Company, OfferCategoryPolicy, PolicyResult, Student } from "../types.js";

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