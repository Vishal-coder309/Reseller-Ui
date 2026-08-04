"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHead, Toast } from "@/components/ui";
import CreateUserForm from "@/components/CreateUserForm";

export default function CreateUser() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <PageHead kicker="Manage Users" title="Create User" />
      <div className="card card-pad" style={{ maxWidth: 900 }}>
        <CreateUserForm
          onToast={setToast}
          onCreated={(username) => { setToast(`User ${username} created`); setTimeout(() => router.push("/user-list"), 900); }}
        />
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
