import React, { useMemo, useState, memo, useCallback, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Person, IncomeLog } from '../types';

interface ResultSectionProps {
    people: Person[];
    rootId: number | null;
}

const COLORS = ['#756a63', '#d4a5a5', '#9caf88', '#c2b2a0', '#a89f99', '#e6e2da', '#9e6d6d', '#4a433e'];

// 1. 算式元件：記憶化處理
const RenderFormula = memo(({ logs, hoverId, onHover }: { logs: IncomeLog[]; hoverId: string | null; onHover: (id: string | null) => void }) => {
    if (!logs || logs.length === 0) return <span className="text-morandi-brown/40">1</span>;
    return (
        <span className="inline-flex flex-wrap items-center gap-y-2">
            {logs.map((log, idx) => {
                const logId = `${log.from}-${log.reason}-${log.amountTxt}`;
                const isActive = hoverId === logId;
                const isSpouse = log.reason.includes('配偶');

                const boxClass = isSpouse
                    ? (isActive ? "bg-morandi-rose text-white border-morandi-rose shadow-md scale-105" : "bg-[#fff2f2] border-morandi-rose/30 text-morandi-rose-dark")
                    : (isActive ? "bg-morandi-brown-dark text-white border-morandi-brown-dark shadow-md scale-105" : "bg-[#fcfbf9] border-morandi-brown/20 text-morandi-brown-dark");

                return (
                    <React.Fragment key={idx}>
                        {idx > 0 && <span className="mx-1.5 text-morandi-brown/30 font-bold">+</span>}
                        <span
                            onMouseEnter={() => onHover(logId)}
                            onMouseLeave={() => onHover(null)}
                            className={`px-2 py-1 rounded-lg border text-[13px] font-bold ${boxClass} shadow-sm inline-flex items-center gap-1 transition-all duration-150 cursor-help`}
                        >
                            <span className="opacity-60">(</span>
                            <RenderFormula logs={log.prevLogs || []} hoverId={hoverId} onHover={onHover} />
                            <span className={`mx-1 font-mono ${isActive ? 'text-white' : 'text-morandi-brown/60'}`}>{log.ratioStr}</span>
                            <span className="opacity-60">)</span>
                        </span>
                    </React.Fragment>
                );
            })}
        </span>
    );
});

// 2. 來源區塊：記憶化處理
const SourceBlock = memo(({ log, hoverId, onHover }: { log: IncomeLog; hoverId: string | null; onHover: (id: string | null) => void }) => {
    const hasHistory = log.prevLogs && log.prevLogs.length > 0;
    const isSpouse = log.reason.includes('配偶');
    const isParent = log.reason.includes('順位') || log.reason.includes('代位') || log.reason.includes('祖父母');

    const logId = `${log.from}-${log.reason}-${log.amountTxt}`;
    const isActive = hoverId === logId;

    const bgColor = isActive
        ? (isSpouse ? 'bg-morandi-rose/5 border-morandi-rose shadow-lg scale-[1.01]' : 'bg-morandi-oat border-morandi-brown-dark shadow-lg scale-[1.01]')
        : (isSpouse ? 'bg-[#fff7f7] border-morandi-rose/30' : (isParent ? 'bg-[#fcfbf9] border-morandi-brown/15' : 'bg-white border-morandi-brown/15'));

    return (
        <div
            onMouseEnter={() => onHover(logId)}
            onMouseLeave={() => onHover(null)}
            className={`rounded-2xl p-4 border shadow-sm overflow-hidden transition-all duration-200 ${bgColor}`}
        >
            <div className={`flex justify-between items-start ${hasHistory ? 'mb-4' : 'mb-0'}`}>
                <div className="flex items-start gap-2 flex-wrap flex-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 mt-0.5 transition-colors ${isActive ? 'bg-white text-morandi-brown-dark border-transparent' : (isSpouse ? 'bg-morandi-rose text-white border-transparent' : 'bg-white/60 text-morandi-brown border-morandi-brown/20')}`}>
                        {log.reason}
                    </span>
                    <span className="text-[16px] font-black text-morandi-brown-dark leading-snug">{log.from}</span>
                    <span className={`text-[13px] font-bold font-mono mt-0.5 transition-colors ${isActive ? 'text-morandi-brown-dark/60' : 'text-morandi-brown/30'}`}>
                        {log.ratioStr}
                    </span>
                </div>
                <div className="text-right shrink-0 ml-4 pt-0.5">
                    <span className={`text-[15px] font-black font-mono transition-colors ${isActive ? 'text-morandi-rose-dark scale-110 inline-block origin-right' : (isSpouse ? 'text-morandi-rose-dark' : 'text-morandi-brown-dark')}`}>
                        +{log.amountTxt}
                    </span>
                </div>
            </div>
            {hasHistory && (
                <div className="pl-4 border-l-2 border-morandi-oat/50 space-y-3">
                    {log.prevLogs.map((prev, idx) => (
                        <SourceBlock key={idx} log={prev} hoverId={hoverId} onHover={onHover} />
                    ))}
                </div>
            )}
        </div>
    );
});

// 3. 繼承人卡片：記憶化處理
const HeirCard = memo(({ heir, index, color }: { heir: Person; index: number; color: string }) => {
    const [hoverId, setHoverId] = useState<string | null>(null);
    const percentage = useMemo(() => (Number(heir.share.n) / Number(heir.share.d) * 100), [heir.share]);

    const changeHover = useCallback((id: string | null) => setHoverId(id), []);

    const handleCopy = () => {
        const text = `${heir.name} 的繼承份額為：${heir.shareTxt} (${percentage.toFixed(2)}%)`;
        navigator.clipboard.writeText(text);
        alert('已複製比例資訊');
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-float p-6 md:p-8 hover:translate-y-[-4px] transition-all duration-300 border border-morandi-oat/40 print-break-inside-avoid relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: color }}></div>
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-morandi-oat/40 ml-2">
                <div className="flex items-center gap-4">
                    <span className="w-12 h-12 flex items-center justify-center bg-morandi-oat text-morandi-brown-dark font-black text-lg rounded-2xl shadow-inner border border-black/5">
                        {index + 1}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-[20px] font-black text-morandi-brown-dark tracking-tighter">{heir.name}</h4>
                            <button onClick={handleCopy} className="p-1.5 text-morandi-brown/30 hover:text-morandi-brown-dark transition-colors no-print">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] text-morandi-brown/50 font-black uppercase tracking-wider">法定繼承人</span>
                            {heir.incomeLog.some(l => l.reason.includes('代位')) && (
                                <span className="text-[10px] bg-morandi-sage text-white font-black px-1.5 py-0.5 rounded shadow-sm">代位權</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[24px] font-black text-morandi-rose-dark font-mono leading-none tracking-tighter">{heir.shareTxt}</div>
                    <div className="mt-2 h-1.5 w-24 bg-morandi-oat rounded-full overflow-hidden ml-auto">
                        <div className="h-full transition-all duration-1000" style={{ backgroundColor: color, width: `${percentage}%` }}></div>
                    </div>
                    <div className="text-[11px] text-morandi-brown/40 font-black mt-2 tracking-widest uppercase text-right">占比 {percentage.toFixed(2)}%</div>
                </div>
            </div>
            <div className="ml-2 space-y-4">
                <h5 className="text-[12px] font-black text-morandi-brown/40 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-morandi-rose animate-pulse"></span>
                    分配路徑溯源
                </h5>
                <div className="space-y-3">
                    {heir.incomeLog.map((log, idx) => (
                        <SourceBlock key={idx} log={log} hoverId={hoverId} onHover={changeHover} />
                    ))}
                </div>
            </div>
            <div className="mt-6 ml-2 p-5 bg-morandi-oat/20 rounded-2xl border border-morandi-oat/40 transition-all group-hover:bg-morandi-oat/30">
                <h5 className="text-[11px] font-black text-morandi-brown/40 uppercase tracking-widest mb-3 px-1">演算關係式</h5>
                <div className="leading-relaxed">
                    <RenderFormula logs={heir.incomeLog} hoverId={hoverId} onHover={changeHover} />
                </div>
            </div>
        </div>
    );
});

const ResultSection: React.FC<ResultSectionProps> = ({ people, rootId }) => {
    const heirs = useMemo(() => people.filter(p => Number(p.share.n) > 0), [people]);

    // --- 效能優化：限制初始顯示數量 ---
    const PAGE_SIZE = 12;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // 當繼承對象改變時重置顯示數量
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [rootId]);

    const chartData = useMemo(() => {
        // 如果繼承人過多 (如 56 人案)，圓餅圖僅顯示前 15 大，其餘歸類為「其他」以優化效能與視覺
        if (heirs.length <= 20) {
            return heirs.map(h => ({
                name: h.name,
                value: Number(h.share.n) / Number(h.share.d),
                shareTxt: h.shareTxt
            }));
        } else {
            const sorted = [...heirs].sort((a, b) =>
                (Number(b.share.n) * Number(a.share.d) > Number(a.share.n) * Number(b.share.d) ? 1 : -1)
            );
            const top = sorted.slice(0, 15).map(h => ({
                name: h.name,
                value: Number(h.share.n) / Number(h.share.d),
                shareTxt: h.shareTxt
            }));
            const othersValue = sorted.slice(15).reduce((acc, h) => acc + (Number(h.share.n) / Number(h.share.d)), 0);
            return [...top, { name: '其他繼承人', value: othersValue, shareTxt: '其餘分配額' }];
        }
    }, [heirs]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-md p-5 shadow-2xl rounded-[1.5rem] border border-morandi-oat/50">
                    <p className="text-[17px] font-black text-morandi-brown-dark flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: payload[0].color }}></span>
                        {data.name}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-[26px] font-black text-morandi-rose-dark font-mono leading-none">
                            {(payload[0].value * 100).toFixed(2)}%
                        </span>
                        <span className="text-[15px] text-morandi-brown/50 font-black">({data.shareTxt})</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (heirs.length === 0) {
        if (!rootId) return null;
        return (
            <div className="mt-12 p-20 text-center bg-white rounded-[3.5rem] shadow-float border border-morandi-oat/20 no-print">
                <div className="w-24 h-24 bg-morandi-oat/40 rounded-full flex items-center justify-center mx-auto mb-8 text-morandi-brown/30 shadow-inner">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                </div>
                <h4 className="text-morandi-brown-dark text-[22px] font-black tracking-tight">等待分配計算中</h4>
                <p className="text-[15px] text-morandi-brown/50 mt-4 font-black max-w-sm mx-auto leading-relaxed">請確認上方已選擇被繼承人且有合法的繼承人結構。</p>
            </div>
        );
    }

    const showAll = () => setVisibleCount(heirs.length);

    return (
        <div className="mt-12 pb-16">
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-16 bg-white rounded-[3rem] shadow-float p-8 md:p-12 border border-morandi-oat/20 overflow-hidden relative no-print">
                <div className="absolute top-0 right-0 w-64 h-64 bg-morandi-oat/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                <div className="flex-1 w-full order-2 lg:order-1">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-8 bg-morandi-rose rounded-full"></div>
                        <div>
                            <h3 className="text-[24px] font-black text-morandi-brown-dark tracking-tighter">分配比例概覽</h3>
                            <p className="text-[14px] text-morandi-brown/50 font-black">目前識別出 {heirs.length} 位繼承人</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                        {heirs.map((h, i) => {
                            const percent = (Number(h.share.n) / Number(h.share.d) * 100).toFixed(2);
                            return (
                                <div key={h.id} className="flex items-center justify-between bg-morandi-oat/20 p-4 rounded-2xl border border-transparent hover:border-morandi-oat transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-[15px] font-black text-morandi-brown-dark">{h.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[14px] font-black text-morandi-brown-dark font-mono">{percent}%</div>
                                        <div className="text-[11px] text-morandi-brown/40 font-bold">{h.shareTxt}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="w-full lg:w-[400px] h-[350px] md:h-[400px] flex items-center justify-center relative order-1 lg:order-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={130}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                isAnimationActive={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === '其他繼承人' ? '#e2e2e0' : COLORS[index % COLORS.length]} className="outline-none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-[13px] font-black text-morandi-brown/20 tracking-[0.3em] uppercase">法定繼承占比</span>
                        <span className="text-[15px] font-black text-morandi-brown/50 mt-1">總額 100%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
                {heirs.slice(0, visibleCount).map((heir, idx) => (
                    <HeirCard key={heir.id} heir={heir} index={idx} color={COLORS[idx % COLORS.length]} />
                ))}
            </div>

            {heirs.length > visibleCount && (
                <div className="text-center no-print">
                    <button
                        onClick={showAll}
                        className="px-10 py-4 bg-morandi-brown-dark text-white rounded-2xl font-black text-[15px] shadow-float hover:scale-105 transition-all active:scale-95"
                    >
                        顯示剩餘 {heirs.length - visibleCount} 位繼承人細節
                    </button>
                    <p className="text-morandi-brown/30 text-[12px] mt-4 font-bold">為確保大數據量下的瀏覽順暢，系統已自動分段載入</p>
                </div>
            )}
        </div>
    );
};

export default ResultSection;