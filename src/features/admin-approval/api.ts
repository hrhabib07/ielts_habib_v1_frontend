import apiClient from "@/src/lib/api-client";
import type { PendingInstructorRequest } from "./types";

export async function getPendingInstructorRequests(): Promise<
  PendingInstructorRequest[]
> {
  const res = await apiClient.get<{ data?: PendingInstructorRequest[] } | PendingInstructorRequest[]>(
    "/instructor-requests/pending",
  );
  if (Array.isArray((res as { data?: PendingInstructorRequest[] }).data)) {
    return (res as { data: PendingInstructorRequest[] }).data;
  }
  if (Array.isArray(res)) return res;
  return [];
}

export async function approveInstructorRequest(id: string): Promise<void> {
  await apiClient.patch(`/instructor-requests/admin/${id}/approve`);
}

export async function rejectInstructorRequest(id: string): Promise<void> {
  await apiClient.patch(`/instructor-requests/admin/${id}/reject`);
}
