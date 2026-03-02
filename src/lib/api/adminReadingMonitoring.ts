import apiClient from "../api-client";

const BASE = "/admin/reading/monitoring";
const PROGRESSION_BASE = "/reading/strict-progression";

export interface MonitoringMeta {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
}

export interface FailedStudentItem {
  _id: string;
  userId: string;
  levelId: string;
  versionId: string;
  attemptCount: number;
  passStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestartRequestItem {
  _id: string;
  userId: string;
  levelId: string;
  levelProgressId: string;
  requestReason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermanentLockItem {
  _id: string;
  userId: string;
  levelId: string;
  versionId: string;
  attemptCount: number;
  passStatus: string;
  permanentLock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VersionUsageItem {
  versionId: string;
  version: number;
  status: string;
  progressCount: number;
}

export interface VersionUsageResult {
  levelId: string;
  versions: VersionUsageItem[];
}

function unwrap<T>(res: { data?: { data?: T; meta?: MonitoringMeta } }): {
  data: T;
  meta?: MonitoringMeta;
} {
  const body = res.data;
  if (!body) throw new Error("No response data");
  return { data: body.data as T, meta: body.meta };
}

export async function getFailedStudents(
  page: number,
  limit: number,
): Promise<{ data: FailedStudentItem[]; meta: MonitoringMeta }> {
  const res = await apiClient.get<{
    success: boolean;
    data: FailedStudentItem[];
    meta: MonitoringMeta;
  }>(`${BASE}/failed`, { params: { page, limit } });
  const { data, meta } = unwrap<FailedStudentItem[]>(res);
  if (!meta) throw new Error("Missing meta");
  return { data, meta };
}

export async function getRestartRequests(
  params: { status?: string; page: number; limit: number },
): Promise<{ data: RestartRequestItem[]; meta: MonitoringMeta }> {
  const res = await apiClient.get<{
    success: boolean;
    data: RestartRequestItem[];
    meta: MonitoringMeta;
  }>(`${BASE}/restart-requests`, { params });
  const { data, meta } = unwrap<RestartRequestItem[]>(res);
  if (!meta) throw new Error("Missing meta");
  return { data, meta };
}

export async function getPermanentLocks(
  page: number,
  limit: number,
): Promise<{ data: PermanentLockItem[]; meta: MonitoringMeta }> {
  const res = await apiClient.get<{
    success: boolean;
    data: PermanentLockItem[];
    meta: MonitoringMeta;
  }>(`${BASE}/permanent-locks`, { params: { page, limit } });
  const { data, meta } = unwrap<PermanentLockItem[]>(res);
  if (!meta) throw new Error("Missing meta");
  return { data, meta };
}

export async function getVersionUsage(
  levelId: string,
): Promise<VersionUsageResult> {
  const res = await apiClient.get<{ success: boolean; data: VersionUsageResult }>(
    `${BASE}/version-usage/${levelId}`,
  );
  const body = res.data;
  if (!body?.data) throw new Error("No response data");
  return body.data;
}

export async function approveRestartRequest(requestId: string): Promise<void> {
  await apiClient.post(
    `${PROGRESSION_BASE}/restart-requests/${requestId}/approve`,
  );
}
