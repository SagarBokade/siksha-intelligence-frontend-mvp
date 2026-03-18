import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSessionExpired } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";

/**
 * A blocking overlay dialog shown when the user's session expires.
 *
 * Triggered by: `markSessionExpired()` dispatch in the Axios interceptor.
 * Cleared by:   User clicking "Login Again" → navigates to /login.
 *
 * Design goals:
 *  - Appears over the current page (user sees what they were doing)
 *  - Does NOT navigate until the user acknowledges
 *  - No close button — user must click "Login Again"
 */
export default function SessionExpiredDialog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isExpired = useAppSelector((s) => s.auth.sessionExpired);

  const handleLogin = () => {
    dispatch(clearSessionExpired());
    navigate("/login", { replace: true });
  };

  return (
    <AnimatePresence>
      {isExpired && (
        <>
          {/* Backdrop */}
          <motion.div
            key="session-expired-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            key="session-expired-dialog"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-expired-title"
            aria-describedby="session-expired-desc"
          >
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-center space-y-5">
              {/* Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                <ShieldAlert className="h-7 w-7 text-amber-500" />
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <h2
                  id="session-expired-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Session Expired
                </h2>
                <p
                  id="session-expired-desc"
                  className="text-sm text-muted-foreground"
                >
                  Your session has expired. Please log in again to continue.
                </p>
              </div>

              {/* Action */}
              <Button
                onClick={handleLogin}
                className="w-full"
                autoFocus
              >
                Login Again
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
