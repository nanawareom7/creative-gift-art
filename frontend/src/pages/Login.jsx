import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/services/api";
import logo from "@/assets/cga-logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/om-admin";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      // Backend response: { success, message, data: { token, admin } }
      // authApi.login does .then(r => r.data), so res = { success, message, data }
      const token = res?.data?.token;
      if (!token) {
        throw new Error(res?.message || "No token returned from server");
      }
      localStorage.setItem("cga_token", token);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      // Show backend error message if available, otherwise show our own message
      const msg =
        err?.response?.data?.message ||   // Axios HTTP error (e.g. 401)
        err?.message ||                    // JS error thrown above
        "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-ivory via-background to-champagne/40 px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl bg-card p-8 sm:p-10 gold-border luxe-shadow"
      >
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="CGA" className="h-16 w-auto" />
          <h1 className="font-serif text-3xl mt-4">Studio Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Creative Gift Art admin panel</p>
        </div>

        <div className="space-y-4 mt-8">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@creativegiftart.com"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </div>

        <Link
          to="/"
          className="block text-center mt-6 text-xs text-muted-foreground hover:text-primary"
        >
          ← Back to website
        </Link>
      </motion.form>
    </div>
  );
}
