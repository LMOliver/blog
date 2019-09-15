_CF 1217D 是 Edu. D，而非 Div.1 D。_

[题目链接](https://codeforces.com/contest/1217/problem/D)

你有一张有 $n$（$2\le n \le 5000$）个点，$m$（$2\le m \le 5000$）条边，无重边无自环的**有向图**。

你需要为图的每一条边染一个颜色，使得没有全部边颜色相同的环，并使所需颜色种类数最小。

---

<fold-block title="题解" nocopy>

可以看出答案是 $1$ 当且仅当原图无环。

如果原图有环，那么答案至少是 $2$。

设边 $(u,v)$ 的权值是 $u-v$，那么所有环的权值之和为 $0$。又因为没有自环，所有边权值非 $0$，那么所有环中至少有一条权值为正的边和一条权值为负的边。

不难发现，将所有权值为正的边染成黑色，将所有权值为负的边染成白色即满足题目要求。此时颜色数为 $2$，达到了下界。

因此，当原图无环时答案为 $1$，否则答案为 $2$。

如何判环？可以尝试将原图拓扑排序，如果失败则有环，否则一定无环；也可以 DFS 进行判断。

时间复杂度 $O(n+m)$。

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long LL;
const int N=5050;
const int M=5050;
int n,m;
vector<int> es[N];
int in[N]={0};
bool ok(){
	static queue<int> q;
	int c=n;
	for(int i=1;i<=n;i++){
		if(in[i]==0){
			q.push(i);
			c--;
		}
	}
	while(!q.empty()){
		int x=q.front();
		q.pop();
		for(vector<int>::iterator it=es[x].begin();it!=es[x].end();++it){
			if(--in[*it]==0){
				q.push(*it);
				c--;
			}
		}
	}
	return c==0;
}
int k;
int ans[M];
int main(){
	scanf("%d%d",&n,&m);
	for(int i=1;i<=m;i++){
		int u,v;
		scanf("%d%d",&u,&v);
		ans[i]=u<v?1:2;
		es[u].push_back(v);
		in[v]++;
	}
	if(ok()){
		k=1;
		for(int i=1;i<=n;i++){
			ans[i]=1;
		}
	}
	else{
		k=2;
	}
	printf("%d\n",k);
	for(int i=1;i<=m;i++){
		printf("%d ",ans[i]);
	}
	printf("\n");
	return 0;
}
```

[提交记录](https://codeforces.com/contest/1217/submission/60590665)

当然，你也可以选择对端点的 DFS 序而非端点的编号进行比较以给边染色。如果实现方法高妙，你可以不用判环。

</fold-block>