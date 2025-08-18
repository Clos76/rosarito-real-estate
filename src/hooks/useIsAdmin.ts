// hooks/useIsAdmin.tsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useIsAdmin(uid: string | undefined) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      console.log("Checking admin status for UID:", uid);
      
      if (!uid) {
        console.log("No UID provided, setting isAdmin to false");
        setIsAdmin(false);
        return;
      }

      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("User document found:", userData);
          const adminStatus = userData.role === "admin";
          console.log("Admin status:", adminStatus);
          setIsAdmin(adminStatus);
        } else {
          console.log("User document does not exist, setting isAdmin to false");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    // Reset admin status when uid changes
    setIsAdmin(null);
    checkAdmin();
  }, [uid]);

  return isAdmin;
}