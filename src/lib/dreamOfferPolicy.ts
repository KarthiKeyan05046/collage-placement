import { Company, DreamOfferPolicy, PolicyResult, Student } from "../types.js";

export function checkDreamOfferPolicy(student: Student, company: Company, policy: DreamOfferPolicy): PolicyResult {
    if (!policy.enabled) {
      return { eligible: true, reasons: ["✅ Dream Offer Policy disabled"] };
    }
    if (!student.isPlaced) {
      return { eligible: true, reasons: ["✅ Student is not placed"] };
    }
    const eligible = company.offeredSalary >= student.dreamOfferAmount;
    return {
      eligible,
      reasons: eligible
        ? [`✅ Company salary ${company.offeredSalary} meets dream offer ${student.dreamOfferAmount}`]
        : [`❌ Company salary ${company.offeredSalary} below dream offer ${student.dreamOfferAmount}`]
    };
  }