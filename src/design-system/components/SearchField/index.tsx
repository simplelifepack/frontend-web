import { forwardRef } from "react";
import { Search } from "lucide-react";
import { Field, Control } from "./styles";
import type { SearchFieldProps } from "./types";
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, style, appearance = "default", ...props }, ref) => (
    <Field $appearance={appearance} className={className} style={style}>
      <Search aria-hidden="true" />
      <Control
        $appearance={appearance}
        data-ds-control=""
        type="search"
        {...props}
        ref={ref}
      />
    </Field>
  ),
);
SearchField.displayName = "SearchField";
