import { create } from "zustand";

type AccountForm = {
  studentPassword: string;
  studentNewPassword: string;
  studentConfirmNewPassword: string;
  studentEmail: string;
  setStudentPassword: (value: string) => void;
  setStudentNewPassword: (value: string) => void;
  setStudentConfirmNewPassword: (value: string) => void;
  setStudentEmail: (value: string) => void;
};

export const useStudentAccountFormStore = create<AccountForm>((set) => ({
  studentPassword: "",
  studentNewPassword: "",
  studentEmail: "",
  studentConfirmNewPassword: "",
  setStudentPassword: (value: string) => set({ studentPassword: value }),
  setStudentNewPassword: (value: string) => set({ studentNewPassword: value }),
  setStudentConfirmNewPassword: (value: string) => set({ studentConfirmNewPassword: value }),
  setStudentEmail: (value: string) => set({ studentEmail: value }),
}));
