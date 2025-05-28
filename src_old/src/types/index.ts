export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "teacher";
  avatar?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  image?: string;
  status: "upcoming" | "ongoing" | "completed";
}

export interface TrainingPoint {
  id: string;
  userId: string;
  activityId: string;
  points: number;
  semester: string;
  academicYear: string;
  status: "pending" | "approved" | "rejected";
}
