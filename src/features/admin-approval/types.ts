export interface PendingInstructorRequest {
  _id: string;
  userId: string;
  status: "PENDING";
  createdAt: string;
}
