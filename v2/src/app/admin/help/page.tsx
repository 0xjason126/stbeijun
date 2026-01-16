import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HelpPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">操作指引</h1>
        <p className="text-muted-foreground mt-1">简单易懂的使用说明，帮助您轻松管理网站</p>
      </div>

      <div className="space-y-6">
        {/* 快速开始 */}
        <HelpSection
          title="开始之前"
          icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="blue"
        >
          <HelpItem
            question="这个后台是做什么用的？"
            answer="这个后台用来管理您的国画作品网站。您可以在这里添加新画作、修改画作信息、设置首页展示内容，以及更新您的个人简介。所有改动保存后，网站上就会自动显示新的内容。"
          />
          <HelpItem
            question="我需要记住什么？"
            answer={'只需记住您的用户名和密码即可。每次修改后，记得点击"保存"按钮。如果不确定操作是否正确，可以打开网站首页查看效果。'}
          />
        </HelpSection>

        {/* 仪表盘 */}
        <HelpSection
          title="仪表盘"
          icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          color="primary"
        >
          <HelpItem
            question="仪表盘显示什么？"
            answer="仪表盘是您进入后台后看到的第一个页面。它显示画作的总数、有多少幅已经上架展示、正在售卖、可以定制、已经售出等信息。这样您可以快速了解网站的整体情况。"
          />
          <HelpItem
            question="下面的快捷入口是什么？"
            answer={'仪表盘下方有几个常用功能的快捷入口，点击就能直接进入对应的管理页面，不需要再从左边菜单找。比如点击"管理画作"就能直接进入画作列表。'}
          />
        </HelpSection>

        {/* 画作管理 */}
        <HelpSection
          title="画作管理"
          icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="green"
        >
          <HelpItem
            question="如何添加一幅新画作？"
            answer={`1. 点击右上角的黄色"添加画作"按钮
2. 填写画作名称（比如"山水图"）
3. 选择创作年份
4. 填写画作尺寸（比如"68×136cm"）
5. 选择销售状态：售卖中、可定制、还是已售出
6. 写一段画作介绍
7. 上传画作的照片
8. 点击"保存"按钮

保存成功后，这幅画就添加到系统里了。`}
          />
          <HelpItem
            question={'什么是"上架"和"下架"？'}
            answer={`"上架"的意思是：这幅画会显示在网站上，访客可以看到。
"下架"的意思是：这幅画暂时不显示在网站上，只有您在后台能看到。

如果某幅画还没准备好展示，或者暂时不想让别人看到，可以先"下架"。准备好了再"上架"。`}
          />
          <HelpItem
            question="如何上架或下架一幅画？"
            answer="在画作列表中，每幅画的右边有一个小开关。开关打开（亮色）表示已上架，开关关闭（灰色）表示已下架。点击开关就可以切换状态，系统会让您确认一下。"
          />
          <HelpItem
            question="如何修改一幅画的信息？"
            answer={'在画作列表中找到那幅画，点击"编辑"按钮。进入编辑页面后，修改需要改的内容，然后点击"保存"按钮。'}
          />
          <HelpItem
            question="如何删除一幅画？"
            answer={'在画作列表中找到那幅画，点击"删除"按钮。系统会让您确认一下，确认后这幅画就会被删除。注意：删除后无法恢复，请谨慎操作。'}
          />
          <HelpItem
            question="如何查找某幅画？"
            answer="画作列表上方有筛选工具。您可以按年份、状态、上架状态来筛选，也可以在搜索框里输入画作名称来查找。"
          />
        </HelpSection>

        {/* 首页配置 */}
        <HelpSection
          title="首页配置"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          color="amber"
        >
          <HelpItem
            question="首页配置是什么？"
            answer={'首页是访客打开网站后看到的第一个页面。在这里您可以设置首页最上方的大图和文字，以及选择哪些画作作为"精选作品"展示在首页。'}
          />
          <HelpItem
            question="如何修改首页的标题和介绍？"
            answer={`在"Hero 区域"部分：
- "主标题"是首页最大的文字，比如您的名字
- "副标题"是主标题下面的小字，用来介绍自己
- "背景图片"是首页最上方的大图

修改后点击"保存 Hero 设置"按钮。`}
          />
          <HelpItem
            question="如何选择精选画作？"
            answer={`1. 在"精选画作"区域，您会看到所有已上架的画作
2. 点击画作就可以选中或取消选中
3. 选中的画作左上角会显示数字，表示展示顺序
4. 可以选择 3 到 6 幅画
5. 选好后点击"保存精选"按钮

这些精选画作会显示在网站首页，访客一进来就能看到。`}
          />
        </HelpSection>

        {/* 画家信息 */}
        <HelpSection
          title="画家信息"
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          color="purple"
        >
          <HelpItem
            question="画家信息在哪里显示？"
            answer={'画家信息会显示在网站的"关于"页面。访客可以在这里了解您的艺术经历和创作理念。'}
          />
          <HelpItem
            question="如何修改画家简介？"
            answer={`1. 进入"画家信息"页面
2. 修改姓名、简介等文字内容
3. 如果要换头像照片，点击"更换头像"上传新照片
4. 点击"保存"按钮

建议简介写得简洁清晰，让访客能快速了解您。`}
          />
        </HelpSection>

        {/* 常见问题 */}
        <HelpSection
          title="遇到问题怎么办？"
          icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="red"
        >
          <HelpItem
            question="保存后网站没有变化？"
            answer="网站内容可能需要等待几十秒才会更新。您可以刷新网站页面（按键盘上的 F5 键，或者点击浏览器的刷新按钮）再看看。"
          />
          <HelpItem
            question="图片上传失败了？"
            answer={`可能的原因：
1. 图片太大了 - 建议图片不要超过 5MB
2. 网络不好 - 等一会儿再试试
3. 图片格式不对 - 请使用 JPG 或 PNG 格式的图片`}
          />
          <HelpItem
            question="忘记密码了怎么办？"
            answer="请联系网站技术人员帮您重置密码。"
          />
          <HelpItem
            question="不小心删错了画作？"
            answer="很遗憾，删除的画作无法恢复。建议在删除前仔细确认。如果画作还有原图，可以重新添加一遍。"
          />
        </HelpSection>

        {/* 小贴士 */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            小贴士
          </h3>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">·</span>
              每次修改后记得点"保存"按钮，否则改动不会生效
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">·</span>
              上传画作照片时，尽量选择清晰的、光线好的照片
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">·</span>
              定期查看网站首页，确保展示效果符合预期
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">·</span>
              如果操作过程中遇到不懂的地方，可以随时回来看这个指引
            </li>
          </ul>
        </div>

        {/* 返回仪表盘 */}
        <div className="pt-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回仪表盘
          </Link>
        </div>
      </div>
    </div>
  );
}

// 帮助分类区块
function HelpSection({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: "primary" | "green" | "blue" | "amber" | "purple" | "red";
  children: React.ReactNode;
}) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-600",
    blue: "bg-blue-500/10 text-blue-600",
    amber: "bg-amber-500/10 text-amber-600",
    purple: "bg-purple-500/10 text-purple-600",
    red: "bg-red-500/10 text-red-600",
  };

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 border-b border-border">
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

// 单个问答项
function HelpItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-6 py-5">
      <h3 className="text-base font-medium text-foreground mb-2">{question}</h3>
      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{answer}</p>
    </div>
  );
}
