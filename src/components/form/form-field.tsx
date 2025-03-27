import { AlertCircle } from "lucide-react";
import { Label } from "../ui/label";
import { FieldError } from "react-hook-form";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  errors?: FieldError | undefined;
  icon: ReactNode;
  children: ReactNode;
}

const FormField = ({ label, name, errors, icon, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {children}
      {errors && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {errors.message}
        </p>
      )}
    </div>
  );
};

export default FormField;
