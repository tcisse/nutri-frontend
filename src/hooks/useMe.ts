"use client";

import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "@/lib/api";
import { getUserToken } from "@/lib/cookies";

export const useMe = () => {
  const token = getUserToken();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 min
    retry: false,
  });

  const user = query.data?.user;
  const latestSession = user?.sessions?.[0] ?? null;

  return {
    ...query,
    user,
    userId: user?.id ?? null,
    userName: user?.firstName ?? null,
    userFullName: user ? `${user.firstName} ${user.lastName}`.trim() : null,
    country: user?.country ?? null,
    sessionId: latestSession?.id ?? null,
    session: latestSession,
    isAuthenticated: !!user,
  };
};
