import { PlacementPercentagePolicy, PolicyResult, Student } from "../types.js";

/**
 * The function `checkPlacementPercentagePolicy` evaluates if a student meets a placement percentage
 * policy based on current placement percentage and a target percentage.
 * @param {Student} student - The `student` parameter represents a student object with information such
 * as whether the student is placed in a job or not.
 * @param {number} currentPlacementPercentage - The `currentPlacementPercentage` parameter represents
 * the current placement percentage of a student. This percentage is typically calculated based on the
 * number of students who have been successfully placed in jobs or internships compared to the total
 * number of students in a program or course.
 * @param policy - The `policy` parameter in the `checkPlacementPercentagePolicy` function is an object
 * that contains information about the placement percentage policy. It has the following properties:
 * @returns The function `checkPlacementPercentagePolicy` returns a `PolicyResult` object. This object
 * contains two properties:
 */
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