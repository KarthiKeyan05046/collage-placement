import { Company, DreamOfferPolicy, PolicyResult, Student } from "../types.js";

/**
 * The function `checkDreamOfferPolicy` determines if a student is eligible for a dream offer based on
 * company salary and policy settings.
 * @param {Student} student - The `student` parameter represents a student object with information such
 * as whether the student is placed and their dream offer amount.
 * @param {Company} company - Company {
 * @param {DreamOfferPolicy} policy - The `policy` parameter in the `checkDreamOfferPolicy` function
 * represents the Dream Offer Policy that is being checked for eligibility. It contains information
 * about whether the policy is enabled or disabled. If the policy is disabled, the function will return
 * a result indicating that the student is eligible with the reason "
 * @returns The function `checkDreamOfferPolicy` returns a `PolicyResult` object, which contains
 * information about whether the student is eligible for the dream offer policy based on the provided
 * student, company, and policy parameters. The `PolicyResult` object includes a boolean `eligible`
 * field indicating eligibility status and an array of `reasons` explaining the eligibility decision.
 */
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