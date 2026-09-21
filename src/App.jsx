import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Auth/Login';
import SelectAccountType from './pages/Auth/SelectAccountType';
import RegisterIndividual from './pages/Auth/RegisterIndividual';
import RegisterCompany from './pages/Auth/RegisterCompany';
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ResetPassword from "./pages/Auth/ResetPassword";
import UserDashboard from './pages/Dashboard/UserDashboard';
import EntrepriseDashboard from './pages/Dashboard/EntrepriseDashboard';
import TalentMarket from "./pages/HR/TalentMarket";
import Messaging from "./pages/Messaging/Messaging";
import Inbox from "./pages/Messaging/Inbox";
import ScheduleInterview from "./pages/Messaging/ScheduleInterview";
import VideoRoom from "./pages/Messaging/VideoRoom";
import CreateContract from "./pages/Contracts/CreateContract";
import Contracts from "./pages/Contracts/Contracts";
import AllContracts from "./pages/Contracts/allContracts";
import ViewContract from "./pages/Contracts/ViewContract";
import JobList from "./pages/Jobs/JobList";
import CandidateView from "./pages/Jobs/CandidateView";
import CreateOffers from "./pages/Jobs/CreateOffer";
import EditJobs from "./pages/Jobs/EditJobs";
import JobsDetails from "./pages/Jobs/JobsDetails";
import OffersAvailable from "./pages/Offers/OffersAvailable";
import MyApplications from "./pages/Offers/MyApplications/MyApplications"
import UserLayout from "./layouts/UserLayout";
import ApplyJob from "./pages/Offers/ApplyJobs";
import UserProfil from './pages/Profil/UserProfil';
import AITalentRecommendation from "./pages/HR/AITalentRecommendation";
import Favorites from "./pages/HR/Favorites";
import ProfilDetail from "./pages/HR/ProfilDetail";
import Employees from './pages/Employees/Employees';
import TrainingInterview from './pages/Jobs/users/TrainingInterview/TrainingInterview';
import VisioTraining from './pages/Jobs/users/TrainingInterview/VisioTraining';
import TechnicalTestsDashboard from './pages/Jobs/Entreprises/TechnicalTestsDashboard';
import TechnicalTest from "./pages/Jobs/Entreprises/TechnicalTest/TechnicalTest";
import TechnicalTestPage from "./pages/Jobs/Entreprises/TechnicalTest/Candidate/TechnicalTestPage";
import TestResultsDashboard from "./pages/Jobs/Entreprises/TestResultsDashboard";
import TestSelectionPage from "./pages/Jobs/Entreprises/TechnicalTest/Candidate/TestSelectionPage";
import Planning from './pages/Employees/Planning/Planning';
import Absence from './pages/Employees/Absence/Absence';
import Payroll from './pages/Employees/Payroll/Payroll';
import BackToDashboard from './components/BackToDashboard';
import Settings from './pages/Settings/Settings';


function App() {
  return (
    <Router>
      <BackToDashboard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select_account_type" element={<SelectAccountType />} />
        <Route path="/register_individual" element={<RegisterIndividual />} />
        <Route path="/register_company" element={<RegisterCompany />} />
        <Route path="/verify_email" element={<VerifyEmail />} />
        <Route path="/reset_password" element={<ResetPassword />} />
        <Route path="/content_user_dashboard" element={<UserDashboard />} />
        <Route path="/user_dashboard" element={<UserLayout />} />
        <Route path="/company_dashboard" element={<EntrepriseDashboard />} />
        <Route path="/home_company" element={<EntrepriseDashboard />} />
        <Route path="/hr/talent-market" element={<TalentMarket />} />
        <Route path="/messaging/inbox" element={<Inbox />} />
        <Route path="/messaging/conversation/:chatId" element={<Messaging />} />
        <Route path="/messaging/schedule/:chatId" element={<ScheduleInterview />} />
        <Route path="/messaging/video_room/:interviewId" element={<VideoRoom />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contracts/all" element={<AllContracts />} />
        <Route path="/contracts/create/:chatId/:candidateId" element={<CreateContract />} />
        <Route path="/contracts/view/:contractId" element={<ViewContract />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/create" element={<CreateOffers />} />
        <Route path="/jobs/edit/:jobId" element={<EditJobs />} />
        <Route path="/jobs/candidates" element={<CandidateView />} />
        <Route path="/jobs/details/:jobId" element={<JobsDetails />} />
        <Route path="/jobs/offers" element={<OffersAvailable />} />
        <Route path="/jobs/apply/:jobId" element={<ApplyJob />} />
        <Route path="/jobs/my-applications" element={<MyApplications />} />
        <Route path="/profil" element={<UserProfil />} />
        <Route path="/ai-talent-recommendation" element={<AITalentRecommendation />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/hr/talent/:talentId" element={<ProfilDetail />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/interview/training/:applicationId?" element={<TrainingInterview  />} />
        <Route path="/technical-tests" element={<TechnicalTestsDashboard />} />
        <Route path="/jobs/:jobId/technical-test" element={<TechnicalTest />} />
        <Route path="/jobs/:jobId/technical-test/:testId?" element={<TechnicalTest />} />
        <Route path="/technical-test/:testId" element={<TechnicalTestPage />} />
        <Route path="/api/technical-test/:testId" element={<TechnicalTestPage />} />
        <Route path="/company/test-results" element={<TestResultsDashboard />} />
        <Route path="/test-results/:testId" element={<TestResultsDashboard />} />
        <Route path="/test-selection/:jobId" element={<TestSelectionPage />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/absences" element={<Absence />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/visio-training/:applicationId?" element={<VisioTraining />} />
        <Route path="/settings" element={<Settings />} />

        {/* Ajoute d'autres routes au besoin */}
      </Routes>
    </Router>
  );
}

export default App;
