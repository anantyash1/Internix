// import { Routes, Route, Navigate } from 'react-router-dom';
// import useAuthStore from './store/authStore';
// import Layout from './components/Layout';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import TasksPage from './pages/TasksPage';
// import AttendancePage from './pages/AttendancePage';
// import ReportsPage from './pages/ReportsPage';
// import UsersPage from './pages/UsersPage';
// import InternshipsPage from './pages/InternshipsPage';
// import CertificatesPage from './pages/CertificatesPage';
// import VideosPage from './pages/VideosPage';
// import MentorSummaryPage from "./pages/MntorSummaryPage";
// import WorkSchedulePage from "./pages/WorkSchedulePage";
// import OnboardingPage from "./pages/OnboardingPage";

// // Routes for different user roles
// function ProtectedRoute({ children, roles }) {
//   const user = useAuthStore((s) => s.user);
//   if (!user) return <Navigate to="/login" replace />;
//   if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
//   return children;
// }

// export default function App() {
//   const user = useAuthStore((s) => s.user);

//   return (
//     <Routes>
//       <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
//       <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

//       <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//         <Route index element={<Navigate to="/dashboard" replace />} />
//         <Route path="dashboard"    element={<DashboardPage />} />
//         <Route path="tasks"        element={<TasksPage />} />
//         <Route path="attendance"   element={<AttendancePage />} />
//         <Route path="reports"      element={<ReportsPage />} />
//         <Route path="certificates" element={<CertificatesPage />} />
//         <Route path="videos"       element={<VideosPage />} />
//         <Route path="ai-summary"   element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <MentorSummaryPage />
//           </ProtectedRoute>
//         } />
//         <Route path="work-schedule" element={
//           <ProtectedRoute roles={['admin']}>
//             <WorkSchedulePage />
//           </ProtectedRoute>
//         } />
//         <Route path="users" element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <UsersPage />
//           </ProtectedRoute>
//         } />
//         <Route path="onboarding" element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <OnboardingPage />
//           </ProtectedRoute>
//         } />
//         <Route path="internships" element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <InternshipsPage />
//           </ProtectedRoute>
//         } />
//       </Route>

//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// }



// import { useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import useAuthStore from './store/authStore';
// import Layout from './components/Layout';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import TasksPage from './pages/TasksPage';
// import AttendancePage from './pages/AttendancePage';
// import ReportsPage from './pages/ReportsPage';
// import UsersPage from './pages/UsersPage';
// import InternshipsPage from './pages/InternshipsPage';
// import CertificatesPage from './pages/CertificatesPage';
// import VideosPage from './pages/VideosPage';
// import MentorSummaryPage from './pages/MntorSummaryPage';
// import WorkSchedulePage from './pages/WorkSchedulePage';
// import OnboardingPage from './pages/OnboardingPage';
// import TestsPage from './pages/TestsPage';

// function ProtectedRoute({ children, roles }) {
//   const user = useAuthStore((s) => s.user);
//   if (!user) return <Navigate to="/login" replace />;
//   if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
//   return children;
// }

// export default function App() {
//   const user = useAuthStore((s) => s.user);
//   const token = useAuthStore((s) => s.token);
//   const fetchMe = useAuthStore((s) => s.fetchMe);

//   useEffect(() => {
//     if (token) {
//       fetchMe();
//     }
//   }, [fetchMe, token]);

//   return (
//     <Routes>
//       <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
//       <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

//       <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//         <Route index element={<Navigate to="/dashboard" replace />} />
//         <Route path="dashboard"    element={<DashboardPage />} />
//         <Route path="tasks"        element={<TasksPage />} />
//         <Route path="attendance"   element={<AttendancePage />} />
//         <Route path="reports"      element={<ReportsPage />} />
//         <Route path="certificates" element={<CertificatesPage />} />
//         <Route path="videos"       element={<VideosPage />} />
//         <Route path="tests"        element={<TestsPage />} />
//         <Route path="ai-summary"   element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <MentorSummaryPage />
//           </ProtectedRoute>
//         } />
//         <Route path="work-schedule" element={
//           <ProtectedRoute roles={['admin']}>
//             <WorkSchedulePage />
//           </ProtectedRoute>
//         } />
//         <Route path="users" element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <UsersPage />
//           </ProtectedRoute>
//         } />
//         <Route path="onboarding" element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <OnboardingPage />
//           </ProtectedRoute>
//         } />
//         <Route path="internships" element={
//           <ProtectedRoute roles={['admin', 'mentor']}>
//             <InternshipsPage />
//           </ProtectedRoute>
//         } />
//       </Route>

//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// }





import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import InternshipsPage from './pages/InternshipsPage';
import CertificatesPage from './pages/CertificatesPage';
import VideosPage from './pages/VideosPage';
import MentorSummaryPage from './pages/MntorSummaryPage';
import WorkSchedulePage from './pages/WorkSchedulePage';
import OnboardingPage from './pages/OnboardingPage';
import TestsPage from './pages/TestsPage';
import GroupsPage from './pages/GroupsPage';
import NoticesPage from './pages/NoticesPage';

function ProtectedRoute({ children, roles }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (token) { fetchMe(); }
  }, [fetchMe, token]);

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="tasks"        element={<TasksPage />} />
        <Route path="attendance"   element={<AttendancePage />} />
        <Route path="reports"      element={<ReportsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="videos"       element={<VideosPage />} />
        <Route path="tests"        element={<TestsPage />} />
        <Route path="groups"       element={<GroupsPage />} />
        <Route path="notices"      element={
          <ProtectedRoute roles={['admin']}>
            <NoticesPage />
          </ProtectedRoute>
        } />
        <Route path="ai-summary"   element={
          <ProtectedRoute roles={['admin', 'mentor']}>
            <MentorSummaryPage />
          </ProtectedRoute>
        } />
        <Route path="work-schedule" element={
          <ProtectedRoute roles={['admin']}>
            <WorkSchedulePage />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute roles={['admin', 'mentor']}>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="onboarding" element={
          <ProtectedRoute roles={['admin', 'mentor']}>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        <Route path="internships" element={
          <ProtectedRoute roles={['admin', 'mentor']}>
            <InternshipsPage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}