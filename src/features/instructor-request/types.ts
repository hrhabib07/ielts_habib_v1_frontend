export type InstructorRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface InstructorRequest {
  _id: string;
  status: InstructorRequestStatus;
  createdAt: string;
}
