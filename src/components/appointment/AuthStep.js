import React from 'react';
import { motion } from 'framer-motion';

const AuthStep = ({
  authMode,
  setAuthMode,
  authMessage,
  setAuthMessage,
  authLoading,
  setAuthLoading,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupConfirmPassword,
  setSignupConfirmPassword,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  signUpNow,
  loginNow,
  signOutNow,
  isAuthenticated,
  user,
  setCurrentStep,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Create an account or log in
      </h3>
      <p className="text-sm text-gray-700">
        You must sign up or log in before booking. If you sign up here and the
        booking fails we will delete the created account.
      </p>

      {/* If user is already signed in, show a compact panel with ability to use that account or switch */}
      {isAuthenticated && user ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-3">You are signed in</h4>
          <p className="text-sm text-gray-700 mb-3">
            Signed in as <strong>{user.email}</strong>
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                // continue as this user
                setAuthMessage(null);
                setCurrentStep(1);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Continue as {user.email}
            </button>

            <button
              type="button"
              onClick={() => {
                // sign out to allow booking from another account
                signOutNow();
                setAuthMode("login");
                setAuthMessage(null);
              }}
              className="px-4 py-2 bg-white border rounded-lg">
              Book with another account
            </button>
          </div>

          <p className="text-xs text-gray-700 mt-3">
            If you want to book using a different account, choose "Book with
            another account".
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setAuthMessage(null);
                setAuthLoading(false);
                setLoginEmail("");
                setLoginPassword("");
              }}
              className={`px-4 py-2 rounded-lg ${
                authMode === "signup"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border"
              }`}>
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthMessage(null);
                setAuthLoading(false);
                setSignupEmail("");
                setSignupPassword("");
                setSignupConfirmPassword("");
              }}
              className={`px-4 py-2 rounded-lg ${
                authMode === "login"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border"
              }`}>
              Log in
            </button>
          </div>

          {authMode === "signup" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-3">New? Create an account</h4>

              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              <label className="block text-sm text-gray-700 mt-3">
                Password
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              <label className="block text-sm text-gray-700 mt-3">
                Confirm Password
              </label>
              <input
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              <button
                onClick={signUpNow}
                disabled={authLoading}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                {authLoading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-xs text-gray-700 mt-2">
                If that email already exists, you will be prompted to log in
                instead.
              </p>
            </div>
          )}

          {authMode === "login" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-3">Already have an account?</h4>

              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              <label className="block text-sm text-gray-700 mt-3">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              <button
                onClick={loginNow}
                disabled={authLoading}
                className="mt-4 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                {authLoading ? "Signing in..." : "Log in"}
              </button>
            </div>
          )}
        </>
      )}

      {authMessage && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            authMessage.toLowerCase().includes("error") ||
            authMessage.toLowerCase().includes("failed") ||
            authMessage.toLowerCase().includes("invalid")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
          {authMessage}
        </div>
      )}
    </motion.div>
  );
};

export default AuthStep;