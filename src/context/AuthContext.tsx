'use client';

import { createContext, useContext, useMemo, useState } from "react";
import type { Role } from "@prisma/client";

export type DemoUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  consentGiven: boolean;
};

const demoUsers: DemoUser[] = [
  {
    id: "creator-demo",
    name: "Sam Chen",
    email: "creator@mergeboost.dev",
    role: "CONTENT_CREATOR",
    consentGiven: true,
  },
  {
    id: "approver-demo",
    name: "Jordan Blake",
    email: "approver@mergeboost.dev",
    role: "CONTENT_APPROVER",
    consentGiven: true,
  },
  {
    id: "admin-demo",
    name: "Alex Rivera",
    email: "admin@mergeboost.dev",
    role: "ADMIN",
    consentGiven: true,
  },
];

type AuthContextValue = {
  currentUser: DemoUser;
  users: DemoUser[];
  switchUser: (email: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[0]);

  const switchUser = (email: string) => {
    const nextUser = demoUsers.find((user) => user.email === email);
    if (nextUser) {
      setCurrentUser(nextUser);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      users: demoUsers,
      switchUser,
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
