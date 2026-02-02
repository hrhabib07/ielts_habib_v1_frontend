import { useEffect, useState } from "react";
import {
  getPendingInstructorRequests,
  approveInstructorRequest,
  rejectInstructorRequest,
} from "./api";
import type { PendingInstructorRequest } from "./types";

export function useAdminInstructorRequests() {
  const [requests, setRequests] = useState<PendingInstructorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await getPendingInstructorRequests();
      setRequests(data);
    } catch {
      setError("Failed to load instructor requests");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    setActionLoadingId(id);
    try {
      await approveInstructorRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await rejectInstructorRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    approve,
    reject,
    actionLoadingId,
  };
}
