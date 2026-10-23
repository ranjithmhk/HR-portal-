export type Role = 'EMPLOYEE' | 'HR' | 'ADMIN';

export interface User {
  id: string; // e.g. "800338"
  name: string;
  email: string;
  role: Role;
  jobTitle: string;
  department: 'Engineering' | 'Data Science' | 'HR' | 'IT' | 'Executive' | 'Finance';
  avatar?: string;
  phone: string;
  joiningDate: string;
  manager: string;
  workLocation: string; // e.g. "Dallas, TX (US)" or "Hyderabad, TS (IN)"
  status: 'Active' | 'On Leave' | 'Terminated';
  emergencyContactsComplete: boolean;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  lcaWage?: {
    lcaMinimum: number;
    earned: number;
    owedToday: number;
    behindToday: number;
    daysLeft: number;
    status: 'Compliant' | 'Behind' | 'Critical';
    excluded?: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In progress' | 'Submitted' | 'Verified';
  isOverdue?: boolean;
  assignedTo: string;
  commentsCount?: number;
  description?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'CL' | 'SL' | 'LOP' | 'MIXED';
  isHalfDay: boolean;
  halfDayPeriod?: 'First Half' | 'Second Half';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  actionedBy?: string;
  actionedAt?: string;
  hrNote?: string;
  appliedDate: string;
}

export interface AttendanceCorrection {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  firstIn: string;
  lastOut: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface LeaveBalance {
  clTotal: number;
  clUsed: number;
  slTotal: number;
  slUsed: number;
  lopDays: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday' | 'Weekend';
  firstIn: string;
  lastOut: string;
  totalHours: string;
  flags?: string[];
  notes?: string;
}

export interface TimesheetDay {
  day: string;
  date: string;
  regular: number;
  overtime: number;
  notes: string;
  isWeekend?: boolean;
}

export interface TimesheetPeriod {
  id: string;
  periodLabel: string; // e.g. "10/01/2026 - 10/14/2026"
  status: 'Draft' | 'Submitted' | 'Approved';
  totalHours: number;
  submittedAt?: string;
  approvedBy?: string;
  days: TimesheetDay[];
}

export interface ActivityReport {
  id: string;
  type: 'Daily' | 'Weekly' | 'Monthly';
  period: string;
  date: string;
  status: 'Draft' | 'Submitted';
  isAiDraft?: boolean;
  accomplishments: string;
  blockers: string;
  nextPriorities: string;
  transcript?: string;
  attachments?: string[];
  submittedBy: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  description: string;
  amount: number;
  currency: 'INR' | 'USD';
  category: 'Travel' | 'Client Entertainment' | 'Certification' | 'Equipment' | 'Office Supplies';
  isTravel?: boolean;
  hasFlag?: boolean;
  flagReason?: string;
  date: string;
  approvedAmount?: number;
  status: 'Submitted' | 'Approved' | 'Rejected';
  receiptUrl?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Required Documents' | 'HR Documents' | 'Payslips' | 'My Uploads';
  year?: string;
  grossAmount?: string;
  date: string;
  status: 'Verified' | 'Pending review' | 'Rejected';
  fileName: string;
  size: string;
  downloadUrl?: string;
}

export interface HandbookSection {
  id: string;
  title: string;
  category: string;
  content: string;
  charCount: number;
  order: number;
  version: string;
}

export interface SupportRequest {
  id: string; // e.g. "REQ-1049"
  employeeId: string;
  employeeName: string;
  category: 'Payroll & Tax' | 'Benefits & Insurance' | 'IT & Equipment' | 'Visa & Immigration' | 'Workplace';
  subCategory?: string;
  subject: string;
  description: string;
  priority: 'Low — 5 days SLA' | 'Medium — 3 days SLA' | 'High — 24h SLA' | 'Urgent — 4h SLA';
  status: 'Awaiting Your Reply' | 'In Review' | 'Pending HR' | 'Resolved';
  jiraTicket?: string;
  slaRemaining: string;
  handler: string;
  createdDate: string;
  replies: Array<{
    id: string;
    sender: string;
    role: string;
    message: string;
    timestamp: string;
    isInternal?: boolean;
  }>;
}

export interface IssueReport {
  token: string; // e.g. "WB-7829-9182"
  isAnonymous: boolean;
  category: 'Ethics & Compliance' | 'Harassment or Discrimination' | 'Financial Irregularity' | 'Safety' | 'Other';
  subject: string;
  description: string;
  evidenceFiles: string[];
  createdDate: string;
  status: 'Submitted' | 'Under Investigation' | 'Resolved' | 'Closed';
  assignee?: string;
  internalNotes?: string;
  resolution?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  workLocation: string;
  status: 'Pending Offer' | 'Offer Signed' | 'In Progress' | 'Completed';
  tasksProgress: number; // e.g. 12
  tasksTotal: number; // 18
  createdDate: string;
  i9Section2Status: 'Pending' | 'Completed' | 'Not Started';
  offerLetterStatus: 'Pending Admin' | 'Pending Employee' | 'Completed';
  documentsCount: number;
  daysStuck?: number;
}

export interface OfferLetter {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  department: string;
  generatedDate: string;
  status: 'Pending Admin' | 'Pending Employee' | 'Completed';
  salary: string;
  startDate: string;
  location: string;
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  timeAgo: string;
  category: 'General' | 'Announcement' | 'Policy';
  isPinned: boolean;
  title: string;
  body: string;
  imageUrl?: string;
  likes: number;
  userLiked?: boolean;
  comments: Array<{
    id: string;
    author: string;
    avatar?: string;
    timeAgo: string;
    text: string;
  }>;
}

export interface FeedbackEntry {
  id: string;
  author: string; // "Anonymous" or employee name
  category: 'Management' | 'General' | 'Culture' | 'Work Environment';
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface ARInvoice {
  id: string; // "INV-2026-081"
  customer: string;
  total: number;
  outstanding: number;
  dueDate: string;
  isOverdue: boolean;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  issueDate: string;
  items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
}

export interface APBill {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'Pending Approval' | 'Approved' | 'Paid';
  invoiceNumber: string;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTerms: string;
  status: 'Active' | 'Review' | 'Inactive';
  totalBilled: number;
}

export interface AuthorizedSigner {
  id: string;
  name: string;
  email: string;
  title: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export interface HolidayItem {
  id: string;
  title: string;
  date: string;
  day: string;
  type: 'Public' | 'Company';
  location: string;
}

export interface ReviewCycle {
  id: string;
  title: string; // "quarterly · Q1 2026"
  period: string;
  dueDate: string;
  status: 'Action Required' | 'Submitted' | 'Closed';
  selfRating?: number;
  selfAssessment?: string;
  managerRating?: number;
  managerFeedback?: string;
}
