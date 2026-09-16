import { Data } from '@puckeditor/core';
import { VALORES_PIE_POR_DEFECTO } from '@/shared/lib/blocks/footer';

export const plantillaFallbackData: Data = {
  content: [
    {
      type: 'Header',
      props: {
        id: 'header-static',
      },
    },
    {
      type: 'Footer',
      props: {
        id: 'footer-static',
        ...VALORES_PIE_POR_DEFECTO,
      },
    },
  ],
  root: {
    props: {},
  },
};
