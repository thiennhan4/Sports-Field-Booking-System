export const translations = {
  vi: {
    nav: {
      home: "Trang Chủ",
      search: "Tìm Sân",
      myBookings: "Lịch Đặt Của Tôi",
      login: "Đăng Nhập",
      register: "Đăng Ký",
      ownerChannel: "Kênh Chủ Sân",
      adminChannel: "Kênh Quản Trị",
      profile: "Hồ sơ",
      settings: "Cài đặt",
      bookingHistory: "Lịch đặt sân",
      changePassword: "Đổi mật khẩu",
      logout: "Đăng xuất",
    },
    footer: {
      tagline: "Nền tảng đặt sân thể thao chuyên nghiệp",
      copyright: "Mọi quyền được bảo lưu.",
    },
    settings: {
      title: "Cài Đặt",
      subtitle: "Tùy chỉnh trải nghiệm của bạn trên SmashPlay",
      loginRequired: "Yêu cầu đăng nhập",
      loginRequiredDesc: "Vui lòng đăng nhập để xem cài đặt.",
      saveSuccess: "Lưu cài đặt thành công!",
      saveError: "Không thể lưu cài đặt. Vui lòng thử lại.",
      loading: "Đang tải cài đặt...",
      appearance: "Giao diện",
      darkMode: "Chế độ tối",
      darkModeDesc: "Sử dụng giao diện tối cho ứng dụng",
      notifications: "Thông báo",
      emailNotifications: "Thông báo email",
      emailNotificationsDesc: "Nhận thông báo về đặt sân và khuyến mãi",
      language: "Ngôn ngữ",
      selectLanguage: "Chọn ngôn ngữ",
      vietnamese: "🇻🇳 Tiếng Việt",
      english: "🇺🇸 English",
      save: "Lưu cài đặt",
      saving: "Đang lưu...",
    },
  },
  en: {
    nav: {
      home: "Home",
      search: "Find Courts",
      myBookings: "My Bookings",
      login: "Login",
      register: "Sign Up",
      ownerChannel: "Owner Portal",
      adminChannel: "Admin Portal",
      profile: "Profile",
      settings: "Settings",
      bookingHistory: "Booking History",
      changePassword: "Change Password",
      logout: "Logout",
    },
    footer: {
      tagline: "Professional sports court booking platform",
      copyright: "All rights reserved.",
    },
    settings: {
      title: "Settings",
      subtitle: "Customize your SmashPlay experience",
      loginRequired: "Login Required",
      loginRequiredDesc: "Please log in to view settings.",
      saveSuccess: "Settings saved successfully!",
      saveError: "Failed to save settings. Please try again.",
      loading: "Loading settings...",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      darkModeDesc: "Use dark theme for the application",
      notifications: "Notifications",
      emailNotifications: "Email Notifications",
      emailNotificationsDesc: "Receive notifications about bookings and promotions",
      language: "Language",
      selectLanguage: "Select language",
      vietnamese: "🇻🇳 Tiếng Việt",
      english: "🇺🇸 English",
      save: "Save Settings",
      saving: "Saving...",
    },
  },
};

export const t = (language, key) => {
  const keys = key.split(".");
  let value = translations[language] || translations.vi;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }
  return value;
};
