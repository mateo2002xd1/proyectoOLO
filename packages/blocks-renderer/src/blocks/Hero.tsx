import type { HeroBlock } from '../types';

interface HeroProps {
  block?: HeroBlock;
  heading?: string;
  searchPlaceholder?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const DEFAULT_SEARCH_PLACEHOLDER = 'Buscar ocupación, código o denominación';
const DEFAULT_IMAGE_URL = '/assets/img/nos-ocupa-el-pais.png';
const DEFAULT_IMAGE_ALT = 'Nos ocupa el país';

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5 sm:h-5.5 sm:w-5.5">
      <path
        d="m17.5 17.5-3.6-3.6m1.6-4.4a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero({
  block,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt = DEFAULT_IMAGE_ALT,
}: HeroProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" id="hero-section" aria-label="Banner principal" data-block-id={block?.id}>
      <div className="w-full rounded-[28px] bg-[#0b1b32] px-6 py-6 sm:rounded-[32px] sm:px-10 sm:py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <img src={imageUrl} alt={imageAlt} className="h-16 w-auto shrink-0 object-contain sm:h-20" />

          <form onSubmit={(e) => e.preventDefault()} className="w-full flex-1">
            <label htmlFor="search-banner-input" className="sr-only">
              {searchPlaceholder}
            </label>
            <div className="relative">
              <input
                id="search-banner-input"
                type="search"
                placeholder={searchPlaceholder}
                className="h-12 w-full rounded-2xl bg-white pl-5 pr-12 text-sm text-[#344054] shadow-sm outline-none transition placeholder:text-[#8a95ad] focus:ring-2 focus:ring-[#20abe3] sm:h-14 sm:text-base"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#8a95ad] transition hover:bg-[#f2f4f7] hover:text-[#20abe3] sm:h-11 sm:w-11"
              >
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
