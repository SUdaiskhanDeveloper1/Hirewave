interface JsonLdProps {
  /** A JSON-LD document. Serialised on the server; never parsed on the client. */
  readonly data: Record<string, unknown>;
}

/**
 * Structured data.
 *
 * Rendered by a Server Component, so the payload ships as inert markup and costs the
 * browser nothing beyond the bytes. Angle brackets are escaped to close off the
 * script-injection route through string fields.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\u003c'),
      }}
    />
  );
}
