import { create } from "zustand";

type ProfileForm = {
  firstNameInput: string;
  lastNameInput: string;
  linkedin: string;
  team: string;
  searchTerm: string;
  setFirstNameInput: (value: string) => void;
  setLastNameInput: (value: string) => void;
  setLinkedin: (value: string) => void;
  setTeam: (value: string) => void;
  setSearchTerm: (value: string) => void;
};
export const useTeacherProfileFormStore = create<ProfileForm>((set) => ({
  firstNameInput: "",
  lastNameInput: "",
  specialty: "",
  linkedin: "",
  team: "",
  searchTerm: "",
  setTeam: (value: string) => set({ team: value }),
  setFirstNameInput: (value: string) => set({ firstNameInput: value }),
  setLastNameInput: (value: string) => set({ lastNameInput: value }),
  setLinkedin: (value: string) => set({ linkedin: value }),
  setSearchTerm: (value: string) => set({ searchTerm: value }),
}));
