import { create } from "zustand";

type AccountForm = {
  password: string;
  newPassword: string;
  confirmPassword: string;
  email: string;
  setPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setEmail: (value: string) => void;
};

export const useTeacherAccountFormStore = create<AccountForm>((set) => ({
  password: "",
  confirmPassword: "",
  email: "",
  newPassword: "",
  setPassword: (value: string) => set({ password: value }),
  setNewPassword: (value: string) => set({ newPassword: value }),
  setConfirmPassword: (value: string) => set({ confirmPassword: value }),
  setEmail: (value: string) => set({ email: value }),
}));
