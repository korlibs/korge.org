import Nunjucks from "nunjucks";
import removeMd from 'remove-markdown';

const includesFolder = '.includes';

function jsonStringifyRecursive(obj) {
	const cache = new Set();
	return JSON.stringify(obj, (key, value) => {
		if (typeof value === 'object' && value !== null) {
			if (cache.has(value)) {
				// Circular reference found, discard key
				return;
			}
			// Store value in our collection
			cache.add(value);
		}
		return value;
	}, 4);
}

function capitalizeFirstLetter(value) {
	return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

Array.prototype.toSorted = function (comparator) {
	const out = [...this]
	out.sort(comparator)
	return out;
}

// https://github.com/NotWoods/11ty-plugins/blob/typescript/packages/types/index.d.ts
export default function (eleventyConfig) {
	eleventyConfig.addCollection("*", function (collectionApi) {
		return collectionApi.getFilteredByGlob(`../**/*`)
			//.filter((item) => !item.inputPath.endsWith("_posts.md"))
			//.filter((item) => !item.inputPath.endsWith("_ideas.md"))
			.filter((item) => !item.data.draft)
			.filter((item) => !item.data.priv)
			.toSorted((a, b) => parseFloat(b?.data?.priority || 0) - parseFloat(a?.data?.priority || 0) )
			;
	});

	eleventyConfig.addCollection("tags", function (collectionApi) {
		return ["all", ...new Set(collectionApi.getFilteredByGlob(`../showcases/**/*`)
			.filter((item) => !item.data.draft)
			.filter((item) => !item.data.priv)
			.flatMap(it => it.data.tags))
		].map(it => { 
			return { title: it.toUpperCase(), filter: (it == 'all') ? '*' : `.${it}` }
		 })
			;
	});

	eleventyConfig.addCollection("features", function (collectionApi) {
		return collectionApi.getFilteredByGlob(`../features/**/*`)
			//.filter((item) => !item.inputPath.endsWith("_posts.md"))
			//.filter((item) => !item.inputPath.endsWith("_ideas.md"))
			.filter((item) => !item.data.draft)
			.filter((item) => !item.data.priv)
			.toSorted((a, b) => parseFloat(a?.data?.order || 0) - parseFloat(b?.data?.order || 0) )
			;
	});

	eleventyConfig.addCollection("highlights", function (collectionApi) {
		return collectionApi.getFilteredByGlob(`../highlights/**/*`)
			//.filter((item) => !item.inputPath.endsWith("_posts.md"))
			//.filter((item) => !item.inputPath.endsWith("_ideas.md"))
			.filter((item) => !item.data.draft)
			.filter((item) => !item.data.priv)
			.toSorted((a, b) => parseFloat(a?.data?.order || 0) - parseFloat(b?.data?.order || 0) )
			;
	});

	eleventyConfig.addCollection("showcases", function (collectionApi) {
		return collectionApi.getFilteredByGlob(`../showcases/**/*`)
			//.filter((item) => !item.inputPath.endsWith("_posts.md"))
			//.filter((item) => !item.inputPath.endsWith("_ideas.md"))
			.filter((item) => !item.data.draft)
			.filter((item) => !item.data.priv)
			;
	});

	/*
	eleventyConfig.addCollection('pageTags', (collections) => {
		const unique = collections
			.getAll()
			//.getFilteredByTag('page')
			.reduce((tags, item) => tags.concat(item.data.tags), [])
			.filter((tag) => !!tag)
			//.filter((tag) => !!tag && !['page', 'post'].includes(tag))
			.sort();
		return Array.from(new Set(unique));
	});

	eleventyConfig.addCollection('category', (collections) => {
		const unique = collections
			.getAll()
			//.getFilteredByTag('page')
			.reduce((tags, item) => tags.concat([item.data.category]), [])
			.filter((tag) => !!tag)
			.map(it => `${it}`.toLowerCase())
			//.filter((tag) => !!tag && !['page', 'post'].includes(tag))
			.sort();
		return Array.from(new Set(unique));
	});
	*/

	/*
	eleventyConfig.addGlobalData("layout", () => {
		return 'post'
	});

	eleventyConfig.addGlobalData("permalink", () => {
		return (data) => {
			if (data.permalink) return data.permalink
			console.log('permalink', data.permalink)
			const path = data.page.inputPath
			if (path.endsWith('_posts.md')) return false
			if (path.endsWith('_ideas.md')) return false
			if (path.includes('.trash')) return false
			if (data.draft) return false
			if (data.priv) return false
			return `/${data.page.fileSlug.replace(/\s+/g, '-').toLowerCase()}/index.html`

			//return `${data.page.filePathStem}.${data.page.outputFileExtension}`;
		}
	});
	*/

	eleventyConfig.addGlobalData("eleventyComputed", {
		title: (data) => { return data.title || capitalizeFirstLetter(`${data.page.fileSlug}`); },
		excerpt: (data) => {
			return removeMd(data.page.rawInput.replace(/!?\[\[(.*?)\]\]/g, '')).substring(0, 100) + '...';
		},
		featured_image: (data) => {
			//return '/demo'
			if (data.page.inputPath.startsWith(`../posts/`)) {
				const result = /!\[\[(.*?)\]\]/.exec(data.page.rawInput)
				//console.log('featured_image', 'dummy')
				return (result && ('/' + result[1].split('/').pop())) || '/600x400.png'
			}
			//console.log('featured_image', ':', data.featured_image, ':')
			return data.featured_image
		},
	});

	eleventyConfig.setLibrary("njk", new Nunjucks.Environment(
		new Nunjucks.FileSystemLoader('.includes')
	));

	eleventyConfig.addFilter("format_date", (date) => {
		//		return new Date(date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
		return new Date(date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
	});
	eleventyConfig.addFilter("take", (array, count) => {
		return Array.isArray(array) ? array.slice(0, count) : [];
	});
	eleventyConfig.addFilter("size", (array) => array?.length || 0);
	eleventyConfig.addFilter("where", (array, key, value) => array ? [...array].filter(it => it[key] == value) : []);
	eleventyConfig.addFilter("contains", (array, item) => Array.isArray(array) && array.includes(item));
	eleventyConfig.addFilter("filter_data", (array, name) => {
		array = Array.isArray(array) ? array : []
		return array.filter(it => it?.data?.[name])
	});
	eleventyConfig.addFilter("truncatewords", (value, length) => {
		value = `${value}`
		const words = value.split(/\s+/)
		if (words.length <= length) return value;
		return words.slice(0, length).join(" ") + '...';
	})
	eleventyConfig.addFilter("excerpt", (value) => {
		value = `${value}`
		const length = 10
		const words = value.split(/\s+/)
		if (words.length <= length) return value;
		return words.slice(0, length).join(" ") + '...';
	})
	eleventyConfig.addFilter("strip_html", (value) => {
		// @TODO: Check this
		return value.replace(/<[^>]*>/g, '');
	})
	eleventyConfig.addFilter("markdown_to_html", (value) => {
		// @TODO: Proper conversion
		return value;
	})
	eleventyConfig.addFilter("eval_template", (value) => {
		return value
	})
	eleventyConfig.addFilter("absolute_url", (value) => {
		return value ? `/${value.replace(/^\/+/, '')}` : value
	})
	eleventyConfig.addFilter("date_rfc3339", (value) => {
		return new Date(value).toISOString().replace(/Z$/, '+00:00')
	})
	eleventyConfig.addFilter("date_to_xmlschema", (value) => {
		return new Date(value).toISOString()
	})

	eleventyConfig.addFilter("date", (value) => {
		return `${value}`
	})
	eleventyConfig.addFilter("remove", (value, remove) => {
		return `${value}`.replaceAll(remove, '')
	})
	eleventyConfig.addFilter("date_to_string", (value) => {
		return `${value}`
	})
	eleventyConfig.addFilter("date_short", (value) => {
		// As 05 Oct 2023
		return new Date(value).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
	})

	eleventyConfig.addFilter("upper", (value) => `${value}`.toUpperCase());
	eleventyConfig.addFilter("lower", (value) => `${value}`.toLowerCase());
	eleventyConfig.addFilter("unescape", (value) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
	eleventyConfig.addFilter("keys", (value) => value ? Object.keys(value) : []);
	eleventyConfig.addFilter("json", (value) => {
		try {
			//return jsonStringifyRecursive(value);
			return JSON.stringify(value);
		} catch (e) {
			//return JSON.stringify(Object.keys(value));
			return `ERROR: ${e} : KEYS: ` + JSON.stringify(Object.keys(value));
		}
	});
	eleventyConfig.setNunjucksEnvironmentOptions({
		throwOnUndefined: false,
		autoescape: true,
		//throwOnUndefined: true,
		//autoescape: false, // warning: don’t do this!
	});

	eleventyConfig.ignores.add("**/node_modules/**");

	eleventyConfig.addTransform("preprocessMarkdown", (content, outputPath) => {
		//if (outputPath && outputPath.endsWith(".md")) {
		if (true) {
			// Perform preprocessing on the raw Markdown content
			const tcontent = content.trim()
			return tcontent.replace(/(!)?\[\[(.*?)\]\]/g, (match, p0, p1) => {
				// Convert Obsidian-style [[links]] to Markdown links
				p1 = p1.split('/').pop()
				if (p0 == '!') {
					return `<img src="/${p1}" />`
				}
				const slug = p1.toLowerCase().replace(/\s+/g, "-");
				return `[${p1}](/${slug}/)`;
			});
		}
		return content;
	});

	//eleventyConfig.addPassthroughCopy("soywiz.com/**/*.{jpg,jpeg,gif,png,webp,avif,css,js}");
	const copy = {}
	//copy[`${basePath}/**/*.{jpg,jpeg,gif,png,webp,avif,swf}`] = '/';
	/*
	copy[`../assets/**`/ + `*.{jpg,jpeg,gif,png,webp,avif,swf,mp4,mkv,ogg,css,js}`] = '/assets';
	copy['../.static'] = '/'
	*/
	
	eleventyConfig.addPassthroughCopy(copy);
	eleventyConfig.addPassthroughCopy({ "../assets" : "assets" });

	return {
		dir: {
			input: "..",  // Customize the input directory if needed
			output: "../.site", // Customize the output directory
			data: ".11ty/.data",
			includes: ".11ty/.includes",
		},
		templateFormats: ["html", "njk", "md", "xml", "json"], // Files processed as templates
		htmlTemplateEngine: "njk", // Default engine for HTML files
		markdownTemplateEngine: "njk", // Default engine for Markdown files
		dataTemplateEngine: "njk", // Default engine for data files
	};
};
