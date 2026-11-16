"use client";

import { type FormEvent, useId, useState } from "react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "done"; email: string };

/** Something before the @, a domain, a dot and at least two letters. Deliberately loose: the real test is the confirmation email. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(value: string): string | null {
  const email = value.trim();
  if (email === "") return "Enter your email address.";
  if (!email.includes("@")) return "An email address needs an @. Check it and try again.";
  if (!EMAIL.test(email)) return "That address looks incomplete. It should read like name@example.com.";
  if (email.length > 254) return "That address is too long to be valid.";
  return null;
}

/**
 * Newsletter sign-up with its own validation (the browser's bubbles are
 * switched off with `noValidate` so the message can sit in the page, in our
 * type). The check runs on submit, and after a first error on every change,
 * so the message goes as soon as the address is right. Errors are tied to the
 * field for screen readers.
 *
 * This is a sample site: nothing is sent or stored, and the confirmation says so.
 */
export function NewsletterForm() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inputId = useId();
  const messageId = useId();
  const invalid = status.kind === "error";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validate(value);
    if (problem) {
      setStatus({ kind: "error", message: problem });
      return;
    }
    setStatus({ kind: "done", email: value.trim() });
    setValue("");
  };

  const onChange = (next: string) => {
    setValue(next);
    if (status.kind === "error") {
      const problem = validate(next);
      setStatus(problem ? { kind: "error", message: problem } : { kind: "idle" });
    } else if (status.kind === "done") {
      setStatus({ kind: "idle" });
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-[26rem]">
      <label htmlFor={inputId}>
        <Label tone="strong">Newsletter</Label>
      </label>
      <p className="mt-3 text-taupe-ink">Four letters a year: new pieces, and how they were made.</p>

      <div
        className={cn(
          "mt-5 flex items-end gap-5 border-b transition-colors duration-500 ease-quiet",
          invalid ? "border-espresso" : "border-taupe focus-within:border-espresso",
        )}
      >
        <input
          id={inputId}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email address"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={messageId}
          className="min-h-11 w-full bg-transparent outline-none placeholder:text-taupe-ink"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 font-sans text-label font-medium uppercase tracking-label"
        >
          Subscribe
        </button>
      </div>

      <p id={messageId} role="status" aria-live="polite" className="mt-3 min-h-12">
        {status.kind === "error" && <span>{status.message}</span>}
        {status.kind === "done" && (
          <span>
            Thank you. {status.email} would now be on the list.{" "}
            <span className="text-taupe-ink">This is a sample site, so nothing was sent or stored.</span>
          </span>
        )}
      </p>
    </form>
  );
}
