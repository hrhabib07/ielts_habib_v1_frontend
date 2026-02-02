import { useEffect, useState } from "react";
import { createInstructorRequest, getMyInstructorRequest } from "./api";
import type { InstructorRequestStatus } from "./types";

type UiStatus = InstructorRequestStatus | "NOT_APPLIED";

export function useInstructorRequest() {
  const [status, setStatus] = useState<UiStatus>("NOT_APPLIED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = async () => {
    try {
      const req = await getMyInstructorRequest();
      if (req) {
        setStatus(req.status);
      } else {
        setStatus("NOT_APPLIED");
      }
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    setError(null);
    try {
      await createInstructorRequest();
      setStatus("PENDING");
    } catch {
      setError("Failed to submit instructor request");
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  return { status, loading, error, apply };
}
