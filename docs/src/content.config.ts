import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
// import { fsharpLiterateLoader } from 'starlight-fsharp-literate';

export const collections = {
    // docs: defineCollection({
    //  loader: fsharpLiterateLoader({ loader: docsLoader() }),
    //  schema: docsSchema(),
    // }),
    docs: defineCollection({
        loader: docsLoader(),
        schema: docsSchema(),
    }),
};
