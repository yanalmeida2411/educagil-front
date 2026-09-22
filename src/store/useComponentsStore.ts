import { create } from "zustand";

type OpenCloseComponents = {
  isTeacherModalOpen: boolean;
  setIsTeacherModalOpen: (value: boolean) => void;
  sucessMessage: boolean;
  setSucessMessage: (value: boolean) => void;
  isStudentModalOpen: boolean;
  setIsStudentModalOpen: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  isStudentMobileMenuOpen: boolean;
  setIsStudentMobileMenuOpen: (value: boolean) => void;

};
export const useComponentsStore = create<OpenCloseComponents>((set) => ({
  isTeacherModalOpen: false,
  sucessMessage: false,
  isStudentModalOpen: false,
  isMobileMenuOpen:false,
  isStudentMobileMenuOpen:false,
  setIsTeacherModalOpen: (value: boolean) => set({ isTeacherModalOpen: value }),
  setSucessMessage: (value: boolean) => set({ sucessMessage: value }),
  setIsStudentModalOpen: (value: boolean) => set({ isStudentModalOpen: value }),
  setIsMobileMenuOpen: (value: boolean) => set({ isMobileMenuOpen: value }),
  setIsStudentMobileMenuOpen: (value: boolean) => set({ isStudentMobileMenuOpen: value }),
}));
