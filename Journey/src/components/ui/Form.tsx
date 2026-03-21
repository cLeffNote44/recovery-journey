import { ReactNode, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

// =============================================================================
// FORM FIELD WRAPPER
// =============================================================================

interface FormFieldProps {
  /** Field label */
  label: string
  /** Input name/id */
  name: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Whether field is required */
  required?: boolean
  /** Children (input element) */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Form field wrapper with label, error, and helper text
 */
export function FormField({
  label,
  name,
  error,
  helperText,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500" id={`${name}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// INPUT COMPONENT
// =============================================================================

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Error state */
  error?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Left addon (icon or text) */
  leftAddon?: ReactNode
  /** Right addon (icon or text) */
  rightAddon?: ReactNode
}

/**
 * Styled input component
 *
 * @example
 * ```tsx
 * <FormField label="Email" name="email" error={errors.email}>
 *   <Input
 *     name="email"
 *     type="email"
 *     placeholder="Enter email"
 *     error={!!errors.email}
 *   />
 * </FormField>
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, size = 'md', leftAddon, rightAddon, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    }

    const baseClasses = `
      block w-full rounded-md border shadow-sm
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      }
      ${sizeClasses[size]}
    `

    if (leftAddon || rightAddon) {
      return (
        <div className="relative flex rounded-md shadow-sm">
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            className={`${baseClasses} ${leftAddon ? 'rounded-l-none' : ''} ${rightAddon ? 'rounded-r-none' : ''} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {rightAddon}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state */
  error?: boolean
  /** Auto-resize */
  autoResize?: boolean
}

/**
 * Styled textarea component
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, autoResize, ...props }, ref) => {
    const baseClasses = `
      block w-full rounded-md border shadow-sm px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      }
      ${autoResize ? 'resize-none overflow-hidden' : ''}
    `

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

// =============================================================================
// SELECT COMPONENT
// =============================================================================

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Error state */
  error?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Options */
  options: SelectOption[]
  /** Placeholder option */
  placeholder?: string
}

/**
 * Styled select component
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, size = 'md', options, placeholder, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    }

    const baseClasses = `
      block w-full rounded-md border shadow-sm
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${error
        ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      }
      ${sizeClasses[size]}
    `

    return (
      <select
        ref={ref}
        className={`${baseClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)

Select.displayName = 'Select'

// =============================================================================
// CHECKBOX COMPONENT
// =============================================================================

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Checkbox label */
  label: string
  /** Description text */
  description?: string
}

/**
 * Styled checkbox component
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={inputId} className="font-medium text-gray-700">
            {label}
          </label>
          {description && <p className="text-gray-500">{description}</p>}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// =============================================================================
// RADIO GROUP COMPONENT
// =============================================================================

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps {
  /** Field name */
  name: string
  /** Options */
  options: RadioOption[]
  /** Selected value */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Horizontal layout */
  horizontal?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Radio button group component
 */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
  horizontal = false,
  className = '',
}: RadioGroupProps) {
  return (
    <div
      className={`space-y-2 ${horizontal ? 'sm:flex sm:space-y-0 sm:space-x-4' : ''} ${className}`}
      role="radiogroup"
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor={`${name}-${option.value}`}
              className={`font-medium ${option.disabled ? 'text-gray-400' : 'text-gray-700'}`}
            >
              {option.label}
            </label>
            {option.description && <p className="text-gray-500">{option.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Loading state */
  isLoading?: boolean
  /** Left icon */
  leftIcon?: ReactNode
  /** Right icon */
  rightIcon?: ReactNode
  /** Full width */
  fullWidth?: boolean
}

/**
 * Styled button component
 */
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border-transparent',
    outline: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 border-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-md border
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}

export default {
  FormField,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Button,
}
