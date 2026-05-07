export enum UserRole {
  STUDENT = 'student',
  LECTURER = 'lecturer',
  ADMIN = 'admin',
  HOD = 'hod',
  FACULTY_OFFICER = 'faculty_officer'
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  matricNumber?: string;
  staffId?: string;
  department?: string;
  faculty?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  unitLoad: number;
  department: string;
  level: string;
  semester: string;
  lecturerIds: string[];
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  lecturerId: string;
  startTime: string;
  endTime: string;
  type: 'qr' | 'manual';
  status: 'active' | 'completed';
  qrCodeValue?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  timestamp: string;
  status: 'present' | 'late' | 'absent';
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceFingerprint?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}
