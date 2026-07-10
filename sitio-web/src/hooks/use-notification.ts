"use client";

import { useCallback, useState } from "react";
import { type NotificationType } from "@/components/ui/notification";

interface NotificationState {
  type: NotificationType;
  title: string;
  message?: string;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  const showNotification = useCallback(
    (type: NotificationType, title: string, message?: string) => {
      setNotification({ type, title, message });
    },
    [],
  );

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const notifySuccess = useCallback(
    (title: string, message?: string) => {
      showNotification("success", title, message);
    },
    [showNotification],
  );

  const notifyError = useCallback(
    (title: string, message?: string) => {
      showNotification("error", title, message);
    },
    [showNotification],
  );

  const notifyWarning = useCallback(
    (title: string, message?: string) => {
      showNotification("warning", title, message);
    },
    [showNotification],
  );

  const notifyInfo = useCallback(
    (title: string, message?: string) => {
      showNotification("info", title, message);
    },
    [showNotification],
  );

  return {
    notification,
    showNotification,
    closeNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}
