import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return {
    handleLogout,
  };
};
