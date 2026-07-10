type ProductMediaProps = {
  src: string;
  alt: string;
  model?: string | null;
  priority?: boolean;
};

export default function ProductMedia({ src, alt, model }: ProductMediaProps) {
  return (
    <div className="product-media">
      <img src={src} alt={alt} loading="lazy" />
      <span className="product-media-brand" aria-hidden="true">
        FUNEL{model ? ` / ${model}` : ""}
      </span>
    </div>
  );
}
