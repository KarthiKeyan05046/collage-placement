import { PlacementPercentagePolicy, PolicyResult, Student } from "../types.js";

export function checkPlacementPercentagePolicy(student: Student, currentPlacementPercentage: number, policy: { enabled: boolean; targetPercentage: number }): PolicyResult {
    if (!policy.enabled) {
      return { eligible: true, reasons: ["✅ Placement Percentage Policy disabled"] };
    }
    if (!student.isPlaced) {
      return { eligible: true, reasons: ["✅ Student is not placed"] };
    }
    const eligible = currentPlacementPercentage >= policy.targetPercentage;
    return {
      eligible,
      reasons: eligible
        ? [`✅ Placement percentage ${currentPlacementPercentage.toFixed(2)}% meets target ${policy.targetPercentage}%`]
        : [`❌ Placement percentage ${currentPlacementPercentage.toFixed(2)}% below target ${policy.targetPercentage}%`]
    };
  }