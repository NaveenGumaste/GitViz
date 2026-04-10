"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  ContactFormSchema,
  type ContactFormInput,
} from "@/lib/schemas/contact";

interface ContactErrors {
  name?: string;
  email?: string;
  message?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 20,
    },
  },
};

export function AboutContact(): React.ReactNode {
  const [form, setForm] = useState<ContactFormInput>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateField = <K extends keyof ContactFormInput>(
    field: K,
    value: ContactFormInput[K],
  ): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
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

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const body: unknown = await response.json();

      if (!response.ok) {
        setStatus("error");
        setFeedback(
          body && typeof body === "object" && "error" in body
            ? String((body as { error: string }).error)
            : "Something went wrong.",
        );
        return;
      }

      setForm({ name: "", email: "", message: "" });
      setErrors({});
      setStatus("success");
      setFeedback(
        body && typeof body === "object" && "message" in body
          ? String((body as { message: string }).message)
          : "Thanks for reaching out.",
      );
    } catch {
      setStatus("error");
      setFeedback("Failed to send message. Please try again later.");
    }
  };

  const socialLinks = [
    { label: "GitHub", href: "https://github.com", icon: Github },
    { label: "Twitter", href: "https://x.com", icon: Twitter },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { label: "Email", href: "mailto:hello@example.com", icon: Mail },
  ] as const;

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
          <span className="font-display text-[clamp(8rem,24vw,30rem)] font-bold leading-none tracking-[-0.08em] text-ink/[0.05] dark:text-paper/[0.05]">
            GITVIZ
          </span>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,77,0,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,77,0,0.05),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,77,0,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,77,0,0.08),transparent_28%)]" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="relative z-10 mx-auto grid max-w-7xl items-start gap-14 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8"
      >
        <motion.div variants={itemVariants} className="space-y-10">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border border-border bg-paper/80 px-4 py-1.5 text-sm font-semibold tracking-wide text-muted backdrop-blur-sm dark:border-border-dark dark:bg-surface/75 dark:text-paper/65">
              About GitViz
            </p>

            <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.05em] text-ink dark:text-paper">
              Built with
              <br />
              <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                obsession.
              </span>
            </h2>

            <div className="max-w-xl space-y-5 text-base leading-8 text-muted dark:text-paper/62">
              <p>
                Git repositories are full of structure, momentum, and human
                effort. GitViz turns that dense signal into a clean visual
                system so the shape of a project becomes instantly readable.
              </p>
              <p>
                The experience is designed to feel editorial and intentional:
                strong hierarchy, subtle motion, and balanced contrast in both
                light and dark themes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="lg"
              iconRight={<Github className="size-4" aria-hidden="true" />}
              className="border-border bg-paper/80 text-ink hover:border-accent hover:bg-paper dark:border-border-dark dark:bg-surface/75 dark:text-paper dark:hover:border-accent dark:hover:bg-surface"
            >
              View on GitHub
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [
                "Visual clarity",
                "Built to make complex repositories easy to read.",
              ],
              [
                "Theme aware",
                "Carefully balanced surfaces in both light and dark.",
              ],
              [
                "Fast feedback",
                "Validated contact flow with clear user feedback.",
              ],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-border bg-paper/70 p-4 backdrop-blur-sm dark:border-border-dark dark:bg-surface/60"
              >
                <p className="text-sm font-semibold text-ink dark:text-paper">
                  {title}
                </p>
                <p className="mt-2 text-xs leading-6 text-muted dark:text-paper/55">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border bg-paper/85 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-border-dark dark:bg-surface/82 dark:shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/6 via-transparent to-transparent dark:from-accent/10" />

            <div className="relative space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-muted dark:text-paper/48">
                Contact
              </p>
              <h3 className="font-display text-3xl tracking-[-0.04em] text-ink dark:text-paper">
                Send a note
              </h3>
              <p className="max-w-lg text-sm leading-7 text-muted dark:text-paper/60">
                Have an idea, a feature request, or want to collaborate? Send a
                message and keep it simple.
              </p>
            </div>

            <form className="relative mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="ml-1 text-sm font-medium text-ink/80 dark:text-paper/80">
                    Name
                  </span>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Ada Lovelace"
                    invalid={Boolean(errors.name)}
                    className="rounded-[1.25rem] border-border bg-paper text-ink placeholder:text-muted focus:border-accent focus:ring-accent-muted dark:border-border-dark dark:bg-ink/60 dark:text-paper dark:placeholder:text-paper/30"
                  />
                  {errors.name ? (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="ml-1 block text-xs text-red-500 dark:text-red-400"
                    >
                      {errors.name}
                    </motion.span>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="ml-1 text-sm font-medium text-ink/80 dark:text-paper/80">
                    Email
                  </span>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="ada@example.com"
                    invalid={Boolean(errors.email)}
                    className="rounded-[1.25rem] border-border bg-paper text-ink placeholder:text-muted focus:border-accent focus:ring-accent-muted dark:border-border-dark dark:bg-ink/60 dark:text-paper dark:placeholder:text-paper/30"
                  />
                  {errors.email ? (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="ml-1 block text-xs text-red-500 dark:text-red-400"
                    >
                      {errors.email}
                    </motion.span>
                  ) : null}
                </label>
              </div>

              <label className="block space-y-2">
                <span className="ml-1 text-sm font-medium text-ink/80 dark:text-paper/80">
                  Message
                </span>
                <Textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Tell me what you want to build or improve."
                  invalid={Boolean(errors.message)}
                  className="min-h-[128px] rounded-[1.5rem] border-border bg-paper text-ink placeholder:text-muted focus:border-accent focus:ring-accent-muted dark:border-border-dark dark:bg-ink/60 dark:text-paper dark:placeholder:text-paper/30"
                />
                {errors.message ? (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-1 block text-xs text-red-500 dark:text-red-400"
                  >
                    {errors.message}
                  </motion.span>
                ) : null}
              </label>

              {feedback ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={
                    status === "success"
                      ? "rounded-[1rem] border border-green-500/20 bg-green-500/10 p-3 text-sm font-medium text-green-700 dark:text-green-400"
                      : "rounded-[1rem] border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-700 dark:text-red-400"
                  }
                >
                  {feedback}
                </motion.div>
              ) : null}

              <Button
                type="submit"
                loading={status === "submitting"}
                size="lg"
                iconRight={<Send className="size-4" aria-hidden="true" />}
                className="w-full rounded-[1.3rem] sm:w-auto"
              >
                Send Message
              </Button>
            </form>

            <div className="relative mt-10 flex flex-wrap gap-4 border-t border-border/80 pt-8 dark:border-border-dark/80">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http") ? "noreferrer" : undefined
                    }
                    className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-paper/85 text-ink/70 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-paper hover:text-accent hover:shadow-[0_0_18px_rgba(255,77,0,0.18)] dark:border-border-dark dark:bg-ink/55 dark:text-paper/70 dark:hover:border-accent dark:hover:bg-surface dark:hover:text-accent"
                    aria-label={item.label}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
