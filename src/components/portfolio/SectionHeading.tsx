type SectionHeadingProps = {
  /** Heading id, referenced by the section's `aria-labelledby`. */
  id: string;
  /** Rendered with a trailing accent-colored period. */
  title: string;
  description?: string;
  level?: 'h1' | 'h2';
};

export function SectionHeading({ id, title, description, level = 'h2' }: SectionHeadingProps) {
  const Heading = level;

  return (
    <>
      <Heading
        id={id}
        className={`break-words font-black tracking-tight text-slate-950 ${
          level === 'h1' ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-4xl sm:text-5xl'
        }`}
      >
        {title}
        <span className="text-violet-600">.</span>
      </Heading>
      {description && <p className="mt-4 max-w-3xl leading-7 text-slate-600">{description}</p>}
    </>
  );
}
