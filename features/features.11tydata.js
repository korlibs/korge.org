export default {
	layout: 'feature',
	priority: 0.25,
	//permalink: function (data) {
	//	//console.log("permalink", data.page.inputPath)
	//	const path = data.page.inputPath
	//	//if (path.endsWith('_posts.md')) return false
	//	//if (path.endsWith('_ideas.md')) return false
	//	//if (path.includes('.trash')) return false
	//	if (data.draft) return false
	//	if (data.priv) return false
	//	return `/${data.page.fileSlug.replace(/\s+/g, '-').toLowerCase()}/index.html`
	//},
	//content: function(data) { return data.content },
};
