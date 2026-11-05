"use client";

import { useActionState } from "react";
import { submitGreeting } from "../actions";

const initialState = {
  message: "",
  success: false,
};

export function ServerActionForm() {
  const [state, formAction, pending] = useActionState(
    submitGreeting,
    initialState,
  );

  return (
    <>
      <form action={formAction}>
        <label htmlFor="name">Test value</label>
        <input
          id="name"
          name="name"
          maxLength={40}
          placeholder="App Service Builder"
          required
        />
        <button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Run server action"}
        </button>
      </form>
      {state.message ? (
        <p className="result" role="status" data-success={state.success}>
          {state.message}
        </p>
      ) : null}
    </>
  );
}
