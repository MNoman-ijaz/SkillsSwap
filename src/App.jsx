import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLogin from './Components/MainLogin.jsx';

// Client Components
import ClientLogin from './Components/Client/ClientLogin';
import ClientSignup from './Components/Client/ClientSignup';
import ClientDashboard from './Components/Client/ClientdashBoard.jsx';

// Freelancer Components
import FreelancerLogin from './Components/Freelancer/FreelancerLogin';
import FreelancerSignup from './Components/Freelancer/FreelancerSignup';
import FreelancerDashboard from './Components/Freelancer/FreelancerDashboard';
import ProfileCard from './Components/Freelancer/ProfileCard';
import BidsManagement from './Components/Freelancer/BidsManagement';
import ProjectsOverview from './Components/Freelancer/ProjectsOverview';
import ProjectTimeline from './Components/Freelancer/ProjectTimeline';

// Admin Components
import AdminLogin from './Components/Admin/AdminLogin';
import AdminSignup from './Components/Admin/AdminSignup';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main/Auth Routes */}
        <Route path="/" element={<MainLogin />} />

        {/* Client Routes */}
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-signup" element={<ClientSignup />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />

        {/* Freelancer Routes */}
        <Route path="/freelancer-login" element={<FreelancerLogin />} />
        <Route path="/freelancer-signup" element={<FreelancerSignup />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />}>
          <Route index element={<ProfileCard />} />
          <Route path="profile" element={<ProfileCard />} />
          <Route path="bids" element={<BidsManagement />} />
          <Route path="projects" element={<ProjectsOverview />} />
          <Route path="timeline" element={<ProjectTimeline />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
      </Routes>
    </Router>
  );
}

export default App;