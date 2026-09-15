import Link from 'next/link';
export default function TravelSection({ title, description, links = [], children, headingLevel = 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return <section className="bg-[#f8f6f0] px-4 py-14 text-[#17372f] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <Heading className="max-w-3xl font-serif text-3xl tracking-tight sm:text-4xl">{title}</Heading>
      {description && <p className="mt-4 max-w-3xl leading-7 text-slate-600">{description}</p>}
      {children && <div className="mt-8">{children}</div>}
      {links.length > 0 && <nav aria-label={title} className="mt-7 flex flex-wrap gap-3">{links.map(link =>
        <Link key={link.path} href={link.path} className="rounded-full border border-[#17372f]/20 px-5 py-3 text-sm font-semibold hover:bg-white">{link.name} →</Link>
      )}</nav>}
    </div>
  </section>;
}

