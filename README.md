## 运行
### yarn
```
yarn
yarn dev
```
### npm
```
npm install
npm run dev
```


## 两个分支的区别
分支的区分主要在于SpreadJS的引入方式不同。

### main分支
main分支是用CDN的方式引入的，将GC变量挂载到全局使用，打包后的体积更小，加载速度更快。

### dev分支
dev分支是使用import方式引入，因为会将SpreadJS打入build包，因此体积较大，加载速度相对慢一些。