_CF 1204E 是 Div.2 E，而非 Div.1 E。_

[题目链接](https://codeforces.com/contest/1204/problem/E)

Natasha 最喜欢 $n$（$0 \le n \le 2000$） 和 $1$，而 Sasha 最喜欢 $m$（$0 \le m \le 2000$） 和 $-1$。

有一天，Natasha 遇上了 Sasha，她们写下了所有长为 $n+m$ 且其中恰有 $n$ 个 $1$ 和 $m$ 个 $-1$ 的数组。

定义一个数组的最大前缀和 $f(a)=\max_{i=0}^{n+m}(\sum_{j=1}^{i}a_j)$（包括和为 $0$ 的**空前缀**），她们希望你帮她们算出所有数组的最大前缀和之和。答案对 $998244853$ 取模。

---

<fold-block title="题解" nocopy>

我们发现一个数组的最大前缀和最大为 $n$，最小为 $\max(n-m,0)$，范围不大，所以可以考虑枚举最大前缀和 $i$，统计数量。

然而，最大前缀和恰为 $i$ 的数组数量并不好统计。那就试试统计最大前缀和大于等于 $i$ 的数组数量吧。

考虑一个最大前缀和大于等于 $i$ 的数组 $a$，设 $j$ 是满足 $\sum_{k=1}^{j}a_k = i$ 的最小的正整数，那么把 $a_{j+1\dots n+m}$ **取反**，我们得到了一个和为 $i-(n-m-i)=2i-(n-m)$，有 $\frac{2i-(n-m)-(-(n+m))}{2}=m+i$ 个 $1$ 的数组。

由于 $m+i-(n+m-(m+i))=2(m+i)-(n+m)\ge i$，所有长为 $n+m$ 且恰有 $m+i$ 个 $1$ 的数组最大前缀和都大于等于 $i$。因此，它们全部可以取反回来，这就形成了一个一一对应。

这就意味着：**所有长为 $n+m$，且恰有 $n$ 个 $1$ ，最大前缀和大于等于 $i$ 的数组的数量等于所有长为 $n+m$ 且恰有 $m+i$ 个 $1$ 的数组的数量**！

因此，最大前缀和大于等于 $i$ 的数组数量就是 $C(n+m,m+i)=C(n+m,n-i)$。

$O((n+m)^2)$ 预处理组合数冲鸭！

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long LL;
const int MOD=998244853;
int add(int a,int b){
	return (a+b)%MOD;
}
void dadd(int &a,int b){
	a=add(a,b);
}
int sub(int a,int b){
	return (a-b+MOD)%MOD;
}
int mul(int a,int b){
	return (LL)a*b%MOD;
}
int n,m;
const int N=2020;
int c[N+N][N];
int a[N];
int main(){
	scanf("%d%d",&n,&m);
	for(int i=0;i<=n+m;i++){
		for(int j=0;j<=n;j++){
			if(i==0&&j==0){
				c[i][j]=1;
				continue;
			}
			c[i][j]=0;
			if(j>0){
				dadd(c[i][j],c[i-1][j-1]);
			}
			if(j<i){
				dadd(c[i][j],c[i-1][j]);
			}
		}
	}
	int ans=0;
	a[n+1]=0;
	for(int i=n;i>=max(n-m,0);i--){
		a[i]=c[n+m][n-i];
		dadd(ans,mul(sub(a[i],a[i+1]),i));
	}
	printf("%d\n",ans);
	return 0;
}
```

[提交记录](https://codeforces.com/contest/1204/problem/E)

……

然后，你就能看到 [<span class="cf-black-red">Siyuan</span> 的博客](https://orzsiyuan.com/archives/Codeforces-1204E-Natasha-Sasha-and-the-Prefix-Sums/)里写着“$0\le n,m \le 10^7$”。

这好办，$O(n+m)$ 预处理组合数，再 $O(n)$ 求解。不过，它需要求逆，所以我们得看看模数。

~~模数是 $998244353$，稳得很！~~

幸运的是，模数 $998244{\color{red}8}53$ 还是一个质数，所以就可以放心求逆了。

另外，这个方法也可以用来计算卡特兰数。当 $n=m$，$i=1$ 时，其方案数是 $C(2n,n+1)$，正是 $C(2n,n)$ 种方案中**不合法**的方案数。

</fold-block>