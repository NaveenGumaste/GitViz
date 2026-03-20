"use client";

import { useState } from "react";
import { Github, Linkedin, Twitter, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ContactFormSchema, type ContactFormInput } from "@/lib/schemas/contact";

interface ContactErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function AboutContact(): React.ReactNode {
  const [form, setForm] = useState<ContactFormInput>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateField = <K extends keyof ContactFormInput>(field: K, value: ContactFormInput[K]): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setStatus("submitting");

    const parsed = ContactFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
      });
      setStatus("error");
      setFeedback("Please correct the highlighted fields.");
      return;
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const body: unknown = await response.json();
    if (!response.ok) {
      setStatus("error");
      setFeedback(body && typeof body === "object" && "error" in body ? String((body as { error: string }).error) : "Something went wrong.");
      return;
    }

    setForm({ name: "", email: "", message: "" });
    setErrors({});
    setStatus("success");
    setFeedback(body && typeof body === "object" && "message" in body ? String((body as { message: string }).message) : "Thanks for reaching out.");
  };

  return (
    <section className="bg-surface text-paper" id="about">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-paper/60">About</p>
            <h2 className="font-display text-[clamp(2.3rem,4vw,4rem)] leading-[0.95] tracking-[-0.05em]">
              Built with obsession.
            </h2>
            <div className="space-y-5 text-base leading-8 text-paper/72">
              <p>
                Git repositories are dense with signal. This visualizer turns that signal into a readable layout so the structure, activity, and people behind a project feel immediate rather than hidden.
              </p>
              <p>
                The goal is to make repository analysis feel editorial: calm typography, strong contrast, and carefully paced motion that helps you explore without losing the shape of the whole codebase.
              </p>
            </div>
          </div>

          <Button
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            variant="outline"
            size="lg"
            iconRight={<Github className="size-4" aria-hidden="true" />}
            className="border-paper/15 bg-paper/5 text-paper hover:bg-paper/10 hover:text-paper"
          >
            GitHub
          </Button>
        </div>

        <Card className="border-paper/10 bg-paper/5 p-6 text-paper shadow-none dark:border-paper/10 dark:bg-paper/5">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-paper/60">Contact</p>
            <h3 className="font-display text-3xl tracking-[-0.04em]">Connect or send a note.</h3>
            <p className="text-sm leading-7 text-paper/68">
              The form is validated with Zod before it reaches the route handler, so submissions stay structured and predictable.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-paper/80">Name</span>
                <Input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Ada Lovelace"
                  invalid={Boolean(errors.name)}
                  className="border-paper/15 bg-paper/5 text-paper placeholder:text-paper/45 focus:ring-accent/20 dark:border-paper/15 dark:bg-paper/5 dark:text-paper"
                />
                {errors.name ? <span className="text-xs text-[#ffb8a1]">{errors.name}</span> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-paper/80">Email</span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="ada@example.com"
                  invalid={Boolean(errors.email)}
                  className="border-paper/15 bg-paper/5 text-paper placeholder:text-paper/45 focus:ring-accent/20 dark:border-paper/15 dark:bg-paper/5 dark:text-paper"
                />
                {errors.email ? <span className="text-xs text-[#ffb8a1]">{errors.email}</span> : null}
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-paper/80">Message</span>
              <Textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Tell me what you want to build or improve."
                invalid={Boolean(errors.message)}
                className="border-paper/15 bg-paper/5 text-paper placeholder:text-paper/45 focus:ring-accent/20 dark:border-paper/15 dark:bg-paper/5 dark:text-paper"
              />
              {errors.message ? <span className="text-xs text-[#ffb8a1]">{errors.message}</span> : null}
            </label>

            {feedback ? <p className={status === "success" ? "text-sm text-[#a4ffcf]" : "text-sm text-[#ffb8a1]"}>{feedback}</p> : null}

            <Button type="submit" loading={status === "submitting"} variant="primary" size="lg" iconRight={<Send className="size-4" aria-hidden="true" />}>
              Send Message
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: "GitHub", href: "https://github.com", icon: Github },
              { label: "Twitter/X", href: "https://x.com", icon: Twitter },
              { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
              { label: "Email", href: "mailto:hello@example.com", icon: Mail },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-paper/15 bg-paper/5 text-paper transition-all duration-300 hover:-translate-y-1 hover:bg-paper/10"
                  aria-label={item.label}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}
