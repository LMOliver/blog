function makeTitle(title){
	document.title=(title?(title+' - '):'')+'LMOliver\'s Blog';
}
function getBlogHref(){
	var c=window.location.hash;
	return c.indexOf('#!')===0?c.slice(2):c;
}
function updateHref(){
	var href=getBlogHref();
	this.context='<p>Loading...</p>';
	this.commentID=undefined;
	makeTitle('Loading...');
	loadInfo(href).then(({data:{title,time,description,comment=true}})=>{
		makeTitle(title);
		this.commentID=comment?('blog-'+href):undefined;
		this.context=renderMetadata({title,time,description});
		return loadContext(href);
	}).then(({data})=>{
		this.context+=renderMarkdown(data);
	}).catch(reason=>{
		makeTitle('Error!');
		console.error('blog-context',href,'\n',reason);
		let c;
		if(typeof reason==='string'){
			c=`<h1>Error!</h1><p>${reason}</p>`;
		}else if(typeof reason.status!=='undefined'
			&&typeof reason.statusText!=='undefined'){
			c=`<h1>${reason.status} ${reason.statusText}</h1>`;
		}else{
			c=`<h1>Error!</h1><p>${JSON.stringify(reason)}</p>`;
		}
		this.context=c+`<p>访问 ${location.href} 失败。</p><p><a href="javascript:window.history.back()">返回</a></p>`;
	});
}
var app = new Vue({
	el: '#app',
	data:{
		context:'',
		commentID:undefined,
	},
	mounted(){
		window.onhashchange=()=>updateHref.call(this);
		updateHref.call(this);
	},
});