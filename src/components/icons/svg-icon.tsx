type SvgIconProps = {
  className?: string;
  size?: number;
  children: React.ReactNode;
};

export function SvgIcon({ className, size = 20, children }: SvgIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}
