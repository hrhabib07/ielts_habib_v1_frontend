import apiClient from "@/src/lib/api-client";
import type { InstructorRequest } from "./types";

// student → create request
export async function createInstructorRequest(): Promise<void> {
  await apiClient.post("/instructor-request/request");
}

// student → check own request
export async function getMyInstructorRequest(): Promise<InstructorRequest | null> {
  try {
    const { data } = await apiClient.get<InstructorRequest>(
      "/instructor-request/request",
    );
    return data;
  } catch {
    return null; // not applied yet
  }
}
