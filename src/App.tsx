import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Ministries from './pages/Ministries';
import Events from './pages/Events';
import Give from './pages/Give';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Reflections from './pages/Reflections';
import ReflectionDetail from './pages/ReflectionDetail';
import AdminReflections from './pages/AdminReflections';
import AdminEvents from './pages/AdminEvents';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/ministries" element={<Ministries />} />
              <Route path="/events" element={<Events />} />
              <Route path="/give" element={<Give />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reflections" element={<Reflections />} />
              <Route path="/reflections/:id" element={<ReflectionDetail />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<Navigate to="reflections" replace />} />
                <Route path="reflections" element={
                  <ProtectedRoute>
                    <AdminReflections />
                  </ProtectedRoute>
                } />
                <Route path="events" element={
                  <ProtectedRoute>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
