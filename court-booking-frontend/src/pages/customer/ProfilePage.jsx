// src/pages/customer/ProfilePage.jsx

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";
import { User, Mail, ShieldAlert, Check } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ")
});

export const ProfilePage = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || ""
    }
  });

  const onSubmit = async (data) => {
    setSuccess(false);
    setServerError(null);
    try {
      await authService.updateProfile(data);
      setSuccess(true);
      setTimeout(() => {
        // Trigger a reload to refresh auth header text
        window.location.reload();
      }, 1000);
    } catch (err) {
      setServerError(err.message || "Lỗi cập nhật hồ sơ.");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md w-full mx-auto my-12 text-center glass-card p-8 rounded-3xl border border-white/5">
        <ShieldAlert className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Yêu cầu đăng nhập</h2>
        <p className="text-gray-400 text-xs">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Hồ Sơ Cá Nhân</h1>
        <p className="text-gray-400 text-sm mt-1">
          Cập nhật thông tin tài khoản và cấu hình hệ thống
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{user.role}</p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>Cập nhật thông tin hồ sơ thành công! Đang tải lại...</span>
          </div>
        )}

        {serverError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Họ và tên
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("fullName")}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            {errors.fullName && (
              <span className="text-[10px] text-red-400 font-semibold">{errors.fullName.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-400 font-semibold">{errors.email.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Lưu thông tin thay đổi"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
