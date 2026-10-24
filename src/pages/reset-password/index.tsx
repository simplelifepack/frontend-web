import { spacing } from "@/design-system";
import {
  Field,
  Heading,
  Text,
  PasswordInput,
  Button,
  Stack,
} from "@/design-system";

import BrandLogo from "@/components/BrandLogo";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token: authToken, user } = useAppSelector((state) => state.auth);
  const [resetToken] = useState(() => searchParams.get("token")?.trim() ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!searchParams.has("token")) return;
    const sanitized = new URLSearchParams(searchParams);
    sanitized.delete("token");
    const query = sanitized.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [searchParams]);

  if (authToken && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!resetToken) {
      setError("This reset link is missing a token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.auth.resetPassword({
        token: resetToken,
        password,
      });
      setSuccessMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack $gap="s16">
      <BrandLogo height={Number.parseInt(spacing.s40)} />
      <Heading level={2} size="md">
        Reset password
      </Heading>
      <Text as="p" size="md" tone="muted">
        Create a new password for your Readines account.
      </Text>

      <Stack as="form" $gap="s16" onSubmit={handleSubmit}>
        <Field label="New password">
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </Field>

        <Field label="Confirm password">
          <PasswordInput
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </Field>

        {error ? (
          <Text as="p" size="md" tone="danger" role="alert">
            {error}
          </Text>
        ) : null}
        {successMessage ? (
          <Text as="p" size="md" role="status" tone="success">
            {successMessage}
          </Text>
        ) : null}

        <Button
          size="lg"
          loading={isSubmitting}
          variant="primary"
          type="submit"
          disabled={isSubmitting || !resetToken}
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </Stack>

      <Stack>
        <Button
          size="sm"
          variant="tertiary"
          type="button"
          onClick={() => navigate("/", { state: { authMode: "signin" } })}
        >
          Go to login
        </Button>
      </Stack>
    </Stack>
  );
}
