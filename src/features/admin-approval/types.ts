export interface PendingInstructorRequest {
  _id: string;
  userId: string | { _id: string; email?: string };
  status: "PENDING";
  createdAt: string;
  message?: string;
}
