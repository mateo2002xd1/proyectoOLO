import { Data } from '@puckeditor/core';

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
      },
    },
  ],
  root: {
    props: {},
  },
};
