import { cloneElement, useId } from "react";
import { Text } from "../Text";
import { Group, Label } from "./styles";
import type { FieldProps } from "./types";
export function Field({ label, hint, error, children }: FieldProps) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [children.props["aria-describedby"], hint && hintId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <Group>
      <Label htmlFor={id}>
        {label}
        {children.props.required && <span aria-hidden="true"> *</span>}
      </Label>
      {cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })}
      {hint && (
        <Text as="p" size="sm" tone="muted" id={hintId}>
          {hint}
        </Text>
      )}
      {error && (
        <Text as="p" size="sm" tone="danger" id={errorId} role="alert">
          {error}
        </Text>
      )}
    </Group>
  );
}
export type { FieldProps } from "./types";
