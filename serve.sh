#cd .11ty && deno install && deno run -A npm:@11ty/eleventy --serve $*
cd .11ty && npm install --quiet && npx @11ty/eleventy --serve $*
