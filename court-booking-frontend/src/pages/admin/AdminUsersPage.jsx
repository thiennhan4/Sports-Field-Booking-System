// src/pages/admin/AdminUsersPage.jsx

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth.service";
import { Check, X } from "lucide-react";

export const AdminUsersPage = () => {
  const queryClient = useQueryClient();

  const { data: usersList, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: authService.getAllUsers,
  });

  const approveMutation = useMutation({
    mutationFn: authService.approveOwner,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
    },
    onError: (err) => {
      alert(err.message || "Duyệt chủ sân thất bại.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: authService.rejectOwner,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
    },
    onError: (err) => {
      alert(err.message || "Từ chối chủ sân thất bại.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs mt-3">Đang tải danh sách chủ sân chờ duyệt...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Duyệt Chủ Sân</h1>
        <p className="text-gray-400 text-sm mt-1 font-light">
          Danh sách tài khoản chủ sân đăng ký mới, chờ Admin phê duyệt trước khi sử dụng hệ thống
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 pt-4 pb-4">
                <th className="py-4 px-6 text-gray-400 font-bold uppercase tracking-wider text-[10px]">Tên đăng nhập</th>
                <th className="py-4 px-6 text-gray-400 font-bold uppercase tracking-wider text-[10px]">Email</th>
                <th className="py-4 px-6 text-gray-400 font-bold uppercase tracking-wider text-[10px]">Số điện thoại</th>
                <th className="py-4 px-6 text-gray-400 font-bold uppercase tracking-wider text-[10px]">Ngày đăng ký</th>
                <th className="py-4 px-6 text-gray-400 font-bold uppercase tracking-wider text-[10px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersList?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 text-sm">
                    Không có chủ sân nào đang chờ duyệt.
                  </td>
                </tr>
              ) : (
                usersList?.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{userItem.fullName}</td>
                    <td className="py-4 px-6 text-gray-300">{userItem.email}</td>
                    <td className="py-4 px-6 text-gray-300">{userItem.phone || "—"}</td>
                    <td className="py-4 px-6 text-gray-400">{userItem.createdAt}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approveMutation.mutate(userItem.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Duyệt chủ sân"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Từ chối tài khoản chủ sân này?")) {
                              rejectMutation.mutate(userItem.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          title="Từ chối chủ sân"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
