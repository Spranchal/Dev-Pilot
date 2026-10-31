"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type ChatMessageItem, type ChatSession } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useChatSessions(repositoryId: string) {
  return useQuery({
    queryKey: queryKeys.chat.sessions(repositoryId),
    queryFn: () => api.listChatSessions(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.messages(sessionId ?? ""),
    queryFn: () => (sessionId ? api.getChatMessages(sessionId) : Promise.resolve([])),
    enabled: Boolean(sessionId),
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      repositoryId,
      title,
    }: {
      repositoryId: string;
      title?: string;
    }) => api.createChatSession(repositoryId, title),
    onSuccess: (session) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.sessions(session.repositoryId),
      });
    },
  });
}

