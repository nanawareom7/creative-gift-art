import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import ServicePage from "@/pages/ServicePage";
import About from "@/pages/About";
import TemplateDetails from "@/pages/TemplateDetails";
import SearchPage from "@/pages/SearchPage";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTemplates from "@/pages/AdminTemplates";
import AdminCategories from "@/pages/AdminCategories";
import AdminTemplateForm from "@/pages/AdminTemplateForm";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/om-admin");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/collection/:type" element={<CategoryPage />} />
            <Route path="/service/:slug" element={<ServicePage />} />
            <Route path="/template/:slug" element={<TemplateDetails />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<About />} />

            <Route path="/om-admin/login" element={<Login />} />
            <Route
              path="/om-admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="templates" element={<AdminTemplates />} />
              <Route path="templates/new" element={<AdminTemplateForm />} />
              <Route path="templates/:id/edit" element={<AdminTemplateForm />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppFloat />}
      <Toaster position="top-center" />
    </div>
  );
}
