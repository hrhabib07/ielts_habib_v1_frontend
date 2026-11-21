import apiClient from "@/src/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Public learner count for social proof chips (backend `/demo/stats`). */
export async function getDemoStats(): Promise<{
  completions: number;
  registeredStudents?: number;
}> {
  const res = await apiClient.get<
    ApiResponse<{ completions: number; registeredStudents?: number }>
  >("/demo/stats");
  return res.data.data;
}
