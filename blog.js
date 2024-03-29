Vue.component('header-title',{
	template:'<a href="#!"><h1 :style="style"><slot></slot></h1></a>',
	data:function(){
		return {
			style:{
				display:'inline',
				color: 'dodgerblue',
				margin: 0,
			},
		}
	},
});

Vue.component('side-bar',{
	template:'<aside :style="style" class="sidebar"><slot></slot></aside>',
	props:['pos'],
	data:function(){
		return {
			style:{
				float:this.pos,
			},
		};
	},
});

Vue.component('side-block',{
	template:'<div class="contains sideblock"><strong>{{title}}</strong><hr><slot></slot></div>',
	props:['title'],
	data:function(){
		return {};
	},
});

function copyText(text){
	var temp = document.createElement('textarea');
	temp.value = text;
	document.body.appendChild(temp);
	temp.select();
	document.execCommand("copy");
	document.body.removeChild(temp);
}

Vue.component('fold-block',{
	props:['title','initshow','nocopy'],
	template:`
		<div class="contains" style="">
			<strong v-if="title" style="display:inline-block">{{title}}</strong>
			<button @click="show = !show" :style="btnStyle">{{show?'收起':'展开'}}</button>
			<button v-if="nocopy===undefined" @click="copy()" :style="btnStyle">复制</button>
			<div v-show="show" ref="block"><slot></slot></div>
		</div>`,
	methods:{
		copy(){
			copyText(this.$refs.block.innerText);
		},
	},
	data:function(){
		return {
			btnStyle:{
				'margin-left':'auto',
			},
			show:false,
		};
	},
	mounted(){
		if(!this.title)this.title="";
		if(typeof this['initshow']!=='undefined'){
			this.show=true;
		}
	},
});

const loadInfo=((cache)=>(href)=>{
	if(href in cache){
		return Promise.resolve(cache[href]);
	}
	return axios({
		method:'get',
		url:href?`./${href}/info.json`:'./index-info.json',
		responseType:'json',
	})
	.then((result)=>{
		cache[href]=result;
		return result;
	});
})(Object.create(null));

const loadContext=((cache)=>(href)=>{
	if(href in cache){
		return Promise.resolve(cache[href]);
	}
	return axios({
		method:'get',
		url:href?`./${href}/post.md`:'./index.md',
		responseType:'text',
	})
	.then((result)=>{
		cache[href]=result;
		return result;
	});
})(Object.create(null));

Vue.component('post-refence',{
	template:`
		<a :href="'#!'+href" :style="style" class="contains" v-if="!data.hidden">
			<template v-if="size==='small'">
				<span>{{data.title}}</span>
				<span>{{data.description}}</span>
			</template>
			<div v-else-if="size==='large'">
				<p>
					<h3 style="display:inline">{{data.title}}</h3>
					<span>{{data.time}}</span>
				</p>
				<p>
					<span>{{data.description}}</span>
				</p>
			</div>
			<div v-else>
				<span>{{data.title}}</span>
				<br>
				<span>{{data.description}}</span>
			</div>
		</a>`,
	props:['href','size'],
	data:function(){
		return {
			style:{
				display:({
					small:'inline',
					middle:'inline-block',
					large:'block',
				}[this.size]||'inline-block'),
			},
			data:{
				title:'Loading...',
				time:undefined,
				description:'正在加载 QAQ',
			},
		}
	},
	mounted(){
		loadInfo(this.href)
		.then(result=>{
			this.data=result.data;
		})
		.catch(reason=>{
			this.data={
				title:'Error!',
				time:undefined,
				description:`在获取文章时出现错误：${reason.status} ${reason.statusText}`,
			};
		})
	},
});

const loadList=((cache)=>()=>{
	if(cache!==undefined){
		return Promise.resolve(cache);
	}
	return axios({
		method:'get',
		url:'./blog-list.json',
		responseType:'json',
	})
	.then((result)=>{
		cache=result;
		return result;
	});
})(undefined);

Vue.component('blog-list',{
	template:`
		<div>
			<post-refence v-for="id in list" size="large" :href="id" :key="id"></post-refence>
		</div>
	`,
	data(){
		return {
			list:[],
		};
	},
	mounted(){
		loadList()
		.then(({data})=>{
			this.list=data;
		})
		.catch((reason)=>{
			console.error('blog-post',reason);
		});
	},
})

Vue.component('life-canvas',{
	template:`
		<div>
			<input v-model.number="add" type="number">
			<input v-model.number="sub" type="number">
			<input v-model.number="speed" type="number">
			<button v-if="!started" @click="start()">Start</button>
			<canvas ref="canvas" :height="V" :width="V" style="border:1px solid gray;"></canvas>
		</div>`,
	computed:{
		R(){
			return this.V/this.S;
		},
	},
	methods:{
		limitNum(num){
			return Math.min(Math.max(num,0),this.MAX_VAL);
		},
		start(){
			this.started=true;
			var ctx=this.$refs.canvas.getContext("2d");
			ctx.fillStyle='#000000';
			ctx.fillRect(0,0,this.V,this.V);
			// var colors=Array(this.S).fill(0).map(()=>Array(this.S).fill('#000000'));
			const draw=(x,y,color)=>{
				// if(colors[x][y]===color)return;
				/*colors[x][y]=*/ctx.fillStyle=color;
				ctx.fillRect(y*this.R,x*this.R,this.R,this.R);
			}
			var life=Array(this.S).fill(0).map(()=>Array(this.S).fill(0));
			var last=Array(this.S).fill(0).map(()=>Array(this.S).fill(0).map(()=>[0,0,0]));
			const set=(x,y,val)=>{
				life[x][y]=val;
				var rp=val/this.MAX_VAL;
				last[x][y].shift();
				last[x][y].push(rp);
				var [r,g,b]=last[x][y];
				draw(x,y,'#'+
				[b,g,r].map(
					x=>Math.floor(x*255).toString(16).padStart(2,'0')
				).join(''));
			}
			function rand(n){
				return Math.floor(Math.random()*n);
			}
			const rndStep=()=>{
				function loop(x,p){
					while(x<0)x+=p;
					while(x>=p)x-=p;
					return x;
				}
				var x=rand(this.S);
				var y=rand(this.S);
				var sum=0;
				var lf=life[x][y];
				for(let i=-1;i<=1;i++){
					for(let j=-1;j<=1;j++){
						if(i||j)sum+=life[loop(x+i,this.S)][loop(y+j,this.S)];
					}
				}
				var val=lf;
				if(sum<20||sum>=40)val=this.limitNum(lf-this.sub);
				if(sum>=30&&sum<40)val=this.limitNum(lf+this.add);
				if(lf===val){
					if(val>this.MAX_VAL*0.5){
						val=Math.min(lf+1,this.MAX_VAL);
					}else{
						val=Math.max(lf-1,0);
					}
				}
				var ans=lf===val;
				set(x,y,val);
				return ans;
			}
			for(let i=0;i<this.S;i++){
				for(let j=0;j<this.S;j++){
					set(i,j,rand(this.MAX_VAL/1.5));
				}
			}
			setInterval(()=>{
				for(let _=0;_<this.speed;_++){
					while(!rndStep())
						;
				}
			});
		}
	},
	mounted(){
	},
	data:function(){
		return {
			S:300,
			V:600,
			speed:100,
			MAX_VAL:10,
			add:1,
			sub:1,
			started:false,
		};
	}
});

Vue.component('blog-context',{
	props:['context'],
	data:function(){
		return {
			renderer:function(...args){
				this.setContext(this.context);
				this.renderer(...args);
			},
			cache:Object.create(null),
		};
	},
	methods:{
		setContext(text){
			text=`<article class="contains">${text}</article>`;
			let {render,staticRenderFns}=Vue.compile(text);
			let staticCodes=staticRenderFns
				.map(f=>f.toString().slice('function anonymous(\n) {\nwith(this){return '.length,-'}\n}'.length));
			render=render
				.toString()
				.slice('function anonymous() {\n'.length,-'\n}'.length)
				.replace(/_m\((\d+)(,true)?\)/mg,(_,x,t)=>{
					let code=staticCodes[x];
					if(t){
						return code;
					}
					else{
						return code;
						// return `(cache[${x}]?cache[${x}]:cache[${x}]=${code})`;
					}
				});
			this.renderer=new Function(render);
		}
	},
	render(...args){
		return this.renderer(...args);
	},
	watch:{
		context(text){
			this.setContext(text);
		},
	},
});

Vue.component('comment-area',{
	props:['gitalkid'],
	template:`<div class="contains"><h2>评论区</h2><div></div></div>`,
	methods:{
		updateId(){
			var el=this.$el;
			el.removeChild(el.children[1]);
			if(typeof this.gitalkid!=='undefined'){
				var gitalkEl=this.els[this.gitalkid];
				if(typeof gitalkEl==='undefined'){
					const gitalk = new Gitalk({
						clientID: '2404bbe3ef6f6fe0b9de',
						clientSecret: '85cc0b2fe72e057ab1757a2fb83c14142c1e7421',
						repo: 'lmoliver.github.io',
						owner: 'LMOliver',
						admin: ['LMOliver'],
						id: this.gitalkid,
						distractionFreeMode: false,
					});
					this.els[this.gitalkid]=document.createElement('div');
					gitalk.render(this.els[this.gitalkid]);
					gitalkEl=this.els[this.gitalkid];
				}
				el.appendChild(gitalkEl);
			}else{
				el.appendChild(document.createElement('div'));
			}
		},
	},
	watch:{
		gitalkid(){
			this.updateId();
		}
	},
	data(){
		return {
			els:{},
		};
	}
});

function renderMetadata({title='无标题',time='',description=''}){
	return `
		<div>
			<h1>${title}</h1>
		</div>
		<p>${time}</p>
		<p>${description}</p>
		<hr>
	`;
}

function renderMarkdown(md){
	return marked(
		md.replace(/\$.+?\$/g,
			s=>katex.renderToString(s.slice(1,-1),{
				throwOnError: false
			})
		),{
			highlight(code,lang) {
				if(!lang)return code;
				try{
					return hljs.highlight(lang,code).value;
				}
				catch(e){
					return hljs.highlightAuto(code).value;
				}
			}
		}
	);
}