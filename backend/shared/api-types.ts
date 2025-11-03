import { ClassData, SpecialFunctionData } from "./types";

/**
 * Interfaces for profile API endpoints
 *
 */
export interface CreateProfileRequestData {
  classData: ClassData;
  specialFunctionData: SpecialFunctionData;
}
