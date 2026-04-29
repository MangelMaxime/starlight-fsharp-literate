// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fsharpLiterate from 'starlight-fsharp-literate';

// https://astro.build/config
export default defineConfig({
    integrations: [
        fsharpLiterate(),
        starlight({
            title: 'Starlight F# Literate',
            social: [
                {
                    icon: 'github',
                    label: 'GitHub', href: 'https://github.com/MangelMaxime/starlight-fsharp-literate'
                }
            ],
            sidebar: [
                {
                    label: 'Guides',
                    items: [
                        "guides/getting-started",
                        "guides/configuration",
                        "guides/syntax",
                    ]
                },
                {
                    label: 'Demo',
                    autogenerate: { directory: 'demo' },
                },
            ],
        }),
    ],
});
