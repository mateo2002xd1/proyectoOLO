import type { HeroBlock } from '../types';

interface HeroProps {
  block: HeroBlock;
  heading?: string;
  searchPlaceholder?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const DEFAULT_HEADING = 'Explora las ocupaciones clave de los sectores productivos en Colombia.';
const DEFAULT_SEARCH_PLACEHOLDER = 'Buscar ocupación, código o denominación';
const DEFAULT_IMAGE_URL = '/asset/img/nos-ocupa-el-pais.png';
const DEFAULT_IMAGE_ALT = 'Nos ocupa el país';

export function Hero({
  block,
  heading = DEFAULT_HEADING,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt = DEFAULT_IMAGE_ALT,
}: HeroProps) {
  return (
    <section className="bg-[#041121] w-[60%] rounded-[16px] mx-auto h-[400px] flex items-center justify-center" id="hero-section" aria-label="Banner principal" data-block-id={block.id}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-16 gap-8">
          
          {/* Left Side: Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
            <img 
              src={imageUrl} 
              alt={imageAlt} 
              className="w-[150px] h-auto object-contain"
            />
          </div>
          
          {/* Right Side: Text & Search */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-8 leading-snug">
              {heading}
            </h1>
            
            <div className="w-full max-w-lg">
              <input 
                type="text" 
                placeholder={searchPlaceholder} 
                className="w-full px-6 py-4 rounded-xl text-gray-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4fc3f7] text-base"
                aria-label={searchPlaceholder}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
