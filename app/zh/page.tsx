import { getProducts, productImage } from "../products/product-data";
import { getSiteSettings, whatsappLink } from "../site-settings";

export const metadata = {
  title: "FUNEL 工业水质在线监测与过程自动化解决方案",
  description:
    "FUNEL 提供在线水质分析仪、数字传感器、多参数控制器、PLC 控制柜和水质监测系统，适用于污水、市政供水、工业过程水和系统集成项目。",
  alternates: {
    canonical: "/zh",
    languages: {
      "en-US": "/",
      "zh-CN": "/zh",
    },
  },
};

const productZh: Record<string, { name: string; category: string; summary: string }> = {
  "pfdo-800-dissolved-oxygen-analyzer": {
    name: "在线溶解氧分析仪",
    category: "溶解氧",
    summary: "适用于曝气池、污水处理、水产养殖和工业过程水的在线溶解氧监测。",
  },
  "ph-orp-online-analyzer": {
    name: "在线 pH / ORP 分析仪",
    category: "pH / ORP",
    summary: "用于加药控制、中和反应、污水处理和工业用水的在线 pH 与 ORP 测量。",
  },
  "conductivity-tds-salinity-analyzer": {
    name: "电导率 / TDS / 盐度分析仪",
    category: "电导率",
    summary: "适用于反渗透、锅炉水、循环冷却水和工业过程水的在线电导率监测。",
  },
  "turbidity-online-analyzer": {
    name: "在线浊度分析仪",
    category: "浊度",
    summary: "用于饮用水过滤、污水排放、地表水和环保监测的在线浊度测量。",
  },
  "mp301-multi-parameter-controller": {
    name: "多参数水质控制器",
    category: "多参数控制器",
    summary: "可接入多路在线水质传感器和分析通道，适合控制柜和集成系统项目。",
  },
};

const applications = [
  ["市政供水", "进水、沉淀、过滤、消毒和清水池在线监测。"],
  ["污水处理", "进水、曝气池、污泥浓度、出水和排放达标监测。"],
  ["工业过程水", "循环冷却水、锅炉水、加药、回用水和排放监测。"],
  ["地表水与环保", "河流、湖泊、地下水和环保站在线监测。"],
  ["水产养殖", "溶解氧、pH、温度、氨氮和水质安全监测。"],
  ["系统集成商", "分析仪、传感器、控制器、控制柜和数据集成支持。"],
];

const support = [
  ["先确认配置", "根据参数、水样类型、输出信号、量程、数量和安装方式推荐型号。"],
  ["资料与报价", "提供资料表、接线说明、通讯方式和报价信息，方便工程对比。"],
  ["样品与 OEM", "可沟通样品、贴牌、备件和经销商项目需求。"],
  ["系统集成", "支持分析仪、传感器、PLC 控制柜、Modbus、4-20 mA 和 SCADA 项目。"],
];

const process = [
  ["1", "采样", "确认采样点、预处理方式和现场工况。"],
  ["2", "分析", "确认分析仪、传感器、控制器和量程配置。"],
  ["3", "控制柜", "支持电源、布线、PLC 控制柜和现场安装。"],
  ["4", "数据", "支持 RS485 Modbus、4-20 mA、报警、网关和 SCADA。"],
  ["5", "服务", "提供报价、资料、OEM 和项目跟进支持。"],
];

const projects = [
  ["水厂在线监测", "进水、工艺段和出水多参数在线监测。"],
  ["污水自动化控制", "PLC 控制柜、现场仪表和过程数据采集。"],
  ["工业排放监测", "COD、氨氮、pH、流量和达标排放监测。"],
];

const faqs = [
  ["可以给系统集成商供货吗？", "可以。可支持选型、控制器配置、通讯要求、项目报价和贴牌沟通。"],
  ["常用通讯输出有哪些？", "常见配置包括 4-20 mA、继电器报警和 RS485 Modbus。"],
  ["多久可以收到报价？", "请提供监测参数、水样类型、数量、通讯输出和安装环境，通常 1 个工作日内回复。"],
  ["下单前可以提供资料吗？", "可以。确认产品和应用后，可提供资料表、配置建议和接线说明。"],
];

function zhProduct(product: any) {
  const translated = productZh[product.slug];
  return {
    name: translated?.name || product.name,
    category: translated?.category || product.category || "水质监测",
    summary: translated?.summary || product.summary,
  };
}

export default async function ChineseHomePage() {
  const [products, site] = await Promise.all([getProducts(), getSiteSettings()]);
  const featured = products.slice(0, 6);
  const heroProduct = featured[0] || products[0];
  const projectProduct =
    products.find((product) => product.slug.includes("cod")) ||
    featured[5] ||
    heroProduct;

  return (
    <main>
      <section className="hero" id="home">
        <div className="container">
          <div>
            <div className="eyebrow">工程项目型水质监测方案</div>
            <h1>工业水质在线监测与过程自动化解决方案</h1>
            <p>
              FUNEL 提供在线水质分析仪、数字传感器、控制器、自动化控制柜 and 集成监测系统，适用于市政供水、污水处理、工业过程水和智慧水务项目。
            </p>
            <div className="actions" style={{ marginTop: 28 }}>
              <a className="btn primary" href="/contact">
                请求报价
              </a>
              <a className="btn ghost" href="#products">
                查看产品
              </a>
            </div>
            <div className="hero-grid">
              <div className="metric">
                <b>在线</b>
                <br />
                水质分析仪
              </div>
              <div className="metric">
                <b>PLC</b>
                <br />
                自动化系统
              </div>
              <div className="metric">
                <b>OEM</b>
                <br />
                项目支持
              </div>
            </div>
          </div>
          <div className="hero-media" style={{ background: "#fff" }}>
            <img src="https://sc02.alicdn.com/kf/Hc39677e032cc42b1b230a67fe586116cA.png" alt="FUNEL 在线水质分析仪案例" />
            <div className="hero-media-bottom">
              <div className="card pad">
                <b>水质参数</b>
                <br />
                <span className="muted">pH、ORP、DO、浊度、COD、氨氮、电导率</span>
              </div>
              <div className="card pad">
                <b>系统集成</b>
                <br />
                <span className="muted">采样、传感器、控制柜、数据平台、远程监测</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft" style={{ padding: "28px 0" }}>
        <div className="container grid four">
          <div className="card pad">
            <b>污水处理</b>
            <p>DO、pH/ORP、COD、氨氮</p>
          </div>
          <div className="card pad">
            <b>饮用水</b>
            <p>浊度、pH、电导率、ORP</p>
          </div>
          <div className="card pad">
            <b>工业过程水</b>
            <p>RO、锅炉、循环冷却和工艺用水</p>
          </div>
          <div className="card pad">
            <b>系统集成</b>
            <p>Modbus、4-20 mA、PLC 和控制柜项目</p>
          </div>
        </div>
      </section>

      <section id="products" className="section">
        <div className="container">
          <div className="section-title centered">
            <small>产品中心</small>
            <h2>在线分析仪、传感器和监测系统</h2>
            <p>适合项目型水质监测、系统集成 and 工业过程控制。</p>
          </div>
          <div className="grid three">
            {featured.map((product) => {
              const translated = zhProduct(product);
              return (
                <article className="card" key={product.slug}>
                  <img src={productImage(product)} alt={translated.name} />
                  <div className="card pad">
                    <span className="pill">{translated.category}</span>
                    <h3>{translated.name}</h3>
                    <p>{translated.summary}</p>
                    <div className="actions" style={{ marginTop: 18 }}>
                      <a className="btn primary" href={`/products/${product.slug}`}>
                        查看详情
                      </a>
                      <a
                        className="btn ghost"
                        href={`/contact?product=${encodeURIComponent(translated.name)}`}
                      >
                        获取报价
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-title">
            <small>采购支持</small>
            <h2>围绕报价、资料、样品和系统配置设计</h2>
          </div>
          <div className="grid four">
            {support.map(([title, text]) => (
              <article className="card pad" key={title}>
                <span className="pill">支持</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="section soft">
        <div className="container">
          <div className="section-title centered">
            <small>应用场景</small>
            <h2>按水处理场景匹配方案</h2>
            <p>让工程师快速把监测点和产品型号对应起来。</p>
          </div>
          <div className="grid three">
            {applications.map(([title, text]) => (
              <article className="card pad accent-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="automation" className="section dark">
        <div className="container">
          <div className="section-title centered">
            <small>自动化集成</small>
            <h2>从现场仪表到完整控制系统</h2>
            <p>支持从传感器、PLC 控制柜、数据采集到 SCADA 显示的完整监测架构。</p>
          </div>
          <div className="card system-card">
            <img
              src="/images/plc-scada-system-integration.png"
              alt="FUNEL PLC SCADA 系统集成"
            />
            <div className="card pad">
              <span className="pill">PLC / SCADA</span>
              <h3>远程监测系统架构</h3>
              <p>适用于水质监测 and 自动化项目的系统网络、PLC/DCS 控制 and SCADA 屏幕展示。</p>
            </div>
          </div>
          <div className="process-grid">
            {process.map(([number, title, text]) => (
              <article className="metric" key={title}>
                <b>
                  {number}. {title}
                </b>
                <br />
                {text}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section">
        <div className="container">
          <div className="section-title centered">
            <small>项目经验</small>
            <h2>工程项目型展示</h2>
            <p>展示 FUNEL 产品如何应用到水厂、控制柜、安装现场和调试项目中。</p>
          </div>
          <div className="split">
            <div className="card">
              <img
                src={productImage(projectProduct)}
                alt="FUNEL 水质监测项目"
                style={{ height: 480, objectFit: "contain", padding: 20 }}
              />
            </div>
            <div className="grid">
              {projects.map(([title, text]) => (
                <article className="card pad" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="section-title centered">
            <small>常见问题</small>
            <h2>常见买家咨询</h2>
          </div>
          <div className="grid">
            {faqs.map(([question, answer]) => (
              <article className="card pad" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section dark">
        <div className="container split">
          <div>
            <div className="section-title">
              <small>联系我们</small>
              <h2>发送你的项目需求</h2>
              <p>请告诉我们水样类型、监测参数、量程、安装现场、输出信号 and 通讯要求。</p>
            </div>
            <div className="card pad contact-card-dark">
              <p>
                <b>WhatsApp:</b>{" "}
                <a href={whatsappLink(site.contact.whatsapp)}>{site.contact.whatsapp}</a>
              </p>
              <p>
                <b>Email:</b> <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </p>
            </div>
          </div>
          <form className="form card pad" action="/api/contact" method="post">
            <input className="input" name="name" placeholder="姓名 / 公司 *" required />
            <input className="input" name="email" type="email" placeholder="邮箱 *" required />
            <input className="input" name="country" placeholder="国家 / 市场" />
            <input className="input" name="whatsapp" placeholder="WhatsApp / 电话" />
            <input className="input" name="product_interest" placeholder="感兴趣的产品" />
            <input className="input" name="quantity" placeholder="数量 / 项目规模" />
            <input type="hidden" name="source_page" value="/zh" />
            <textarea
              name="message"
              rows={7}
              placeholder="项目需求：参数、水样类型、量程、输出信号、应用场景... *"
              required
            ></textarea>
            <button className="btn primary" type="submit">
              发送询盘
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
