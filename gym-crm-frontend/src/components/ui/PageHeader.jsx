const PageHeader = ({ title, description, actions }) => (
  <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-ink-400">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
