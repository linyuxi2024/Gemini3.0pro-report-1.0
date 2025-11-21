import { CaseStatus, TestGroup } from './types';

// The complete HTML for the Xiaohongshu Generator provided in the prompt
export const XIAOHONGSHU_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小红书爆款封面生成器</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; background-color: #f3f4f6; }
        .preview-container {
            width: 375px; height: 500px; position: relative; overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); background-color: #fff;
        }
        .bg-image { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 0; }
        .overlay-layer {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;
            display: flex; flex-direction: column; padding: 20px;
        }
        .style-1 { justify-content: center; align-items: center; }
        .style-1 .main-title {
            background: #ff2442; color: white; font-size: 42px; font-weight: 900;
            padding: 10px 20px; border-radius: 8px; line-height: 1.2; text-align: center;
            box-shadow: 4px 4px 0px rgba(0,0,0,1); transform: rotate(-2deg);
        }
        .style-1 .sub-title {
            background: #fff; color: #000; font-weight: 700; padding: 5px 15px; margin-top: 10px;
            border: 2px solid #000; border-radius: 20px; transform: rotate(1deg);
        }
        .style-2 { justify-content: flex-end; padding-bottom: 40px; }
        .style-2::before {
            content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 50%;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); z-index: -1;
        }
        .style-2 .main-title { color: white; font-size: 36px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.5); letter-spacing: 1px; }
        .style-2 .sub-title { color: #fbbf24; font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
        .style-2 .decoration { width: 40px; height: 4px; background: white; margin-bottom: 15px; }
        .style-3 { justify-content: flex-start; padding-top: 40px; align-items: center; }
        .style-3 .main-title {
            background: rgba(255, 255, 255, 0.9); color: #333; font-size: 32px; font-weight: 800;
            padding: 20px; border-radius: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            text-align: center; position: relative; border: 2px solid #eee;
        }
        .style-3 .sub-title {
            margin-top: 10px; background: #ffb6c1; color: white; padding: 4px 12px;
            border-radius: 50px; font-size: 14px; font-weight: bold;
        }
        .style-4 { justify-content: center; }
        .style-4 .text-box {
            background: white; padding: 20px; border-radius: 10px; text-align: center; border: 3px solid #000;
        }
        .style-4 .main-title { font-size: 38px; font-weight: 900; color: #000; -webkit-text-stroke: 1px #000; }
        .style-4 .sub-title { color: #ff2442; font-size: 18px; font-weight: bold; margin-top: 5px; }
        .sticker { position: absolute; font-size: 40px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2)); }
    </style>
</head>
<body>
<div id="app" class="min-h-screen p-8 flex flex-col items-center">
    <header class="text-center mb-8">
        <h1 class="text-3xl font-black text-gray-800 mb-2">🔴 小红书封面生成器</h1>
        <p class="text-gray-500">上传图片 -> 输入标题 -> 选模板 -> 下载</p>
    </header>
    <div class="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-lg w-full max-w-5xl">
        <div class="flex-1 space-y-6">
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">1. 上传背景图</label>
                <input type="file" @change="handleImageUpload" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer border rounded-lg p-2"/>
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">2. 输入内容</label>
                <input type="text" v-model="mainTitle" placeholder="Main Title" class="w-full p-3 border rounded-lg mb-3 font-bold">
                <input type="text" v-model="subTitle" placeholder="Sub Title" class="w-full p-3 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">3. 选择风格</label>
                <div class="grid grid-cols-2 gap-3">
                    <button v-for="(style, index) in styles" :key="index" @click="currentStyle = index" :class="{'ring-2 ring-red-500 bg-red-50': currentStyle === index, 'bg-gray-100': currentStyle !== index}" class="p-3 rounded-lg text-sm font-bold transition hover:bg-gray-200">{{ style.name }}</button>
                </div>
            </div>
            <div class="pt-4 border-t">
                <button @click="downloadImage" class="w-full bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg">⬇️ 生成并下载</button>
            </div>
        </div>
        <div class="flex-1 flex justify-center items-center bg-gray-50 rounded-xl p-4">
            <div id="cover-canvas" class="preview-container">
                <img :src="bgImage || 'https://picsum.photos/375/500'" class="bg-image">
                <div v-if="styles[currentStyle].hasOverlay" class="absolute inset-0 bg-black/20 z-0"></div>
                <div :class="['overlay-layer', styles[currentStyle].class]">
                    <div v-if="styles[currentStyle].hasDeco" class="decoration"></div>
                    <div v-if="subTitle && styles[currentStyle].subtitlePos === 'top'" class="sub-title">{{ subTitle }}</div>
                    <div v-if="mainTitle" class="main-title" v-html="formattedTitle"></div>
                    <div v-if="styles[currentStyle].isBoxed" class="text-box">
                        <div class="main-title" v-html="formattedTitle"></div>
                        <div v-if="subTitle" class="sub-title">{{ subTitle }}</div>
                    </div>
                    <div v-if="subTitle && styles[currentStyle].subtitlePos === 'bottom'" class="sub-title">{{ subTitle }}</div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    const { createApp, ref, computed } = Vue;
    createApp({
        setup() {
            const mainTitle = ref('30天逆袭\\n学霸计划');
            const subTitle = ref('附详细时间表 ⏰');
            const bgImage = ref(null);
            const currentStyle = ref(0);
            const styles = [
                { name: '🔥 爆款大字报', class: 'style-1', subtitlePos: 'bottom', hasOverlay: false },
                { name: '📖 极简杂志', class: 'style-2', subtitlePos: 'top', hasDeco: true, hasOverlay: true },
                { name: '💭 清新气泡', class: 'style-3', subtitlePos: 'bottom', hasOverlay: false },
                { name: '🔳 强力对比', class: 'style-4', isBoxed: true, hasOverlay: true },
            ];
            const formattedTitle = computed(() => mainTitle.value.replace(/\\n/g, '<br>'));
            const handleImageUpload = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => { bgImage.value = e.target.result; };
                    reader.readAsDataURL(file);
                }
            };
            const downloadImage = () => { alert('Download triggered!'); };
            return { mainTitle, subTitle, bgImage, styles, currentStyle, formattedTitle, handleImageUpload, downloadImage };
        }
    }).mount('#app');
</script>
</body>
</html>`;

export const EINSTEIN_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>默瑟街112号：爱因斯坦的普林斯顿岁月</title>
    <style>
        /* --- 全局变量与基础样式 --- */
        :root {
            --princeton-orange: #E87722;
            --blackboard-green: #2F4F4F;
            --parchment: #FDF5E6;
            --text-dark: #333;
            --white: #ffffff;
        }

        body {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--parchment);
            color: var(--text-dark);
            line-height: 1.6;
        }

        h1, h2, h3 { font-family: "Georgia", serif; }

        /* --- 头部导航 --- */
        header {
            background-color: var(--blackboard-green);
            color: var(--white);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .logo { font-size: 1.4rem; font-weight: bold; border: 2px solid var(--princeton-orange); padding: 4px 10px; }

        /* --- Hero 区域 --- */
        .hero {
            background: linear-gradient(rgba(47, 79, 79, 0.7), rgba(47, 79, 79, 0.7)), url('https://placehold.co/1920x800/2F4F4F/FFFFFF?text=Einstein+in+Princeton+Autumn');
            background-size: cover;
            background-position: center;
            height: 50vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
            padding: 20px;
        }

        .hero h1 { font-size: 2.5rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .hero p { font-size: 1.2rem; font-style: italic; max-width: 700px; }

        /* --- 分龄导航按钮 --- */
        .age-selector {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: -25px auto 40px;
            padding: 0 15px;
            position: relative;
            z-index: 10;
            flex-wrap: wrap;
        }

        .age-btn {
            background-color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }

        .age-btn:hover { transform: translateY(-3px); }
        .age-btn.active {
            background-color: var(--princeton-orange);
            color: white;
            box-shadow: 0 4px 15px rgba(232, 119, 34, 0.4);
        }

        /* --- 内容区域 --- */
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; min-height: 500px; }
        
        .section { display: none; animation: fadeIn 0.5s ease-in-out; }
        .section.active { display: block; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .section-header { text-align: center; margin-bottom: 30px; }
        .section-header h2 { color: var(--blackboard-green); }

        /* --- 卡片网格 --- */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
        }

        .card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            border-top: 4px solid var(--blackboard-green);
        }

        .card img { width: 100%; height: 180px; object-fit: cover; background: #ddd; }
        .card-body { padding: 20px; }
        .card h3 { color: var(--princeton-orange); margin-top: 0; font-size: 1.2rem; }
        .card p { font-size: 0.95rem; color: #555; }

        /* --- 互动盒子 --- */
        .interactive-box {
            background-color: var(--blackboard-green);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-top: 40px;
            text-align: center;
            border: 2px dashed #555;
        }

        .reveal-content {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            margin-top: 15px;
            border-radius: 5px;
            display: none;
            border: 1px solid var(--princeton-orange);
        }

        button.action-btn {
            background-color: var(--princeton-orange);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            margin-top: 10px;
        }

        button.action-btn:hover { background-color: #d16615; }

        /* --- 页脚 --- */
        footer {
            background-color: #222;
            color: #999;
            text-align: center;
            padding: 40px 20px;
            margin-top: 60px;
        }

        .quote-area {
            max-width: 700px;
            margin: 0 auto 20px;
            padding: 20px;
            border-left: 4px solid var(--princeton-orange);
            background: #333;
            color: white;
            font-family: "Georgia", serif;
            font-size: 1.1rem;
        }

        /* 响应式 */
        @media (max-width: 600px) {
            .hero h1 { font-size: 1.8rem; }
            .age-selector { flex-direction: column; gap: 10px; }
            .age-btn { width: 100%; }
        }
    </style>
</head>
<body>

    <header>
        <div class="logo">112 Mercer St</div>
        <div>爱因斯坦档案</div>
    </header>

    <div class="hero">
        <h1>不再只是天才，而是邻居</h1>
        <p>探索爱因斯坦在普林斯顿的最后22年：1933-1955</p>
    </div>

    <!-- 导航切换 -->
    <div class="age-selector">
        <button class="age-btn active" onclick="switchTab('kids', this)">🍦 童真探索 (6-12岁)</button>
        <button class="age-btn" onclick="switchTab('teens', this)">⚛️ 求知少年 (13-18岁)</button>
        <button class="age-btn" onclick="switchTab('adults', this)">🎻 深度回响 (成人/学者)</button>
    </div>

    <div class="container">
        
        <!-- 1. 儿童版块 -->
        <div id="kids" class="section active">
            <div class="section-header">
                <h2>那个不穿袜子的有趣爷爷</h2>
                <p>即使是世界上最聪明的人，也喜欢吃冰淇淋哦！</p>
            </div>
            <div class="card-grid">
                <div class="card">
                    <img src="https://placehold.co/600x400/E87722/FFFFFF?text=No+Socks" alt="光脚">
                    <div class="card-body">
                        <h3>光脚的秘密</h3>
                        <p>爱因斯坦爷爷觉得大脚趾总是把袜子顶破，太麻烦了，所以他经常不穿袜子就穿鞋子！</p>
                    </div>
                </div>
                <div class="card">
                    <img src="https://placehold.co/600x400/87CEEB/FFFFFF?text=Ice+Cream" alt="冰淇淋">
                    <div class="card-body">
                        <h3>冰淇淋大冒险</h3>
                        <p>他经常去普林斯顿镇上的冰淇淋店。有一次他盯着菜单看了很久，因为选不出要香草味还是巧克力味。</p>
                    </div>
                </div>
                <div class="card">
                    <img src="https://placehold.co/600x400/90EE90/FFFFFF?text=Helping+Kids" alt="作业">
                    <div class="card-body">
                        <h3>最好的数学老师</h3>
                        <p>邻居小女孩不会做数学作业，敲开了他的门。爱因斯坦不仅帮她做题，还请她吃糖果呢。</p>
                    </div>
                </div>
            </div>
            <div class="interactive-box">
                <h3>🎮 趣事：迷路的天才</h3>
                <p>爱因斯坦思考问题太入迷，经常忘记自己家住在哪里。</p>
                <button class="action-btn" onclick="toggleReveal('kids-fact')">点击看结果</button>
                <div id="kids-fact" class="reveal-content">
                    <strong>真的！</strong> 他曾经给研究所打电话问：“请问，爱因斯坦教授住在哪里？” 秘书吓了一跳，以为他在开玩笑。
                </div>
            </div>
        </div>

        <!-- 2. 青少年版块 -->
        <div id="teens" class="section">
            <div class="section-header">
                <h2>逃亡、避难所与未竟的梦想</h2>
                <p>关于勇气、友谊以及科学探索的真实故事。</p>
            </div>
            <div class="card-grid">
                <div class="card">
                    <img src="https://placehold.co/600x400/333/FFF?text=The+Institute" alt="高等研究院">
                    <div class="card-body">
                        <h3>不是大学教授</h3>
                        <p>爱因斯坦受聘于“高等研究院(IAS)”，而不是普林斯顿大学。这里没有教学任务，他的工作就是“思考”。</p>
                    </div>
                </div>
                <div class="card">
                    <img src="https://placehold.co/600x400/555/FFF?text=Friendship" alt="哥德尔">
                    <div class="card-body">
                        <h3>散步的友谊</h3>
                        <p>他与数学家哥德尔形影不离。爱因斯坦说：“我去办公室仅仅是为了能有特权和哥德尔一起步行回家。”</p>
                    </div>
                </div>
                <div class="card">
                    <img src="https://placehold.co/600x400/777/FFF?text=Unified+Field" alt="统一场论">
                    <div class="card-body">
                        <h3>未完成的拼图</h3>
                        <p>他后半生致力于“统一场论”，试图统一引力和电磁力。虽然失败了，但这种执着本身就是科学精神。</p>
                    </div>
                </div>
            </div>
            <div class="interactive-box">
                <h3>⚛️ 思考：流亡者的行囊</h3>
                <p>逃离纳粹德国时，除了科学手稿，爱因斯坦最看重什么？</p>
                <button class="action-btn" onclick="toggleReveal('teens-fact')">查看答案</button>
                <div id="teens-fact" class="reveal-content">
                    <strong>小提琴“莉娜”。</strong> 音乐是他思考时的避风港。他说：“如果我不是物理学家，我可能会是个音乐家。”
                </div>
            </div>
        </div>

        <!-- 3. 成人版块 -->
        <div id="adults" class="section">
            <div class="section-header">
                <h2>公民爱因斯坦与凡人的孤独</h2>
                <p>揭开光环之下，作为社会活动家与一位老人的真实面貌。</p>
            </div>
            <div class="card-grid">
                <div class="card">
                    <img src="https://placehold.co/600x400/2F4F4F/FFF?text=Civil+Rights" alt="民权">
                    <div class="card-body">
                        <h3>书房里的民权斗士</h3>
                        <p>他强烈反对种族隔离。当黑人歌唱家被酒店拒绝入住时，爱因斯坦邀请她住进了自己家。</p>
                    </div>
                </div>
                <div class="card">
                    <img src="https://placehold.co/600x400/483D8B/FFF?text=Quantum" alt="量子力学">
                    <div class="card-body">
                        <h3>科学界的“异类”</h3>
                        <p>晚年的他因拒绝接受量子力学的随机性（“上帝不掷骰子”），被年轻一代物理学家视为过时的老顽固。</p>
                    </div>
                </div>
                <div class="card">
                    <img src="https://placehold.co/600x400/8B0000/FFF?text=The+End" alt="去世">
                    <div class="card-body">
                        <h3>最后的离去</h3>
                        <p>1955年他在普林斯顿去世。他拒绝宏大的葬礼，骨灰被撒入特拉华河，以免墓地成为朝圣者打扰的地方。</p>
                    </div>
                </div>
            </div>
            <div class="interactive-box">
                <h3>📜 历史档案：被监视的岁月</h3>
                <p>FBI 关于爱因斯坦的档案长达 1400 多页。</p>
                <button class="action-btn" onclick="toggleReveal('adults-fact')">为什么？</button>
                <div id="adults-fact" class="reveal-content">
                    因为他的反战立场和社会主义倾向，胡佛局长视他为“激进分子”。即使是爱因斯坦，在那个年代也活在监视之下。
                </div>
            </div>
        </div>

    </div>

    <footer>
        <div class="quote-area">
            <span id="quote-text">“我没有什么特别的才能，我只是热情地好奇。”</span>
            <br><br>
            <small>—— 阿尔伯特·爱因斯坦</small>
        </div>
        <button class="action-btn" onclick="newQuote()">✨ 生成新格言</button>
        <p style="margin-top:30px; font-size:0.8rem;">© 2023 默瑟街112号纪念项目 | 仅供教育演示</p>
    </footer>

    <script>
        // 1. 切换标签页功能
        function switchTab(sectionId, btn) {
            // 隐藏所有版块
            const sections = document.querySelectorAll('.section');
            sections.forEach(s => s.classList.remove('active'));
            
            // 显示目标版块
            document.getElementById(sectionId).classList.add('active');

            // 更新按钮状态
            const buttons = document.querySelectorAll('.age-btn');
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        // 2. 显示隐藏事实功能
        function toggleReveal(elementId) {
            const el = document.getElementById(elementId);
            if (el.style.display === "block") {
                el.style.display = "none";
            } else {
                el.style.display = "block";
            }
        }

        // 3. 格言生成器功能
        const quotes = [
            "我没有什么特别的才能，我只是热情地好奇。",
            "想象力比知识更重要。",
            "生活就像骑自行车。为了保持平衡，你必须不断前进。",
            "现实不过是幻觉，尽管这种幻觉挥之不去。",
            "不要努力成为一个成功者，要努力成为一个有价值的人。",
            "疯狂就是重复做同一件事，却期待不同的结果。"
        ];

        function newQuote() {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            document.getElementById('quote-text').innerText = quotes[randomIndex];
        }
    </script>
</body>
</html>`;

export const MEMORY_STARDUST_PROMPT = `# Memory Stardust (记忆星尘) - Design & Technical Specification

## 1. Project Overview
**Theme:** "How does it feel to become a memory?" (成为回忆是怎样的感觉)
**Style:** Dreamcore, Ethereal, Cinematic, Nostalgic.
**Core Function:** An immersive, interactive WebGL visualizer featuring multiple generative 3D scenes, ambient procedural audio, and bilingual (English/Chinese) UI.

## 2. Tech Stack & Architecture
*   **Framework:** React 19 (via ES Modules/CDN).
*   **3D Engine:** Three.js (Standard Imperative API). **Note:** Does NOT use \`react-three-fiber\`. Uses \`useEffect\` + \`useRef\` for Three.js lifecycle management.
*   **Styling:** Tailwind CSS (via CDN script).
*   **Audio:** Web Audio API (Procedural generation, no external files).
*   **Language:** TypeScript.

## 3. Visual Design System
*   **Color Palette:**
    *   Background: Deep Blue (\`#1a1a2e\`), Secondary (\`#16213e\`)
    *   Particles: Pale Gold (\`#ffd89b\`), Star White (\`#f0f0f0\`)
    *   Accents: Coral (\`#ff7f50\`), Eclipse Ring (\`#fffacd\`)
*   **Typography:** \`Playfair Display\` (Serif) for titles, \`Inter\` (Sans) for UI.
*   **Post-Processing Stack:**
    1.  **UnrealBloomPass:** Strong glow for dreamlike atmosphere.
    2.  **FilmPass:** Noise and scanlines for "memory" texture.
    3.  **RGBShiftShader:** Chromatic aberration.
    4.  **DistortionShader:** Custom lens distortion/vignette.

## 4. Implemented Scenes (Visual Modes)
The application supports switching between the following rendered modes in \`DreamCanvas.tsx\`:

### Basic Effects
*   **Original Memory (初始记忆):** Particles aggregate from chaos to order (1.5s ease-out). Features interactive mouse-click ripples.
*   **Dream 2D/3D:** Optimized particle flows using \`InstancedMesh\`.
*   **Dream Full:** The standard Dreamcore scene with full post-processing.

### Advanced Effects (Procedural & Shader-Heavy)
*   **Cosmic Nebula (宇宙星云):** 
    *   *Technique:* Spiral galaxy math, additive blending, soft-particle shaders.
    *   *Visuals:* Deep violet/gold gradients, volumetric feel.
*   **Shattered Garden (破碎花园):** 
    *   *Technique:* Vertex displacement using 3D Noise (Tectonic Shader).
    *   *Visuals:* Floating continental crusts, Volumetric God Rays (Cone mesh).
*   **Eclipse Garden (日食花园):** 
    *   *Technique:* Dynamic fragment shader (\`uOverlap\` uniform).
    *   *Visuals:* Moon transiting Sun, "Diamond Ring" effect, procedural solar corona rays.
*   **Coral Garden (珊瑚花园):** 
    *   *Technique:* Reaction-Diffusion simulation approximation (Gray-Scott patterns) in vertex shader.
    *   *Visuals:* Organic, brain-coral textures, cellular noise.
*   **Wispy Garden (缕缕花园):** 
    *   *Technique:* Instanced planes with generated smoke canvas textures.
    *   *Visuals:* Ethereal smoke flow.
*   **Gaussian Dream (高斯梦境):** 
    *   *Technique:* Procedural Gaussian Splatting simulation.
    *   *Visuals:* **Lorenz Attractor** chaotic mathematical structure rendered via anisotropic splats.

## 5. Audio System (\`AmbientSound.tsx\`)
*   **Type:** Generative / Procedural.
*   **Implementation:** Web Audio API.
*   **Sound Profile:** "Space Wind" / White Noise.
*   **Tech:** Filtered White Noise Buffer + Lowpass Filter + LFO Modulation.
*   **Behavior:** Auto-resumes on interaction, smooth fade-in/out.

## 6. Localization & UI
*   **Bilingual:** All text is provided in English and Chinese.
*   **Structure:** 
    *   \`App.tsx\`: State container.
    *   \`UIOverlay.tsx\`: HUD, Title, Audio Toggle.
    *   \`SceneSelector.tsx\`: Glassmorphism modal for switching scenes.

## 7. Development Rules
1.  **Performance:** Detect \`isMobile\` via window width. Reduce particle counts significantly (e.g., 15k -> 6k) on mobile.
2.  **Memory Management:** Explicitly \`dispose()\` geometries, materials, and renderers in \`useEffect\` cleanup functions.
3.  **Shaders:** Keep shaders inline within \`DreamCanvas.tsx\` for portability.`;

export const MEMORY_STARDUST_CODE = `import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
// Note: In a real environment, you would install 'three' and '@types/three'
// Post-processing usually requires 'three/examples/jsm/...' imports. 
// For this standalone file, we will implement the core visuals using standard Three.js 
// features and custom shaders to ensure it runs robustly without complex bundler configurations for JSM.
import { createNoise3D } from 'simplex-noise'; // Assuming simplex-noise or similar availability, otherwise using Math.random

// --- TYPES & CONSTANTS ---

type Language = 'en' | 'zh';
type SceneType = 'original' | 'nebula' | 'shattered' | 'eclipse' | 'coral' | 'wispy' | 'lorenz';

interface TextContent {
  title: string;
  subtitle: string;
  audioOn: string;
  audioOff: string;
  selectScene: string;
  scenes: Record<SceneType, string>;
}

const TEXT: Record<Language, TextContent> = {
  en: {
    title: "Memory Stardust",
    subtitle: "How does it feel to become a memory?",
    audioOn: "Audio Active",
    audioOff: "Mute Audio",
    selectScene: "Select Memory",
    scenes: {
      original: "Original Memory",
      nebula: "Cosmic Nebula",
      shattered: "Shattered Garden",
      eclipse: "Eclipse Garden",
      coral: "Coral Garden",
      wispy: "Wispy Garden",
      lorenz: "Gaussian Dream"
    }
  },
  zh: {
    title: "记忆星尘",
    subtitle: "成为回忆是怎样的感觉？",
    audioOn: "声音开启",
    audioOff: "静音",
    selectScene: "选择记忆",
    scenes: {
      original: "初始记忆",
      nebula: "宇宙星云",
      shattered: "破碎花园",
      eclipse: "日食花园",
      coral: "珊瑚花园",
      wispy: "缕缕花园",
      lorenz: "高斯梦境"
    }
  }
};

const PALETTE = {
  bg: 0x1a1a2e,
  secondary: 0x16213e,
  particles: 0xffd89b,
  white: 0xf0f0f0,
  coral: 0xff7f50,
  eclipse: 0xfffacd
};

// --- SHADERS ---

const ECLIPSE_VERTEX = \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`;

const ECLIPSE_FRAGMENT = \`
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    
    // Sun
    float sun = smoothstep(0.3, 0.29, dist);
    
    // Moon (moving)
    vec2 moonPos = vec2(0.5 + sin(uTime * 0.2) * 0.3, 0.5 + cos(uTime * 0.15) * 0.05);
    float moonDist = distance(vUv, moonPos);
    float moon = smoothstep(0.28, 0.27, moonDist);
    
    // Corona / Diamond Ring effect
    float corona = 0.0;
    if (sun > 0.1 && moon > 0.1) {
        // Overlap logic handled by subtraction visually
    }
    
    float glow = 0.02 / abs(dist - 0.3 + sin(uTime * 2.0)*0.005);
    
    // Final composite: Sun shape minus Moon shape + Corona Glow
    float shape = clamp(sun - moon, 0.0, 1.0);
    
    vec3 color = uColor * shape;
    color += vec3(1.0, 0.8, 0.5) * glow * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
\`;

const NOISE_VERTEX = \`
  uniform float uTime;
  varying float vNoise;
  
  // Simple pseudo-random noise
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec3 pos = position;
    float n = noise(uv * 3.0 + uTime * 0.5);
    vNoise = n;
    
    // Displacement
    pos.z += n * 0.5;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

const CORAL_FRAGMENT = \`
  uniform vec3 uColor;
  varying float vNoise;
  
  void main() {
    vec3 c = uColor;
    // Mix based on height/noise
    c = mix(c, vec3(1.0, 1.0, 1.0), vNoise * 0.3);
    gl_FragColor = vec4(c, 1.0);
  }
\`;

// --- COMPONENTS ---

// 1. Audio System
const AmbientSound: React.FC<{ active: boolean }> = ({ active }) => {
  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const isInitialized = useRef(false);

  const initAudio = () => {
    if (isInitialized.current) return;
    
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    
    audioCtx.current = new Ctx();
    const ctx = audioCtx.current;

    // White Noise Buffer
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);

    // Filter for "Space Wind"
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    // LFO to modulate filter frequency (Wind swish)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Slow cycle
    lfo.start(0);

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Master Gain
    gainNode.current = ctx.createGain();
    gainNode.current.gain.value = 0;

    // Graph
    whiteNoise.connect(filter);
    filter.connect(gainNode.current);
    gainNode.current.connect(ctx.destination);

    isInitialized.current = true;
  };

  useEffect(() => {
    if (active) {
      if (!isInitialized.current) initAudio();
      audioCtx.current?.resume();
      if (gainNode.current) {
        gainNode.current.gain.setTargetAtTime(0.15, audioCtx.current!.currentTime, 1.5); // Fade in
      }
    } else {
      if (gainNode.current && audioCtx.current) {
        gainNode.current.gain.setTargetAtTime(0, audioCtx.current.currentTime, 0.5); // Fade out
      }
    }
  }, [active]);

  return null;
};

// 2. Dream Canvas (WebGL)
interface DreamCanvasProps {
  sceneType: SceneType;
}

const DreamCanvas: React.FC<DreamCanvasProps> = ({ sceneType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  
  // References to dynamic objects for animation
  const objectsRef = useRef<any[]>([]);

  // Helpers
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const createParticles = (count: number, color: number, spread: number) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randomness = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      
      randomness[i3] = Math.random();
      randomness[i3+1] = Math.random();
      randomness[i3+2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomness, 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: isMobile ? 0.05 : 0.03,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
  };

  const setupScene = (scene: THREE.Scene) => {
    // Clear previous
    objectsRef.current = [];
    while(scene.children.length > 0){ 
      const obj = scene.children[0];
      if((obj as any).geometry) (obj as any).geometry.dispose();
      if((obj as any).material) (obj as any).material.dispose();
      scene.remove(obj); 
    }

    // --- SCENE GENERATION STRATEGIES ---

    if (sceneType === 'original') {
      // PARTICLE AGGREGATION
      const count = isMobile ? 3000 : 8000;
      const particles = createParticles(count, PALETTE.particles, 10);
      scene.add(particles);
      objectsRef.current.push({ type: 'particles_noise', mesh: particles, speed: 0.2 });
    } 
    
    else if (sceneType === 'nebula') {
      // SPIRAL GALAXY
      const count = isMobile ? 4000 : 12000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      
      const colorInside = new THREE.Color(PALETTE.particles);
      const colorOutside = new THREE.Color(PALETTE.secondary);

      for(let i=0; i<count; i++) {
        const i3 = i*3;
        const radius = Math.random() * 5;
        const spinAngle = radius * 5;
        const branchAngle = (i % 3) * ((Math.PI * 2) / 3);
        
        const x = Math.cos(branchAngle + spinAngle) * radius + (Math.random()-0.5)*0.5;
        const y = (Math.random() - 0.5) * (0.5 + radius * 0.1);
        const z = Math.sin(branchAngle + spinAngle) * radius + (Math.random()-0.5)*0.5;

        positions[i3] = x;
        positions[i3+1] = y;
        positions[i3+2] = z;

        const mixedColor = colorInside.clone().lerp(colorOutside, radius / 5);
        colors[i3] = mixedColor.r;
        colors[i3+1] = mixedColor.g;
        colors[i3+2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Points(geometry, material);
      scene.add(mesh);
      objectsRef.current.push({ type: 'rotate', mesh, speed: 0.05 });
    }

    else if (sceneType === 'shattered') {
      // FLOATING GEOMETRY
      const geometry = new THREE.ConeGeometry(0.2, 0.5, 4, 1);
      const material = new THREE.MeshBasicMaterial({ 
        color: PALETTE.white, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      
      const instancedMesh = new THREE.InstancedMesh(geometry, material, 500);
      const dummy = new THREE.Object3D();

      for (let i=0; i<500; i++) {
        dummy.position.set((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
        dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        const scale = Math.random();
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      scene.add(instancedMesh);
      objectsRef.current.push({ type: 'rotate', mesh: instancedMesh, speed: 0.02 });
    }

    else if (sceneType === 'eclipse') {
      // SHADER BASED
      const geometry = new THREE.PlaneGeometry(10, 10);
      const material = new THREE.ShaderMaterial({
        vertexShader: ECLIPSE_VERTEX,
        fragmentShader: ECLIPSE_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(PALETTE.eclipse) }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = -2;
      scene.add(mesh);
      objectsRef.current.push({ type: 'shader', mesh });
    }

    else if (sceneType === 'coral') {
      // NOISE TERRAIN
      const geometry = new THREE.PlaneGeometry(8, 8, 128, 128);
      const material = new THREE.ShaderMaterial({
        vertexShader: NOISE_VERTEX,
        fragmentShader: CORAL_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(PALETTE.coral) }
        },
        wireframe: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 3;
      scene.add(mesh);
      objectsRef.current.push({ type: 'shader', mesh });
    }

    else if (sceneType === 'lorenz') {
      // LORENZ ATTRACTOR (Gaussian approximation)
      const numPoints = isMobile ? 5000 : 15000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(numPoints * 3);
      
      let x = 0.1, y = 0, z = 0;
      const sigma = 10, rho = 28, beta = 8/3;
      const dt = 0.01;

      for (let i = 0; i < numPoints; i++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        
        const i3 = i * 3;
        positions[i3] = x * 0.1;
        positions[i3+1] = y * 0.1;
        positions[i3+2] = z * 0.1 - 2; // Center it
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      // Creating a "splat" look with stretched sprites would require texture loading
      // Falling back to high-opacity additive points for algorithmic purity in single-file
      const material = new THREE.PointsMaterial({
        color: PALETTE.coral,
        size: 0.05,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6
      });

      const mesh = new THREE.Points(geometry, material);
      scene.add(mesh);
      objectsRef.current.push({ type: 'rotate', mesh, speed: 0.1 });
    }
    
    else if (sceneType === 'wispy') {
      // PARTICLE FLOW FIELD
      const count = isMobile ? 2000 : 5000;
      const particles = createParticles(count, 0xaaaaaa, 8);
      scene.add(particles);
      objectsRef.current.push({ type: 'flow', mesh: particles });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Init
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.bg);
    scene.fog = new THREE.FogExp2(PALETTE.bg, 0.05);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup specific scene
    setupScene(scene);

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      // Update objects
      objectsRef.current.forEach(obj => {
        if (obj.type === 'rotate') {
          obj.mesh.rotation.y += obj.speed * 0.1;
        }
        else if (obj.type === 'shader') {
          if (obj.mesh.material.uniforms) {
            obj.mesh.material.uniforms.uTime.value = timeRef.current;
          }
        }
        else if (obj.type === 'particles_noise') {
           const positions = obj.mesh.geometry.attributes.position.array;
           // Subtle wiggle
           for(let i=0; i<positions.length; i+=3) {
             positions[i+1] += Math.sin(timeRef.current + positions[i])*0.002;
           }
           obj.mesh.geometry.attributes.position.needsUpdate = true;
           obj.mesh.rotation.y = timeRef.current * 0.05;
        }
        else if (obj.type === 'flow') {
           const positions = obj.mesh.geometry.attributes.position.array;
           for(let i=0; i<positions.length; i+=3) {
             positions[i] += Math.sin(positions[i+1] * 0.5 + timeRef.current)*0.01;
             positions[i+1] += 0.01;
             if(positions[i+1] > 5) positions[i+1] = -5; // Reset
           }
           obj.mesh.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Camera slight movement
      camera.position.x = Math.sin(timeRef.current * 0.2) * 0.2;
      camera.position.y = Math.cos(timeRef.current * 0.3) * 0.2;
      camera.lookAt(0,0,0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [sceneType]); // Re-init when sceneType changes

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

// 3. UI Overlay
const UIOverlay: React.FC = () => {
  const [scene, setScene] = useState<SceneType>('original');
  const [lang, setLang] = useState<Language>('en');
  const [audio, setAudio] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const t = TEXT[lang];

  const scenes: SceneType[] = ['original', 'nebula', 'shattered', 'eclipse', 'coral', 'wispy', 'lorenz'];

  return (
    <div className="relative w-full h-screen overflow-hidden text-[#f0f0f0] font-sans">
      {/* Canvas Layer */}
      <DreamCanvas sceneType={scene} />
      
      {/* Audio Logic */}
      <AmbientSound active={audio} />

      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="font-serif text-4xl md:text-6xl tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#ffd89b] to-white drop-shadow-lg">
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-2 font-light tracking-wider opacity-80">
            {t.subtitle}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
           <button 
             onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
             className="text-xs border border-white/20 px-2 py-1 rounded hover:bg-white/10 transition-colors"
           >
             {lang.toUpperCase()}
           </button>
           <button 
             onClick={() => setAudio(!audio)}
             className={\`flex items-center gap-2 text-sm border border-white/30 px-4 py-2 rounded-full backdrop-blur-md transition-all duration-500 \${audio ? 'bg-white/20 shadow-[0_0_15px_rgba(255,216,155,0.3)]' : 'bg-transparent hover:bg-white/5'}\`}
           >
             <span className={\`w-2 h-2 rounded-full \${audio ? 'bg-[#ffd89b] animate-pulse' : 'bg-gray-500'}\`} />
             {audio ? t.audioOn : t.audioOff}
           </button>
        </div>
      </div>

      {/* Scene Selector Trigger */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <button 
          onClick={() => setMenuOpen(true)}
          className="group flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="text-xs tracking-[0.2em] uppercase">{t.selectScene}</span>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white to-transparent group-hover:h-12 transition-all duration-300" />
        </button>
      </div>

      {/* Scene Modal */}
      {menuOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e]/80 border border-white/10 p-8 rounded-lg max-w-md w-full shadow-2xl relative overflow-hidden">
            {/* Close Button */}
            <button 
              onClick={() => setMenuOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <h2 className="font-serif text-2xl mb-6 text-center border-b border-white/10 pb-4">
              {t.selectScene}
            </h2>

            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {scenes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScene(s);
                    setMenuOpen(false);
                  }}
                  className={\`text-left px-4 py-3 rounded transition-all duration-300 flex items-center justify-between group \${scene === s ? 'bg-white/10 border-l-2 border-[#ffd89b]' : 'hover:bg-white/5 border-l-2 border-transparent'}\`}
                >
                  <span className={\`text-lg \${scene === s ? 'text-[#ffd89b]' : 'text-gray-300 group-hover:text-white'}\`}>
                    {t.scenes[s]}
                  </span>
                  {scene === s && <span className="text-[10px] text-[#ffd89b] animate-pulse">●</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient-vignette mix-blend-multiply opacity-80" />
      
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, black 50%)', backgroundSize: '100% 4px' }} 
      />
    </div>
  );
};

// Tailwind Custom Config Injection (Simulated here via inline styles where standard classes fail)
// Note: In a real project, add .bg-radial-gradient-vignette { background: radial-gradient(circle, transparent 40%, #000 100%); } to CSS

export default function App() {
  return (
    <>
      <style>{\`
        .bg-radial-gradient-vignette {
          background: radial-gradient(circle, transparent 50%, #000000 150%);
        }
        /* Custom Scrollbar for Modal */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
      \`}</style>
      <UIOverlay />
    </>
  );
}`;

// Generate the HTML for the preview, embedding the code
export const MEMORY_STARDUST_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory Stardust</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "three": "https://esm.sh/three@0.160.0",
        "simplex-noise": "https://esm.sh/simplex-noise@4.0.1"
      }
    }
  </script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; background-color: #1a1a2e; overflow: hidden; }
    /* Fix for overlay */
    .bg-radial-gradient-vignette {
      background: radial-gradient(circle, transparent 50%, #000000 150%);
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    import { createRoot } from 'react-dom/client';
    
    // We inject the code but strip exports and some imports to make it work in this standalone shell
    // We rely on the importmap for the actual module loading
    ${MEMORY_STARDUST_CODE.replace('export default function App', 'function App')}

    // Mount
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

export const INITIAL_GROUPS: TestGroup[] = [
  {
    id: 'g1',
    title: '👀视觉代码生成',
    cases: [
      {
        id: 'c1',
        title: '小红书爆款封面生成器',
        status: CaseStatus.Success,
        prompt: '创建一个小红书封面排版工具，用户只要上传图片和主题就可以生成合适的排版内容。',
        code: XIAOHONGSHU_HTML,
        previewHtml: XIAOHONGSHU_HTML,
      },
      {
        id: 'c2',
        title: '个人传记网站生成',
        status: CaseStatus.Success,
        prompt: '介绍[普林斯顿和爱因斯坦的关系] 生成一个人物传记的网站，适合不同年龄段的人群了解学习',
        code: EINSTEIN_HTML,
        previewHtml: EINSTEIN_HTML,
      },
      {
        id: 'c3',
        title: '记忆星辰（three.js+3D引擎）',
        status: CaseStatus.Success,
        prompt: MEMORY_STARDUST_PROMPT,
        code: MEMORY_STARDUST_CODE,
        previewHtml: MEMORY_STARDUST_HTML,
      }
    ],
  },
];