// src/layouts/MainLayout.jsx

import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../contexts/SettingsContext";
import { Activity, User, BookOpen, LogOut, LayoutDashboard, Shield, Settings, ChevronDown, Key, UserCircle, Search, X } from "lucide-react";

export const MainLayout = () => {
  const { user, logout, isUser, isOwner, isAdmin } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?name=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch("");
    } else {
      navigate("/search");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex flex-col min-h-screen theme-bg theme-text transition-colors duration-300`}>
      {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 glass border-b theme-border py-4 px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2 rounded-xl text-white glow-primary">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SmashPlay
          </span>
        </Link>

        {/* Quick Search Bar */}
        <form
          onSubmit={handleQuickSearch}
          className={`hidden md:flex items-center gap-2 transition-all duration-300 ${
            searchFocused ? "w-72" : "w-52"
          }`}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Tìm kiếm sân..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
            />
            {quickSearch && (
              <button
                type="button"
                onClick={() => setQuickSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </form>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`hover:text-indigo-400 transition-colors ${
              location.pathname === "/" ? "text-indigo-400" : "theme-text-nav"
            }`}
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/search"
            className={`hover:text-indigo-400 transition-colors ${
              location.pathname === "/search" ? "text-indigo-400" : "theme-text-nav"
            }`}
          >
            {t("nav.search")}
          </Link>
          {isUser && (
            <Link
              to="/my-bookings"
              className={`hover:text-indigo-400 transition-colors ${
                location.pathname === "/my-bookings" ? "text-indigo-400" : "theme-text-nav"
              }`}
            >
              {t("nav.myBookings")}
            </Link>
          )}
        </nav>

        {/* User Session Info / Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Dashboard Link for Owner & Admin */}
              {isOwner && (
                <Link
                  to="/owner/dashboard"
                  className="hidden sm:flex items-center gap-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border border-indigo-400/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t("nav.ownerChannel")}
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1 bg-pink-600/80 hover:bg-pink-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border border-pink-400/20"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {t("nav.adminChannel")}
                </Link>
              )}

              {/* User profile avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 border-l theme-border pl-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg py-1 pr-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold theme-text leading-tight">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] theme-text-muted">{user.role}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 theme-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 theme-dropdown border theme-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm theme-text-nav hover:theme-dropdown-hover rounded-lg transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-indigo-400" />
                        {t("nav.profile")}
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm theme-text-nav hover:theme-dropdown-hover rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        {t("nav.settings")}
                      </Link>
                      {isUser && (
                        <Link
                          to="/my-bookings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm theme-text-nav hover:theme-dropdown-hover rounded-lg transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-green-400" />
                          {t("nav.bookingHistory")}
                        </Link>
                      )}
                      <Link
                        to="/change-password"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm theme-text-nav hover:theme-dropdown-hover rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4 text-yellow-400" />
                        {t("nav.changePassword")}
                      </Link>
                      <div className="border-t theme-border my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium theme-text-nav hover:theme-text px-3 py-1.5 transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t theme-border theme-footer py-8 px-6 text-center theme-text-muted text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold theme-text">SmashPlay</span>
            <span>- {t("footer.tagline")}</span>
          </div>
          <div>© {new Date().getFullYear()} SmashPlay. {t("footer.copyright")}</div>
        </div>
      </footer>
    </div>
  );
};
