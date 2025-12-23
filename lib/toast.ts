import { toastManager } from "@/components/ui/toast";

// Base UI Toast Manager API
// Method: add() - adds a new toast
export function toast(
  title: string,
  description?: string,
  type: "success" | "error" | "info" | "warning" | "loading" = "info"
) {
  try {
    // Base UI uses 'add' method to create a toast
    toastManager.add({
      type,
      title,
      description,
    });
  } catch (error) {
    console.error("Error creating toast:", error);
  }
}

export const toastSuccess = (title: string, description?: string) =>
  toast(title, description, "success");

export const toastError = (title: string, description?: string) =>
  toast(title, description, "error");

export const toastInfo = (title: string, description?: string) =>
  toast(title, description, "info");

export const toastWarning = (title: string, description?: string) =>
  toast(title, description, "warning");

export const toastLoading = (title: string, description?: string) =>
  toast(title, description, "loading");
