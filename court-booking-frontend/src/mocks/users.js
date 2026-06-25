// src/mocks/users.js

export const users = [
  {
    id: 1,
    fullName: "Nguyen Van A",
    email: "user@gmail.com",
    password: "password",
    role: "USER",
    isBlocked: false,
    createdAt: "2026-01-10"
  },
  {
    id: 2,
    fullName: "Owner Business",
    email: "owner@gmail.com",
    password: "password",
    role: "OWNER",
    isBlocked: false,
    createdAt: "2026-02-15"
  },
  {
    id: 3,
    fullName: "Admin Master",
    email: "admin@gmail.com",
    password: "password",
    role: "ADMIN",
    isBlocked: false,
    createdAt: "2026-01-01"
  },
  {
    id: 4,
    fullName: "Tran Thi B",
    email: "customer2@gmail.com",
    password: "password",
    role: "USER",
    isBlocked: true, // Mocked as blocked to showcase admin list features
    createdAt: "2026-03-20"
  }
];
