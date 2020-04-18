使用Vue3（beta.2）开发的一款仿Postman的超轻量级Api接口测试工具，已经发布到 [Chrome 应用商店](https://chrome.google.com/webstore/detail/apitest/nenlipcaoobapddihcmlpjdoilcaomhe)

- 支持自定义参数和请求头
- 支持是否使用Cookie
- 支持Form表单参数和JSON/xml等参数
- 支持多环境变量配置，使用{{}}占位符使用环境变量

---

使用帮助：
1. 设置本次测试接口的名称别名（可选）
2. 设置请求方式（默认为Get请求）
3. 填写请求接口的地址（如果不以https?://开头则默认为http，eg：当填写google.com则会默认请求http://google.com）
4. 根据您的接口需求，配置请求参数、请求头等信息，请求头和Form表单类型的请求参数可以单条编辑也可以进行批量编辑
5. 根据您的接口需求，可以配置本次请求是否携带Cookie进行请求
6. 如果您有一些配置是多环境的，则可以提取为环境变量，假定在环境变量中设置了key=api的环境变量，那么在url中直接使用{{key}}可以获取环境变量中的值，当前环境变量可以用于URL、请求头、请求参数等地方
7. 点击发送按钮会发送本次请求进行接口测试，并将响应结果显示在下方的响应面板中，本次的请求记录也会自动记录在左侧的历史记录中
8. 当觉得历史记录中的请求可能后续会多次用到，则可以点击左侧历史记录中的收藏，将历史记录进行永久收藏
9. 历史记录最多记录最后的30条记录，也可以手动清空历史记录



更新日志:
- 2020年04月19日(dev)
    - 升级至Vue3.beta2
    - 调整项目结构
- 2020年03月09日(master)
    - 升级至Vue3.alpha8
    - 添加 Response 响应内容 自动换行 控制开关
- 2020年03月03日
    - 升级至Vue3(alpha7)( 修复effect 在 alpha7 不兼容的问题 )
    - 添加一个watch脚本，方便在chrome中直接开发而无需频繁的build

已知问题:
- 请求头没有被记录(dev/master)
- 查看Cookie后页面挂掉(dev)
- 使用build打包无法在chrome中正确运行,暂时使用build:watch替代(dev)

License: MIT