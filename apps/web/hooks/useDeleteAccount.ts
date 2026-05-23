import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { apiMutateVoid } from "@/lib/api";

export function useDeleteAccount() {
  const { user, mutate } = useUser();
  const router = useRouter();
  
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await apiMutateVoid("/users/me", "DELETE");
      // Clear user session cache and redirect
      await mutate(undefined, { revalidate: false });
      toast.success("Your account has been permanently deleted.");
      router.push("/login");
    } catch (err) {
      console.error("Account deletion failed:", err);
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
      setDeleteStep(0);
      setConfirmEmail("");
    }
  };

  return {
    user,
    deleteStep,
    setDeleteStep,
    confirmEmail,
    setConfirmEmail,
    isDeleting,
    confirmDelete,
  };
}
