import apiClient from "@/src/lib/api-client";
import type { PendingInstructorRequest } from "./types";

export async function getPendingInstructorRequests(): Promise<
  PendingInstructorRequest[]
> {
  const { data } = await apiClient.get<PendingInstructorRequest[]>(
    "/instructor-request/pending",
  );
  return data;
}

export async function approveInstructorRequest(id: string): Promise<void> {
  await apiClient.patch(`/instructor-request/admin/${id}/approve`);
}

export async function rejectInstructorRequest(id: string): Promise<void> {
  await apiClient.patch(`/instructor-request/admin/${id}/reject`);
}
