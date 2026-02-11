import React from "react";
import { useStore } from "../../store/store";
import { TextField } from "@cmsgov/design-system";

export default function Profile() {
  const user = useStore((state) => state.user);

  const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const email = user.email ?? "";
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const role = capitalize(user.role);
  const state = user.state ?? "";

  return (
    <div>
      <h1>Profile</h1>
      <div>
        <div>
          <div>
            <form>
              <TextField label="Email" value={email} disabled={true} />
              <TextField label="First Name" value={firstName} disabled={true} />
              <TextField label="Last Name" value={lastName} disabled={true} />
              <TextField label="Role" value={role} disabled={true} />
              <TextField label="State" value={state} disabled={true} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
