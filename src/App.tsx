import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AppShell } from './components/ui/AppShell';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { RegisterCompanyPage } from './pages/auth/RegisterCompanyPage';

// Employee Portal Pages
import { EmployeeHome } from './pages/employee/EmployeeHome';
import { CompanyFeed } from './pages/employee/CompanyFeed';
import { Directory } from './pages/employee/Directory';
import { Handbook } from './pages/employee/Handbook';
import { Attendance } from './pages/employee/Attendance';
import { Leaves } from './pages/employee/Leaves';
import { Timesheets } from './pages/employee/Timesheets';
import { Tasks } from './pages/employee/Tasks';
import { ActivityReports } from './pages/employee/ActivityReports';
import { Reviews } from './pages/employee/Reviews';
import { TeamReviews } from './pages/employee/TeamReviews';
import { Expenses } from './pages/employee/Expenses';
import { Documents } from './pages/employee/Documents';
import { MyRequests } from './pages/employee/MyRequests';
import { MyProfile } from './pages/employee/MyProfile';
import { Onboarding } from './pages/employee/Onboarding';
import { ReportIssue } from './pages/employee/ReportIssue';

// HR Console Pages
import { HROverview } from './pages/hr/HROverview';
import { Candidates } from './pages/hr/Candidates';
import { OfferLetters } from './pages/hr/OfferLetters';
import { Employees } from './pages/hr/Employees';
import { Performance } from './pages/hr/Performance';
import { Feedback } from './pages/hr/Feedback';
import { Announcements } from './pages/hr/Announcements';
import { HolidayCalendar } from './pages/hr/HolidayCalendar';
import { LeaveApprovals } from './pages/hr/LeaveApprovals';
import { HRTimesheets } from './pages/hr/HRTimesheets';
import { Payroll } from './pages/hr/Payroll';
import { HRExpenses } from './pages/hr/HRExpenses';
import { HRTasks } from './pages/hr/HRTasks';
import { HRActivityReports } from './pages/hr/HRActivityReports';
import { HRDocuments } from './pages/hr/HRDocuments';
import { HRRequests } from './pages/hr/HRRequests';
import { WhistleBlower } from './pages/hr/WhistleBlower';
import { Compliance } from './pages/hr/Compliance';
import { AuditLog } from './pages/hr/AuditLog';

// Accounting Suite
import { AccountsReceivable } from './pages/hr/accounting/AccountsReceivable';
import { AccountsPayable } from './pages/hr/accounting/AccountsPayable';
import { AccountingReports } from './pages/hr/accounting/AccountingReports';
import { Reconciliation } from './pages/hr/accounting/Reconciliation';
import { Vendors } from './pages/hr/accounting/Vendors';

// Admin Console Specific Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminHandbooks } from './pages/admin/AdminHandbooks';
import { AuthorizedSigners } from './pages/admin/AuthorizedSigners';
import { Roles } from './pages/admin/Roles';
import { ApiUsage } from './pages/admin/ApiUsage';
import { Clients } from './pages/admin/Clients';

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register-company" element={<RegisterCompanyPage />} />

          {/* Root Shell Routes */}
          <Route element={<AppShell />}>
            {/* Redirect / to /employee/home */}
            <Route index element={<Navigate to="/employee/home" replace />} />

            {/* 1. Employee Portal Routes */}
            <Route path="employee">
              <Route index element={<Navigate to="/employee/home" replace />} />
              <Route path="home" element={<EmployeeHome />} />
              <Route path="company/feed" element={<CompanyFeed />} />
              <Route path="company/directory" element={<Directory />} />
              <Route path="company/handbook" element={<Handbook />} />
              <Route path="time/attendance" element={<Attendance />} />
              <Route path="time/leaves" element={<Leaves />} />
              <Route path="time/timesheets" element={<Timesheets />} />
              <Route path="work/tasks" element={<Tasks />} />
              <Route path="work/activity-reports" element={<ActivityReports />} />
              <Route path="work/reviews" element={<Reviews />} />
              <Route path="work/team-reviews" element={<TeamReviews />} />
              <Route path="finance/expenses" element={<Expenses />} />
              <Route path="finance/documents" element={<Documents />} />
              <Route path="finance/my-requests" element={<MyRequests />} />
              <Route path="me/profile" element={<MyProfile />} />
              <Route path="me/onboarding" element={<Onboarding />} />
              <Route path="me/report-issue" element={<ReportIssue />} />
            </Route>

            {/* 2. HR Console Routes */}
            <Route path="hr">
              <Route index element={<Navigate to="/hr/overview" replace />} />
              <Route path="overview" element={<HROverview />} />
              <Route path="recruit/candidates" element={<Candidates />} />
              <Route path="recruit/offer-letters" element={<OfferLetters />} />
              <Route path="people/employees" element={<Employees />} />
              <Route path="people/performance" element={<Performance />} />
              <Route path="people/feedback" element={<Feedback />} />
              <Route path="people/announcements" element={<Announcements />} />
              <Route path="people/holiday-calendar" element={<HolidayCalendar />} />
              <Route path="time-pay/leave-approvals" element={<LeaveApprovals />} />
              <Route path="time-pay/timesheets" element={<HRTimesheets />} />
              <Route path="time-pay/payroll" element={<Payroll />} />
              <Route path="time-pay/expenses" element={<HRExpenses />} />
              <Route path="work/tasks" element={<HRTasks isPersonalOnly={false} />} />
              <Route path="work/my-tasks" element={<HRTasks isPersonalOnly={true} />} />
              <Route path="work/activity-reports" element={<HRActivityReports />} />
              <Route path="work/documents" element={<HRDocuments />} />
              <Route path="work/requests" element={<HRRequests />} />
              <Route path="risk/whistle-blower" element={<WhistleBlower />} />
              <Route path="risk/compliance" element={<Compliance />} />
              <Route path="risk/audit-log" element={<AuditLog />} />
              <Route path="accounting/receivable" element={<AccountsReceivable />} />
              <Route path="accounting/payable" element={<AccountsPayable />} />
              <Route path="accounting/reports" element={<AccountingReports />} />
              <Route path="accounting/reconciliation" element={<Reconciliation />} />
              <Route path="accounting/vendors" element={<Vendors />} />
            </Route>

            {/* 3. Admin Console Routes */}
            <Route path="admin">
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="people/employees" element={<Employees />} />
              <Route path="people/announcements" element={<Announcements />} />
              <Route path="people/feedback" element={<Feedback />} />
              <Route path="people/whistle-blower" element={<WhistleBlower />} />
              <Route path="people/handbooks" element={<AdminHandbooks />} />
              <Route path="operations/offer-letters" element={<OfferLetters />} />
              <Route path="operations/onboarding" element={<Candidates />} />
              <Route path="operations/leaves" element={<LeaveApprovals />} />
              <Route path="operations/expenses" element={<HRExpenses />} />
              <Route path="operations/hr-requests" element={<HRRequests />} />
              <Route path="operations/tasks" element={<HRTasks isPersonalOnly={false} />} />
              <Route path="operations/payroll" element={<Payroll />} />
              <Route path="operations/clients" element={<Clients />} />
              <Route path="system/roles" element={<Roles />} />
              <Route path="system/audit-log" element={<AuditLog />} />
              <Route path="system/compliance" element={<Compliance />} />
              <Route path="system/api-usage" element={<ApiUsage />} />
              <Route path="accounting/receivable" element={<AccountsReceivable />} />
              <Route path="accounting/payable" element={<AccountsPayable />} />
              <Route path="accounting/reports" element={<AccountingReports />} />
              <Route path="accounting/reconciliation" element={<Reconciliation />} />
              <Route path="accounting/vendors" element={<Vendors />} />
              <Route path="accounting/signers" element={<AuthorizedSigners />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/employee/home" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
