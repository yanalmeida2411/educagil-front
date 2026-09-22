import { create } from "zustand";

type ProfileForm = {
  firstNameStudentInput: string;
  lastNameStudentInput: string;
  studentTeam: string;
  searchStudentTerm: string;
  setFirstNameStudentInput: (value: string) => void;
  setLastNameStudentInput: (value: string) => void;
  setStudentTeam: (value: string) => void;
  setSearchStudentTerm: (value: string) => void;
};
export const useStudentProfileFormStore = create<ProfileForm>((set) => ({
  firstNameStudentInput: "",
  studentTeam: "",
  searchStudentTerm: "",
  lastNameStudentInput: "",
  setStudentTeam: (value: string) => set({ studentTeam: value }),
  setFirstNameStudentInput: (value: string) => set({ firstNameStudentInput: value }),
  setLastNameStudentInput: (value: string) => set({ lastNameStudentInput: value }),
  setSearchStudentTerm: (value: string) => set({ searchStudentTerm: value }),
}));
