import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  User,
  Task,
  LeaveRequest,
  LeaveBalance,
  AttendanceRecord,
  TimesheetPeriod,
  ActivityReport,
  ExpenseClaim,
  DocumentItem,
  HandbookSection,
  SupportRequest,
  IssueReport,
  Candidate,
  OfferLetter,
  FeedPost,
  FeedbackEntry,
  ARInvoice,
  APBill,
  Vendor,
  AuthorizedSigner,
  HolidayItem,
  ReviewCycle,
  AttendanceCorrection,
} from '../types';
import {
  initialUsers,
  initialLeaveBalance,
  initialLeaveRequests,
  initialAttendanceRecords,
  initialTasks,
  initialTimesheets,
  initialActivityReports,
  initialExpenses,
  initialDocuments,
  initialHandbookSections,
  initialSupportRequests,
  initialIssueReports,
  initialCandidates,
  initialOfferLetters,
  initialFeedPosts,
  initialFeedback,
  initialARInvoices,
  initialAPBills,
  initialVendors,
  initialAuthorizedSigners,
  initialHolidays,
  initialReviewCycles,
} from '../data/mockData';

interface StoreContextType {
  currentUser: User;
  currentRole: Role;
  switchRole: (role: Role) => void;
  users: User[];
  addUser: (user: Partial<User>) => void;
  removeUser: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  isClockedIn: boolean;
  clockInTime: string | null;
  clockIn: () => void;
  clockOut: () => void;
  attendanceCorrections: AttendanceCorrection[];
  submitAttendanceCorrection: (req: Omit<AttendanceCorrection, 'id' | 'status' | 'submittedAt'>) => void;

  // Tasks
  tasks: Task[];
  toggleTaskStatus: (id: string) => void;
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  // Leaves
  leaveBalance: LeaveBalance;
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  cancelLeaveRequest: (id: string) => void;
  approveLeaveRequest: (id: string, hrNote?: string) => void;
  rejectLeaveRequest: (id: string, hrNote?: string) => void;

  // Timesheets
  timesheets: TimesheetPeriod[];
  updateTimesheetDay: (periodId: string, date: string, regular: number, overtime: number, notes: string) => void;
  submitTimesheet: (periodId: string) => void;
  approveTimesheet: (periodId: string) => void;

  // Activity Reports
  activityReports: ActivityReport[];
  submitActivityReport: (report: Omit<ActivityReport, 'id' | 'date'>) => void;

  // Expenses
  expenses: ExpenseClaim[];
  submitExpenseClaim: (claim: Omit<ExpenseClaim, 'id' | 'date' | 'status'>) => void;
  approveExpense: (id: string, approvedAmount?: number) => void;
  rejectExpense: (id: string, reason?: string) => void;

  // Documents
  documents: DocumentItem[];
  uploadDocument: (doc: Omit<DocumentItem, 'id' | 'date' | 'status'>) => void;
  verifyDocument: (id: string, status: 'Verified' | 'Rejected') => void;

  // Handbook
  handbookSections: HandbookSection[];
  handbookDraftSections: HandbookSection[];
  handbookVersion: string;
  isHandbookAcknowledged: boolean;
  acknowledgeHandbook: () => void;
  updateDraftSection: (id: string, title: string, content: string) => void;
  addDraftSection: (title: string, content: string, category: string) => void;
  deleteDraftSection: (id: string) => void;
  publishHandbookDraft: () => void;

  // Requests
  supportRequests: SupportRequest[];
  submitSupportRequest: (req: Omit<SupportRequest, 'id' | 'createdDate' | 'status' | 'replies' | 'slaRemaining' | 'handler'>) => void;
  addRequestReply: (requestId: string, message: string) => void;
  updateRequestStatus: (requestId: string, status: SupportRequest['status']) => void;

  // Whistleblower / Issues
  issueReports: IssueReport[];
  submitIssueReport: (report: Omit<IssueReport, 'token' | 'createdDate' | 'status'>) => string;
  updateIssueStatus: (token: string, status: IssueReport['status'], internalNotes?: string, resolution?: string) => void;

  // Candidates & Onboarding
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdDate' | 'tasksProgress' | 'tasksTotal' | 'documentsCount'>) => void;
  updateCandidateProgress: (id: string, progress: number) => void;
  verifyCandidateI9: (id: string) => void;

  // Offer Letters
  offerLetters: OfferLetter[];
  generateOfferLetter: (letter: Omit<OfferLetter, 'id' | 'generatedDate' | 'status'>) => void;
  approveOfferLetter: (id: string) => void;

  // Feed & Announcements
  feedPosts: FeedPost[];
  likePost: (id: string) => void;
  addCommentToPost: (postId: string, text: string) => void;
  createPost: (post: { title: string; body: string; category: FeedPost['category']; isPinned: boolean; imageUrl?: string }) => void;
  deletePost: (id: string) => void;

  // Feedback
  feedbackList: FeedbackEntry[];
  submitFeedback: (feedback: Omit<FeedbackEntry, 'id' | 'date'>) => void;

  // Accounting
  invoices: ARInvoice[];
  createInvoice: (inv: Omit<ARInvoice, 'id' | 'issueDate' | 'isOverdue' | 'status'>) => void;
  recordInvoicePayment: (id: string, amount: number) => void;
  bills: APBill[];
  approveBill: (id: string) => void;
  payBill: (id: string) => void;
  vendors: Vendor[];
  addVendor: (v: Omit<Vendor, 'id' | 'totalBilled'>) => void;
  authorizedSigners: AuthorizedSigner[];
  addSigner: (signer: Omit<AuthorizedSigner, 'id' | 'createdDate'>) => void;
  toggleSignerStatus: (id: string) => void;

  // Holidays
  holidays: HolidayItem[];
  addHoliday: (h: Omit<HolidayItem, 'id'>) => void;

  // Reviews
  reviewCycles: ReviewCycle[];
  submitSelfReview: (cycleId: string, rating: number, assessment: string) => void;

  // Emergency contact warning banner
  emergencyBannerDismissed: boolean;
  dismissEmergencyBanner: () => void;
  restoreEmergencyBanner: () => void;

  // UI state
  aiAssistantOpen: boolean;
  toggleAiAssistant: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('EMPLOYEE');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);

  // Dark mode with system preference fallback and colorScheme sync
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mhk_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('mhk_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('mhk_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Switch Role
  const switchRole = (role: Role) => {
    setCurrentRole(role);
    if (role === 'EMPLOYEE') {
      setCurrentUser(users.find(u => u.id === '800338') || users[0]);
    } else if (role === 'HR') {
      setCurrentUser(users.find(u => u.id === '800102') || users[1]);
    } else {
      setCurrentUser(users.find(u => u.id === '800001') || users[2]);
    }
  };

  const addUser = (newUser: Partial<User>) => {
    const id = (800400 + users.length + 1).toString();
    const created: User = {
      id,
      name: newUser.name || 'New Employee',
      email: newUser.email || `employee.${id}@mhktechinc.com`,
      role: newUser.role || 'EMPLOYEE',
      jobTitle: newUser.jobTitle || 'Associate Engineer',
      department: newUser.department || 'Engineering',
      phone: newUser.phone || '+1 (469) 555-0100',
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      manager: newUser.manager || 'Marcus Chen',
      workLocation: newUser.workLocation || 'Dallas, TX (US)',
      status: 'Active',
      emergencyContactsComplete: true,
    };
    setUsers(prev => [created, ...prev]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [clockInTime, setClockInTime] = useState<string | null>('09:18 AM');
  const [attendanceCorrections, setAttendanceCorrections] = useState<AttendanceCorrection[]>([
    {
      id: 'AC-101',
      employeeId: '800338',
      employeeName: 'Sarah Jenkins',
      date: '2026-10-15',
      firstIn: '09:20',
      lastOut: '18:45',
      reason: 'Turnstile badge reader timed out at main entrance',
      status: 'Approved',
      submittedAt: '2026-10-15',
    },
  ]);

  const submitAttendanceCorrection = (req: Omit<AttendanceCorrection, 'id' | 'status' | 'submittedAt'>) => {
    const newCorr: AttendanceCorrection = {
      ...req,
      id: `AC-${Math.floor(102 + Math.random() * 50)}`,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setAttendanceCorrections(prev => [newCorr, ...prev]);
  };

  const clockIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsClockedIn(true);
    setClockInTime(timeStr);
    setAttendance(prev => [
      {
        id: `att-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        status: 'Present',
        firstIn: timeStr,
        lastOut: '--',
        totalHours: '0h 01m',
        notes: 'Punched in via MHK Portal',
      },
      ...prev,
    ]);
  };

  const clockOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsClockedIn(false);
    setAttendance(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0] = { ...copy[0], lastOut: timeStr, totalHours: '8h 45m' };
      }
      return copy;
    });
  };

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === 'Verified' ? 'Pending' : t.status === 'Submitted' ? 'Verified' : 'Submitted';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: `TSK-${Math.floor(420 + Math.random() * 100)}`,
      title: task.title || 'Untitled Task',
      project: task.project || 'General Operations',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      priority: task.priority || 'Medium',
      status: 'Pending',
      isOverdue: false,
      assignedTo: task.assignedTo || currentUser.id,
      commentsCount: 0,
      description: task.description,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Leaves
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(initialLeaveBalance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

  const submitLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `LR-${Math.floor(1110 + Math.random() * 50)}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setLeaveRequests(prev => [newReq, ...prev]);

    // deduct from balance
    if (req.type === 'CL') {
      setLeaveBalance(b => ({ ...b, clUsed: b.clUsed + req.days }));
    } else if (req.type === 'SL') {
      setLeaveBalance(b => ({ ...b, slUsed: b.slUsed + req.days }));
    } else if (req.type === 'LOP') {
      setLeaveBalance(b => ({ ...b, lopDays: b.lopDays + req.days }));
    }
  };

  const cancelLeaveRequest = (id: string) => {
    setLeaveRequests(prev => {
      const target = prev.find(r => r.id === id);
      if (target && target.status === 'Pending') {
        if (target.type === 'CL') {
          setLeaveBalance(b => ({ ...b, clUsed: Math.max(0, b.clUsed - target.days) }));
        } else if (target.type === 'SL') {
          setLeaveBalance(b => ({ ...b, slUsed: Math.max(0, b.slUsed - target.days) }));
        } else if (target.type === 'LOP') {
          setLeaveBalance(b => ({ ...b, lopDays: Math.max(0, b.lopDays - target.days) }));
        }
        return prev.map(r => (r.id === id ? { ...r, status: 'Cancelled' as const } : r));
      }
      return prev;
    });
  };

  const approveLeaveRequest = (id: string, hrNote?: string) => {
    setLeaveRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'Approved',
              actionedBy: currentUser.name,
              actionedAt: new Date().toISOString().split('T')[0],
              hrNote: hrNote || 'Approved by HR.',
            }
          : r
      )
    );
  };

  const rejectLeaveRequest = (id: string, hrNote?: string) => {
    setLeaveRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'Rejected',
              actionedBy: currentUser.name,
              actionedAt: new Date().toISOString().split('T')[0],
              hrNote: hrNote || 'Not approved as requested.',
            }
          : r
      )
    );
  };

  // Timesheets
  const [timesheets, setTimesheets] = useState<TimesheetPeriod[]>(initialTimesheets);

  const updateTimesheetDay = (periodId: string, date: string, regular: number, overtime: number, notes: string) => {
    setTimesheets(prev =>
      prev.map(p => {
        if (p.id !== periodId) return p;
        const updatedDays = p.days.map(d => (d.date === date ? { ...d, regular, overtime, notes } : d));
        const total = updatedDays.reduce((acc, curr) => acc + curr.regular + curr.overtime, 0);
        return { ...p, days: updatedDays, totalHours: total };
      })
    );
  };

  const submitTimesheet = (periodId: string) => {
    setTimesheets(prev =>
      prev.map(p =>
        p.id === periodId
          ? { ...p, status: 'Submitted', submittedAt: new Date().toLocaleString() }
          : p
      )
    );
  };

  const approveTimesheet = (periodId: string) => {
    setTimesheets(prev =>
      prev.map(p =>
        p.id === periodId ? { ...p, status: 'Approved', approvedBy: currentUser.name } : p
      )
    );
  };

  // Activity Reports
  const [activityReports, setActivityReports] = useState<ActivityReport[]>(initialActivityReports);

  const submitActivityReport = (report: Omit<ActivityReport, 'id' | 'date'>) => {
    const newReport: ActivityReport = {
      ...report,
      id: `AR-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
    };
    setActivityReports(prev => [newReport, ...prev]);
  };

  // Expenses
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(initialExpenses);

  const submitExpenseClaim = (claim: Omit<ExpenseClaim, 'id' | 'date' | 'status'>) => {
    const newClaim: ExpenseClaim = {
      ...claim,
      id: `EXP-${Math.floor(8850 + Math.random() * 50)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    setExpenses(prev => [newClaim, ...prev]);
  };

  const approveExpense = (id: string, approvedAmount?: number) => {
    setExpenses(prev =>
      prev.map(e =>
        e.id === id ? { ...e, status: 'Approved', approvedAmount: approvedAmount ?? e.amount } : e
      )
    );
  };

  const rejectExpense = (id: string, reason?: string) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'Rejected', flagReason: reason } : e))
    );
  };

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);

  const uploadDocument = (doc: Omit<DocumentItem, 'id' | 'date' | 'status'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `DOC-UP-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending review',
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const verifyDocument = (id: string, status: 'Verified' | 'Rejected') => {
    setDocuments(prev => prev.map(d => (d.id === id ? { ...d, status } : d)));
  };

  // Handbook
  const [handbookSections, setHandbookSections] = useState<HandbookSection[]>(initialHandbookSections);
  const [handbookDraftSections, setHandbookDraftSections] = useState<HandbookSection[]>(initialHandbookSections);
  const [handbookVersion, setHandbookVersion] = useState<string>('v4');
  const [isHandbookAcknowledged, setIsHandbookAcknowledged] = useState<boolean>(true);

  const acknowledgeHandbook = () => {
    setIsHandbookAcknowledged(true);
  };

  const updateDraftSection = (id: string, title: string, content: string) => {
    setHandbookDraftSections(prev =>
      prev.map(s => (s.id === id ? { ...s, title, content, charCount: content.length } : s))
    );
  };

  const addDraftSection = (title: string, content: string, category: string) => {
    const newSection: HandbookSection = {
      id: `hb-${Date.now().toString().slice(-4)}`,
      title,
      content,
      category,
      charCount: content.length,
      order: handbookDraftSections.length + 1,
      version: 'draft',
    };
    setHandbookDraftSections(prev => [...prev, newSection]);
  };

  const deleteDraftSection = (id: string) => {
    setHandbookDraftSections(prev => prev.filter(s => s.id !== id));
  };

  const publishHandbookDraft = () => {
    const newVer = `v${parseInt(handbookVersion.replace('v', ''), 10) + 1}`;
    setHandbookVersion(newVer);
    setHandbookSections(handbookDraftSections.map(s => ({ ...s, version: newVer })));
    setIsHandbookAcknowledged(false); // triggers re-acknowledgement requirement
  };

  // Requests
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(initialSupportRequests);

  const submitSupportRequest = (req: Omit<SupportRequest, 'id' | 'createdDate' | 'status' | 'replies' | 'slaRemaining' | 'handler'>) => {
    const newReq: SupportRequest = {
      ...req,
      id: `REQ-${Math.floor(1060 + Math.random() * 50)}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Pending HR',
      slaRemaining: '3d 00h left',
      handler: 'Ananya Sharma (Head of HR)',
      replies: [
        {
          id: `rep-${Date.now()}`,
          sender: currentUser.name,
          role: currentUser.role,
          message: req.description,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setSupportRequests(prev => [newReq, ...prev]);
  };

  const addRequestReply = (requestId: string, message: string) => {
    const newReply = {
      id: `rep-${Date.now()}`,
      sender: currentUser.name,
      role: currentUser.role,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSupportRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: currentUser.role === 'EMPLOYEE' ? 'Pending HR' : 'Awaiting Your Reply',
              replies: [...r.replies, newReply],
            }
          : r
      )
    );
  };

  const updateRequestStatus = (requestId: string, status: SupportRequest['status']) => {
    setSupportRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status } : r)));
  };

  // Whistleblower / Issue Reports
  const [issueReports, setIssueReports] = useState<IssueReport[]>(initialIssueReports);

  const submitIssueReport = (report: Omit<IssueReport, 'token' | 'createdDate' | 'status'>): string => {
    const token = `WB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIssue: IssueReport = {
      ...report,
      token,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    setIssueReports(prev => [newIssue, ...prev]);
    return token;
  };

  const updateIssueStatus = (token: string, status: IssueReport['status'], internalNotes?: string, resolution?: string) => {
    setIssueReports(prev =>
      prev.map(i =>
        i.token === token
          ? {
              ...i,
              status,
              internalNotes: internalNotes || i.internalNotes,
              resolution: resolution || i.resolution,
            }
          : i
      )
    );
  };

  // Candidates & Onboarding
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const addCandidate = (candidate: Omit<Candidate, 'id' | 'createdDate' | 'tasksProgress' | 'tasksTotal' | 'documentsCount'>) => {
    const newCand: Candidate = {
      ...candidate,
      id: `CND-${Math.floor(8860 + Math.random() * 50)}`,
      createdDate: new Date().toISOString().split('T')[0],
      tasksProgress: 1,
      tasksTotal: 18,
      documentsCount: 1,
    };
    setCandidates(prev => [newCand, ...prev]);
  };

  const updateCandidateProgress = (id: string, progress: number) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              tasksProgress: Math.min(progress, c.tasksTotal),
              status: progress >= c.tasksTotal ? 'Completed' : 'In Progress',
            }
          : c
      )
    );
  };

  const verifyCandidateI9 = (id: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, i9Section2Status: 'Completed' } : c))
    );
  };

  // Offer Letters
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>(initialOfferLetters);

  const generateOfferLetter = (letter: Omit<OfferLetter, 'id' | 'generatedDate' | 'status'>) => {
    const newLetter: OfferLetter = {
      ...letter,
      id: `OFF-${Math.floor(1100 + Math.random() * 50)}`,
      generatedDate: new Date().toISOString().split('T')[0],
      status: 'Pending Admin',
    };
    setOfferLetters(prev => [newLetter, ...prev]);
  };

  const approveOfferLetter = (id: string) => {
    setOfferLetters(prev =>
      prev.map(l => (l.id === id ? { ...l, status: 'Completed' } : l))
    );
  };

  // Feed & Announcements
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(initialFeedPosts);

  const likePost = (id: string) => {
    setFeedPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const userLiked = !p.userLiked;
          return { ...p, userLiked, likes: userLiked ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      })
    );
  };

  const addCommentToPost = (postId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      timeAgo: 'Just now',
      text,
    };
    setFeedPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
  };

  const createPost = (post: { title: string; body: string; category: FeedPost['category']; isPinned: boolean; imageUrl?: string }) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.jobTitle,
      timeAgo: 'Just now',
      category: post.category,
      isPinned: post.isPinned,
      title: post.title,
      body: post.body,
      imageUrl: post.imageUrl,
      likes: 0,
      userLiked: false,
      comments: [],
    };
    setFeedPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (id: string) => {
    setFeedPosts(prev => prev.filter(p => p.id !== id));
  };

  // Feedback
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(initialFeedback);

  const submitFeedback = (feedback: Omit<FeedbackEntry, 'id' | 'date'>) => {
    const newEntry: FeedbackEntry = {
      ...feedback,
      id: `fb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setFeedbackList(prev => [newEntry, ...prev]);
  };

  // Accounting
  const [invoices, setInvoices] = useState<ARInvoice[]>(initialARInvoices);

  const createInvoice = (inv: Omit<ARInvoice, 'id' | 'issueDate' | 'isOverdue' | 'status'>) => {
    const newInv: ARInvoice = {
      ...inv,
      id: `INV-2026-${Math.floor(100 + Math.random() * 50)}`,
      issueDate: new Date().toISOString().split('T')[0],
      isOverdue: false,
      status: 'Pending',
    };
    setInvoices(prev => [newInv, ...prev]);
  };

  const recordInvoicePayment = (id: string, amount: number) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          const outstanding = Math.max(0, inv.outstanding - amount);
          return { ...inv, outstanding, status: outstanding === 0 ? 'Paid' : 'Pending', isOverdue: false };
        }
        return inv;
      })
    );
  };

  const [bills, setBills] = useState<APBill[]>(initialAPBills);
  const approveBill = (id: string) => {
    setBills(prev => prev.map(b => (b.id === id ? { ...b, status: 'Approved' } : b)));
  };
  const payBill = (id: string) => {
    setBills(prev => prev.map(b => (b.id === id ? { ...b, status: 'Paid' } : b)));
  };

  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const addVendor = (v: Omit<Vendor, 'id' | 'totalBilled'>) => {
    const newVendor: Vendor = {
      ...v,
      id: `VND-${Math.floor(105 + Math.random() * 50)}`,
      totalBilled: 0,
    };
    setVendors(prev => [newVendor, ...prev]);
  };

  const [authorizedSigners, setAuthorizedSigners] = useState<AuthorizedSigner[]>(initialAuthorizedSigners);
  const addSigner = (signer: Omit<AuthorizedSigner, 'id' | 'createdDate'>) => {
    const newSigner: AuthorizedSigner = {
      ...signer,
      id: `AS-0${authorizedSigners.length + 1}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setAuthorizedSigners(prev => [...prev, newSigner]);
  };

  const toggleSignerStatus = (id: string) => {
    setAuthorizedSigners(prev =>
      prev.map(s => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s))
    );
  };

  // Holidays
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);
  const addHoliday = (h: Omit<HolidayItem, 'id'>) => {
    const newHol: HolidayItem = {
      ...h,
      id: `hol-${Date.now()}`,
    };
    setHolidays(prev => [...prev, newHol]);
  };

  // Reviews
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>(initialReviewCycles);
  const submitSelfReview = (cycleId: string, rating: number, assessment: string) => {
    setReviewCycles(prev =>
      prev.map(c =>
        c.id === cycleId
          ? { ...c, selfRating: rating, selfAssessment: assessment, status: 'Submitted' }
          : c
      )
    );
  };

  // Emergency Banner
  const [emergencyBannerDismissed, setEmergencyBannerDismissed] = useState<boolean>(false);
  const dismissEmergencyBanner = () => setEmergencyBannerDismissed(true);
  const restoreEmergencyBanner = () => setEmergencyBannerDismissed(false);

  // UI state: AI assistant & Command Palette
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const toggleAiAssistant = () => setAiAssistantOpen(prev => !prev);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        users,
        addUser,
        removeUser,
        attendance,
        isClockedIn,
        clockInTime,
        clockIn,
        clockOut,
        attendanceCorrections,
        submitAttendanceCorrection,
        tasks,
        toggleTaskStatus,
        addTask,
        updateTask,
        leaveBalance,
        leaveRequests,
        submitLeaveRequest,
        cancelLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        timesheets,
        updateTimesheetDay,
        submitTimesheet,
        approveTimesheet,
        activityReports,
        submitActivityReport,
        expenses,
        submitExpenseClaim,
        approveExpense,
        rejectExpense,
        documents,
        uploadDocument,
        verifyDocument,
        handbookSections,
        handbookDraftSections,
        handbookVersion,
        isHandbookAcknowledged,
        acknowledgeHandbook,
        updateDraftSection,
        addDraftSection,
        deleteDraftSection,
        publishHandbookDraft,
        supportRequests,
        submitSupportRequest,
        addRequestReply,
        updateRequestStatus,
        issueReports,
        submitIssueReport,
        updateIssueStatus,
        candidates,
        addCandidate,
        updateCandidateProgress,
        verifyCandidateI9,
        offerLetters,
        generateOfferLetter,
        approveOfferLetter,
        feedPosts,
        likePost,
        addCommentToPost,
        createPost,
        deletePost,
        feedbackList,
        submitFeedback,
        invoices,
        createInvoice,
        recordInvoicePayment,
        bills,
        approveBill,
        payBill,
        vendors,
        addVendor,
        authorizedSigners,
        addSigner,
        toggleSignerStatus,
        holidays,
        addHoliday,
        reviewCycles,
        submitSelfReview,
        emergencyBannerDismissed,
        dismissEmergencyBanner,
        restoreEmergencyBanner,
        aiAssistantOpen,
        toggleAiAssistant,
        commandPaletteOpen,
        setCommandPaletteOpen,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
