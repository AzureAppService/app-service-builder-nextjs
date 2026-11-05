"use server";

export async function submitGreeting(_previousState, formData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 40) {
    return {
      message: "Enter a name between 1 and 40 characters.",
      success: false,
    };
  }

  return {
    message: `Server action received: ${name}`,
    success: true,
  };
}
