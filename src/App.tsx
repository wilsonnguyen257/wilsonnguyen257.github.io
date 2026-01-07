import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';

// Eager load critical pages
import Home from "./pages/Home";
import Login from "./pages/Login";

// Lazy load other pages
const About = lazy(() => import('./pages/About'));
const Ministries = lazy(() => import('./pages/Ministries'));
const Events = lazy(() => import('./pages/Events'));
const Give = lazy(() => import('./pages/Give'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Reflections = lazy(() => import('./pages/Reflections'));
const ReflectionDetail = lazy(() => import('./pages/ReflectionDetail'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminReflections = lazy(() => import('./pages/AdminReflections'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const AdminGallery = lazy(() => import('./pages/AdminGallery'));

const LoadingFallback = () => (
  <div className="container-xl py-12 text-center text-slate-500">
    Loading...
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            <ScrollToTop />
            <Toaster position="top-center" />
            <Navbar />
          <main className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/ministries" element={<Ministries />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/give" element={<Give />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/reflections" element={<Reflections />} />
                <Route path="/reflections/:id" element={<ReflectionDetail />} />
                
                {/* Admin Login */}
                <Route path="/login" element={<Login />} />
                
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="reflections" replace />} />
                  <Route path="reflections" element={<AdminReflections />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="gallery" element={<AdminGallery />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
          </Suspense>
        </main>
        <Footer />
          </div>
        </LanguageProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}